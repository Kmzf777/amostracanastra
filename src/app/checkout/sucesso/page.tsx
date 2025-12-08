"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function CheckoutSuccessPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const pid = typeof window !== "undefined" ? localStorage.getItem("payment_link_id") : null;
        if (pid) setTransactionId(pid);
        if (supabase && pid) {
          const { data } = await supabase
            .from("vendas_amostra")
            .select("id")
            .eq("payment_link_id", pid)
            .limit(1);
          if (data && data.length > 0) setOrderId(String(data[0].id));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold tracking-wider uppercase mb-3">Tudo certo</div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">Pagamento Aprovado!</h1>
          <p className="mt-3 text-gray-700 text-base sm:text-lg">
            Seu pagamento foi confirmado com sucesso e seu
            <span className="text-amber-700 font-semibold"> pedido já está sendo preparado</span>!
          </p>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Enviamos mais informações no seu e-mail!</p>
          <p className="mt-1 text-gray-600 text-sm sm:text-base">Aproveite para conhecer mais sobre o Café Canastra.</p>
        </div>

        <div className="w-full max-w-md mx-auto rounded-xl border border-gray-200 bg-white shadow-lg p-6 sm:p-8 text-left">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes da confirmação</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-4 text-sm text-gray-600">
              <span>ID do Pedido</span>
              <span className="text-gray-900 font-medium">{loading ? "Carregando..." : orderId || "-"}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>ID da Transação</span>
              <span className="text-gray-900 font-medium break-all">{loading ? "Carregando..." : transactionId || "-"}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="https://loja.cafecanastra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Conhecer Loja
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}