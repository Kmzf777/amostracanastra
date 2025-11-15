"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ObrigadoPage() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id") || params.get("collection_id");
  const externalReference = params.get("external_reference");

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento aprovado</h1>
          <p className="text-gray-600">Obrigado! Seu pedido foi confirmado.</p>
          {paymentId && (
            <p className="text-gray-500 text-sm mt-2">Pagamento: {paymentId}</p>
          )}
          {externalReference && (
            <p className="text-gray-500 text-sm">Referência: {externalReference}</p>
          )}
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
        >
          Voltar ao Início
        </Link>
      </div>
    </main>
  );
}