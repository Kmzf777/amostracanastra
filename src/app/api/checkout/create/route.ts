import { NextRequest, NextResponse } from 'next/server';
import { checkoutRequestSchema } from '@/lib/schemas/checkout';
import MercadoPagoClient from '@/lib/mercadopago';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    // 1. Parse e valida dados de entrada
    const body = await request.json();

    console.log('📥 Dados recebidos:', JSON.stringify(body, null, 2));

    const validation = checkoutRequestSchema.safeParse(body);

    if (!validation.success) {
      console.error('❌ Validação falhou:', validation.error.errors);
      return NextResponse.json(
        {
          error: 'Dados inválidos',
          details: validation.error.errors,
          received: body // Incluir dados recebidos para debug
        },
        { status: 400 }
      );
    }

    console.log('✅ Validação bem-sucedida');

    const { code, customer, product } = validation.data;
    const supabase = getSupabaseServer();

    // 2. Gera external_reference único
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const externalReference = `AMO-${timestamp}-${random}`;

    console.log('🆔 External Reference gerado:', externalReference);

    // 3. Prepara dados para Mercado Pago
    const mpClient = MercadoPagoClient.getInstance();
    const preference = mpClient.createPreference();

    // Extrai DDD e número do telefone
    const phoneClean = customer.phone.replace(/\D/g, '');
    const areaCode = phoneClean.substring(0, 2);
    const phoneNumber = phoneClean.substring(2);

    // 4. Cria preferência no Mercado Pago
    const preferenceData = {
      items: [
        {
          id: 'amostra-cafe-canastra',
          title: product.name,
          description: 'Amostra de café especial com frete grátis',
          category_id: 'food',
          quantity: product.quantity,
          currency_id: 'BRL',
          unit_price: product.price
        }
      ],
      payer: {
        name: customer.full_name,
        email: customer.email,
        phone: {
          area_code: areaCode,
          number: phoneNumber
        },
        identification: {
          type: 'CPF',
          number: customer.cpf
        },
        address: {
          zip_code: customer.postal_code,
          street_name: customer.address_line1,
          street_number: parseInt(customer.number) || 0
        }
      },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/sucesso`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/falha`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/pendente`
      },
      // notification_url DEVE ser uma URL pública acessível pelo Mercado Pago
      notification_url: `${process.env.MERCADO_PAGO_NOTIFICATION_URL || process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/mercado-pago`,
      external_reference: externalReference,
      statement_descriptor: 'CAFE CANASTRA',
      payment_methods: {
        installments: 1
      }
    };

    console.log('🚀 Criando preferência no Mercado Pago...');
    const mpResponse = await preference.create({ body: preferenceData });

    console.log('✅ Preferência criada:', mpResponse.id);

    // 5. Salva ordem no Supabase ANTES de retornar
    const { data: vendaAmostra, error: insertError } = await supabase
      .from('vendas_amostra')
      .insert({
        external_reference: externalReference,
        mp_preference_id: mpResponse.id,
        init_point: mpResponse.init_point,
        affiliate_code: code,
        customer_email: customer.email,
        customer_name: customer.full_name,
        transaction_amount: product.price,
        payment_status: 'pending',
        payment_link_status: false,
        integration_type: 'direct',
        order_status: 'pending',
        cpf: customer.cpf,
        nome_completo: customer.full_name
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao salvar no banco:', insertError);
      return NextResponse.json(
        { error: 'Erro ao salvar pedido', details: insertError.message },
        { status: 500 }
      );
    }

    console.log('💾 Pedido salvo no banco:', vendaAmostra.id);

    // 6. Retorna dados para frontend
    return NextResponse.json({
      success: true,
      init_point: mpResponse.init_point,
      preference_id: mpResponse.id,
      external_reference: externalReference,
      sandbox_init_point: mpResponse.sandbox_init_point // Para testes
    });

  } catch (error) {
    console.error('❌ Erro no checkout:', error);

    return NextResponse.json(
      {
        error: 'Erro ao processar checkout',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
