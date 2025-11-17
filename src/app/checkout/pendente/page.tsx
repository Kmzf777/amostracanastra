"use client";

import { Clock, Home, Info, Mail } from "lucide-react";
import Link from "next/link";

export default function CheckoutPendingPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pagamento Pendente</h1>
          <p className="text-gray-600">
            Seu pagamento está sendo processado. Assim que for confirmado, enviaremos suas amostras.
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Info className="w-5 h-5 text-yellow-600" />
            <h2 className="text-lg font-semibold text-yellow-900">Informações Importantes</h2>
          </div>
          <ul className="text-yellow-800 text-sm space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>Se você pagou com boleto, a confirmação pode levar até 3 dias úteis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>Você receberá um e-mail quando o pagamento for confirmado</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>Mantenha o comprovante do pagamento em segurança</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5">•</span>
              <span>As amostras serão enviadas após a confirmação do pagamento</span>
            </li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Fique Atento</h3>
          </div>
          <p className="text-blue-800 text-sm text-left">
            Verifique sua caixa de entrada (e spam) para e-mails sobre o status do seu pedido.
          </p>
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