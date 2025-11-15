import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

async function fetchPaymentDetails(id: string) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN || "";
  const res = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("payment_fetch_failed");
  return res.json();
}

function mapStatus(status: string) {
  switch (status) {
    case "approved":
      return "paid";
    case "pending":
    case "in_process":
      return "pending_payment";
    case "rejected":
    case "cancelled":
      return "failed";
    case "refunded":
      return "refunded";
    case "charged_back":
      return "chargeback";
    default:
      return "pending_payment";
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const type = body?.type || body?.action || "";
    const paymentId = body?.data?.id || body?.data_id || body?.id;

    if (type && String(type).includes("payment") && paymentId) {
      console.log('webhook_received', { type, paymentId });
      const payment = await fetchPaymentDetails(String(paymentId));
      const status = payment?.status as string;
      const externalRef = String(payment?.external_reference || "");

      if (!externalRef) {
        return NextResponse.json({ message: "missing_external_reference" }, { status: 200 });
      }

      const supabase = getSupabaseServer();
      const paddedRef = externalRef.length === 6 ? externalRef + "   " : externalRef;

      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("order_code", paddedRef)
        .limit(1)
        .maybeSingle();

      if (!customer?.id) {
        return NextResponse.json({ message: "customer_not_found", external_reference: externalRef }, { status: 200 });
      }

      const { data: order } = await supabase
        .from("orders")
        .select("id, status, created_at")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!order?.id) {
        return NextResponse.json({ message: "order_not_found", external_reference: externalRef }, { status: 200 });
      }

      const newStatus = mapStatus(status);
      if (order.status === newStatus) {
        return NextResponse.json({ message: "already_processed", paymentId, status }, { status: 200 });
      }

      await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", order.id);

      console.log('webhook_update', { external_reference: externalRef, order_id: order.id, newStatus });
      return NextResponse.json({ message: "ok", paymentId, status, external_reference: externalRef }, { status: 200 });
    }

    return NextResponse.json({ message: "ignored" }, { status: 200 });
  } catch (error) {
    console.error('webhook_failure', { message: error instanceof Error ? error.message : 'unknown_error' });
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';