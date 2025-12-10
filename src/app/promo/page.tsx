"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Truck, Coffee, Ticket, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

function PromoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  const handleProceed = () => {
    if (code) {
      router.push(`/checkout?code=${code}`);
    } else {
      router.push('/');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        
        {/* Header / Logo */}
        <div className="flex justify-center mb-8 md:mb-12">
           <Image
            src="/logo-canastra.png"
            alt="Café Canastra"
            width={160}
            height={64}
            className="object-contain h-12 md:h-16 w-auto"
            priority
            quality={100}
            unoptimized
          />
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-100">
          <div className="grid md:grid-cols-2 gap-0">
            
            {/* Image Section */}
            <div className="relative bg-amber-50 flex items-center justify-center p-8 md:p-12 order-first md:order-last">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-200/30 to-transparent" />
              <div className="relative z-10 transform transition-transform duration-700 hover:scale-105">
                <Image
                  src="/amostra.png"
                  alt="Kit Amostra Grátis Café Canastra"
                  width={400}
                  height={250}
                  className="drop-shadow-2xl w-full max-w-[320px] md:max-w-full"
                  priority
                  quality={100}
                  unoptimized
                />
                {/* Badge */}
                <div className="absolute -top-4 -right-4 bg-red-600 text-white text-xs md:text-sm font-bold px-3 py-1.5 rounded-full shadow-lg">
                  RESTAM POUCAS UNIDADES
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 md:p-10 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-6" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                AMOSTRA GRÁTIS
                <span className="block text-amber-600">DE CAFÉ CANASTRA</span>
              </h1>

              <div className="space-y-5 mb-8">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-2 rounded-lg shrink-0">
                    <Truck className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Você paga apenas o frete</p>
                    <p className="text-sm text-gray-600">Apenas R$ 24,90 para envio seguro</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-2 rounded-lg shrink-0">
                    <Coffee className="w-6 h-6 text-amber-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Receba café especial em casa</p>
                    <p className="text-sm text-gray-600">3 amostras selecionadas da Canastra</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 p-2 rounded-lg shrink-0">
                    <Ticket className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dinheiro de volta</p>
                    <p className="text-sm text-gray-600">Ganhe um cupom no valor do frete para sua próxima compra</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-8">
                <div className="flex items-center gap-2 text-gray-800 font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                  <p>Resumindo: você prova o café <span className="font-bold text-green-600">sem custo nenhum</span>.</p>
                </div>
              </div>

              <button
                onClick={handleProceed}
                className="group w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-amber-200 transition-all duration-200 transform hover:-translate-y-1 text-lg"
              >
                PEDIR MINHA AMOSTRA
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </button>
              
              <p className="text-center text-xs text-gray-400 mt-4">
                Oferta válida por tempo limitado ou enquanto durarem os estoques.
              </p>
            </div>
          </div>
        </div>

        {/* Footer / Trust Indicators */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-gray-500 text-xs md:text-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <span>Pagamento Seguro</span>
          </div>
          <div className="flex flex-col items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <span>Satisfação Garantida</span>
          </div>
          <div className="flex flex-col items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <span>Entrega Rápida</span>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function PromoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>}>
      <PromoContent />
    </Suspense>
  );
}
