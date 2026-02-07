"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Mail, ExternalLink } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

interface OrderData {
  id: number;
  external_reference: string;
  customer_name: string;
  customer_email: string;
  transaction_amount: number;
  payment_status: string;
  payment_method: string;
  created_at: string;
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Mercado Pago redireciona com query params: external_reference, payment_id, status, etc.
        const externalRef = searchParams.get("external_reference");
        const savedRef = typeof window !== "undefined" ? localStorage.getItem("external_reference") : null;
        // Fallback para payment_link_id (compatibilidade)
        const savedPid = typeof window !== "undefined" ? localStorage.getItem("payment_link_id") : null;

        const ref = externalRef || savedRef;

        if (supabase && ref) {
          const { data } = await supabase
            .from("vendas_amostra")
            .select("id, external_reference, customer_name, customer_email, transaction_amount, payment_status, payment_method, created_at")
            .eq("external_reference", ref)
            .limit(1)
            .single();

          if (data) {
            setOrder(data as OrderData);
          }
        } else if (supabase && savedPid) {
          // Fallback para busca por payment_link_id (pedidos antigos)
          const { data } = await supabase
            .from("vendas_amostra")
            .select("id, external_reference, customer_name, customer_email, transaction_amount, payment_status, payment_method, created_at")
            .eq("payment_link_id", savedPid)
            .limit(1)
            .single();

          if (data) {
            setOrder(data as OrderData);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Pagamento Aprovado!</h1>
          <p className="mt-2 text-gray-600">Obrigado pela sua compra</p>
        </div>

        {/* Comprovante */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Título do comprovante */}
          <div className="bg-gray-900 text-white px-6 py-4">
            <h2 className="text-lg font-semibold">Comprovante de Pagamento</h2>
          </div>

          {/* Detalhes */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-500">ID do Pedido</span>
              <span className="text-sm font-bold text-gray-900">
                {loading ? "..." : order?.id ? `#${order.id}` : "-"}
              </span>
            </div>

            {order?.customer_name && (
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <span className="text-sm text-gray-500">Cliente</span>
                <span className="text-sm font-medium text-gray-900">{order.customer_name}</span>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-500">Valor</span>
              <span className="text-sm font-bold text-green-600">
                R$ {order?.transaction_amount?.toFixed(2) || "24,90"}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-sm text-gray-500">Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Aprovado
              </span>
            </div>

            {order?.created_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Data</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(order.created_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Aviso de rastreio */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Mail className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900 text-sm">Fique de olho no seu e-mail</h3>
              <p className="mt-1 text-amber-800 text-sm">
                Enviaremos o link de rastreio em seu e-mail assim que seu pedido for despachado.
              </p>
            </div>
          </div>
        </div>

        {/* Aviso sobre amostra */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 text-sm">Seu pedido</h3>
              <p className="mt-1 text-blue-800 text-sm">
                Seu pedido já está sendo preparado. O prazo estimado de entrega é de 5 a 10 dias úteis.
              </p>
            </div>
          </div>
        </div>

        {/* Botão */}
        <div className="mt-8 text-center">
          <Link
            href="https://loja.cafecanastra.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <ExternalLink className="w-5 h-5" />
            Ir para a Loja
          </Link>
        </div>
      </div>
    </main>
  );
}
