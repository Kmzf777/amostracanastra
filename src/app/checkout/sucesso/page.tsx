"use client";

import { useEffect } from "react";
import { CheckCircle, Home, Package } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    // Opcional: Limpar dados do carrinho ou sessão aqui
    console.log('Pagamento aprovado - dados da sessão limpos');
  }, []);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamento Aprovado!</h1>
          <p className="text-gray-600">
            Seu pagamento foi confirmado com sucesso. Em breve suas amostras serão enviadas.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-green-900">Próximos Passos</h2>
          </div>
          <ul className="text-green-800 text-sm space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Seu pedido foi confirmado e está em preparação</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Você receberá um e-mail com os detalhes do envio</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>As amostras serão enviadas para o endereço fornecido</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </Link>
        </div>
      </div>
    </main>
  );
}