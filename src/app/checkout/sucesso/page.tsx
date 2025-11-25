"use client";

import { useEffect } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutSuccessPage() {
  useEffect(() => {
    // Opcional: Limpar dados do carrinho ou sessão aqui
    console.log('Pagamento aprovado - dados da sessão limpos');
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

        <div className="mt-6">
          <p className="text-xs font-semibold tracking-wider text-amber-700 uppercase mb-2">Rastreie Aqui</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="https://rastreio.cafecanastra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Rastrear Pedido
            </Link>
            <Link
              href="https://loja.cafecanastra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center border border-amber-600 text-amber-700 hover:bg-amber-50 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Conhecer Loja
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}