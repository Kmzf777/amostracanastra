"use client";

import { AlertCircle, Home, RefreshCw, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function CheckoutFailurePage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamento Não Aprovado</h1>
          <p className="text-gray-600">
            Infelizmente não foi possível processar seu pagamento. Tente novamente com outro método de pagamento.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <MessageCircle className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-900">Possíveis Causas</h2>
          </div>
          <ul className="text-red-800 text-sm space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Cartão com limite insuficiente</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Dados do cartão incorretos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Problemas com a operadora do cartão</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Tente outro cartão ou método de pagamento</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar Novamente
          </Link>
          
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </Link>
        </div>
      </div>
    </main>
  );
}