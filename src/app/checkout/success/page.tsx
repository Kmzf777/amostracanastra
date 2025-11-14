"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [externalReference, setExternalReference] = useState<string | null>(null);

  useEffect(() => {
    const payment_id = searchParams.get("payment_id");
    const external_reference = searchParams.get("external_reference");
    
    if (payment_id) setPaymentId(payment_id);
    if (external_reference) setExternalReference(external_reference);
    
    // Here you could update the order status in your database
    // to mark it as paid
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pagamento Aprovado!
          </h1>
          <p className="text-gray-600">
            Seu pagamento foi confirmado com sucesso.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Detalhes do Pedido
          </h2>
          {paymentId && (
            <div className="text-sm text-gray-600 mb-2">
              <strong>ID do Pagamento:</strong> {paymentId}
            </div>
          )}
          {externalReference && (
            <div className="text-sm text-gray-600">
              <strong>Referência:</strong> {externalReference}
            </div>
          )}
          <div className="text-sm text-gray-600 mt-4">
            <p>
              Suas amostras de café serão enviadas em breve para o endereço fornecido.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
        >
          Voltar ao Início
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </main>
  );
}