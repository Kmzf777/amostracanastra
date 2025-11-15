import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { createPreference, MercadoPagoPreference } from "@/lib/mercadopago";

type Customer = {
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
};

type Shipment = {
  receiver_name: string;
  address_line1: string;
  address_line2?: string;
  number: string;
  district: string;
  city: string;
  state: string;
  postal_code: string;
};

function onlyDigits(v: string) { return v.replace(/\D/g, ""); }

function isValidCPF(cpf: string) {
  const s = onlyDigits(cpf);
  if (s.length !== 11 || /^([0-9])\1+$/.test(s)) return false;
  const calc = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += parseInt(base[i], 10) * (factor - i);
    const mod = (sum * 10) % 11;
    return mod === 10 ? 0 : mod;
  };
  const d1 = calc(s.slice(0, 9), 10);
  const d2 = calc(s.slice(0, 10), 11);
  return d1 === parseInt(s[9], 10) && d2 === parseInt(s[10], 10);
}

function shippingForState(state: string) {
  // Placeholder até definição: tarifa plana
  return 19.9;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const code = body?.code as string | undefined;
  const customer = body?.customer as Customer | undefined;
  const shipment = body?.shipment as Shipment | undefined;

  // Handle both 6-digit and 9-character formats like in code validation
  let searchCode = code;
  if (code && code.length === 6 && /^\d{6}$/.test(code)) {
    // If user entered 6 digits, pad with spaces to match database format
    searchCode = code + '   ';
  }
  
  // Validate the code format
  if (!code || (!/^\d{6}$/.test(code.trim()) && !(code.length === 9 && /^\d{6}\s{3}$/.test(code)))) {
    return NextResponse.json({ error: "invalid_code" }, { status: 400 });
  }
  if (!customer || !shipment) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }
  if (!isValidCPF(customer.cpf)) {
    return NextResponse.json({ error: "invalid_cpf" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  // Generate unique 6-digit order code (distinct from affiliates codes)
  async function generateUniqueOrderCode() {
    function randomSix() {
      return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    }
    while (true) {
      const candidate = randomSix();
      const padded = candidate + '   ';
      const { data: exists } = await supabase
        .from('affiliates')
        .select('id')
        .eq('code', padded)
        .limit(1)
        .maybeSingle();
      if (!exists) return candidate;
    }
  }
  const { data: affiliate, error: affErr } = await supabase
    .from("affiliates").select("id, status, code").eq("code", searchCode).limit(1).maybeSingle();
  if (affErr) return NextResponse.json({ error: "db_error" }, { status: 500 });
  if (!affiliate || affiliate.status !== "active") return NextResponse.json({ error: "not_found" }, { status: 404 });

  const shipping_amount = shippingForState(shipment.state);
  const subtotal = 0;
  const total_amount = shipping_amount;

  // Create or update customer and persist new order_code
  const order_code = await generateUniqueOrderCode();

  const { data: cust, error: custErr } = await supabase
    .from("customers")
    .upsert({
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      cpf: customer.cpf,
      order_code: order_code + '   ',
    }, { onConflict: "email" })
    .select("id")
    .maybeSingle();
  if (custErr) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      affiliate_id: affiliate.id,
      code: affiliate.code,
      customer_id: cust?.id,
      status: "pending_payment",
      currency: "BRL",
      subtotal,
      shipping_amount,
      total_amount,
    })
    .select("id")
    .maybeSingle();
  if (orderErr || !order) return NextResponse.json({ error: "db_error" }, { status: 500 });

  const { error: shipErr } = await supabase
    .from("shipments")
    .insert({
      order_id: order.id,
      receiver_name: shipment.receiver_name,
      address_line1: shipment.address_line1,
      address_line2: shipment.address_line2 || null,
      number: shipment.number,
      district: shipment.district,
      city: shipment.city,
      state: shipment.state,
      postal_code: shipment.postal_code,
    });
  if (shipErr) return NextResponse.json({ error: "db_error" }, { status: 500 });

  // Create Mercado Pago preference
  const external_reference = order_code;
  
  // Extract area code from phone (assuming Brazilian format)
  const phoneDigits = onlyDigits(customer.phone);
  const area_code = phoneDigits.length >= 10 ? phoneDigits.substring(0, 2) : '11';
  const phone_number = phoneDigits.length >= 10 ? phoneDigits.substring(2) : phoneDigits;
  
  const hdrs = await headers();
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const origin = `${proto}://${host}`;
  const siteUrl = process.env.SITE_URL || origin;

  const preferenceData: MercadoPagoPreference = {
    items: [
      {
        id: 'frete-amostras-cafe',
        title: 'Frete Amostra Grátis Café Canastra',
        description: 'Pagamento referente ao frete para envio da amostra grátis do Café Canastra.',
        quantity: 1,
        unit_price: shipping_amount,
        currency_id: 'BRL'
      }
    ],
    payer: {
      name: customer.full_name,
      email: customer.email,
      identification: {
        type: 'CPF' as const,
        number: onlyDigits(customer.cpf)
      },
      phone: {
        area_code: area_code,
        number: phone_number
      }
    },
    shipments: {
      receiver_address: {
        zip_code: onlyDigits(shipment.postal_code),
        street_name: shipment.address_line1,
        street_number: shipment.number,
        neighborhood: shipment.district,
        city: shipment.city,
        federal_unit: shipment.state,
        complement: shipment.address_line2 || undefined
      }
    },
    external_reference: external_reference,
    back_urls: {
      success: `https://amostra.cafecanastra.com/obrigado`,
      failure: `https://amostra.cafecanastra.com/erro-pagamento`,
      pending: `https://amostra.cafecanastra.com/pendente`
    },
    auto_return: 'approved',
    notification_url: `${siteUrl}/webhook/pagamento`,
    statement_descriptor: 'Cafe Canastra',
    payment_methods: {
      excluded_payment_types: [
        { id: 'ticket' }, // Exclude boleto
        { id: 'atm' }     // Exclude ATM
      ],
      installments: 1 // No installments for this amount
    }
  };

  try {
    const preference = await createPreference(preferenceData);
    
    return NextResponse.json({
      init_point: preference.init_point,
      preference_id: preference.id,
      external_reference,
      order_id: order.id,
    }, { status: 200 });
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    return NextResponse.json({ error: "payment_error" }, { status: 500 });
  }
}
