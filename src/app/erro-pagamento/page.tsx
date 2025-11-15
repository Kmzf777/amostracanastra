"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ErroPagamentoPage() {
  const params = useSearchParams();
  const status = params.get("collection_status") || params.get("status");
  const paymentId = params.get("payment_id") || params.get("collection_id");

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro no pagamento</h1>
          <p className="text-gray-600">Não foi possível concluir o pagamento.</p>
          {status && (
            <p className="text-gray-500 text-sm mt-2">Status: {status}</p>
          )}
          {paymentId && (
            <p className="text-gray-500 text-sm">Pagamento: {paymentId}</p>
          )}
        </div>
        <Link
          href="/checkout"
          className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow transition-all duration-200"
        >
          Tentar novamente
        </Link>
      </div>
    </main>
  );
}