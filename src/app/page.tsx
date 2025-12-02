"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PinInput6Mobile from "@/components/ui/pin-input-6-mobile";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

function HomePageContent() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    // Setup inicial - apenas logar que está funcionando
    console.log("Aplicação iniciada - Supabase conectado");
  }, []);

  const validateCode = useCallback(async (codeToValidate: string) => {
    try {
      const res = await fetch('/api/codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToValidate })
      })

      if (!res.ok) {
        setModalOpen(true)
        setLoading(false)
        return
      }

      const json = await res.json()
      if (json?.valid) {
        router.push(`/promo?code=${codeToValidate}`)
        return
      }

      setModalOpen(true)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao validar código:', error)
      setModalOpen(true)
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    const urlCode = (sp.get("code") || "").trim();
    if (/^\d{6}$/.test(urlCode)) {
      setLoading(true);
      setCode(urlCode);
      validateCode(urlCode);
    }
  }, [sp, validateCode]);

  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.length !== 6) return;
    setLoading(true);
    
    await validateCode(code);
  }

  return (
    <main className="fixed inset-0 bg-white overflow-hidden">
      <div className="h-screen w-full flex flex-col items-center justify-center px-4 py-1">
        <div className="w-full max-w-xs mx-auto space-y-2 flex flex-col items-center justify-center">
          {/* Logo - Mobile optimized with reduced top margin */}
          <div className="text-center flex-shrink-0 mb-1">
            <Image
              src="/logo-canastra.png"
              alt="Café Canastra"
              width={120}
              height={48}
              className="mx-auto object-contain md:w-[140px] md:h-auto"
              priority
              quality={100}
              unoptimized
            />
          </div>

          {/* Title - Mobile optimized with better font */}
          <div className="text-center flex-shrink-0">
            <h1 className="text-xl font-black text-gray-900 leading-tight md:text-2xl" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              RESGATE SUAS
              <br />
              <span className="text-amber-600 text-2xl md:text-3xl">3 AMOSTRAS GRÁTIS!</span>
            </h1>
          </div>

          {/* Banner - Mobile optimized with correct image path - 30% larger */}
          <div className="text-center flex-shrink-0 w-full max-w-[260px] md:max-w-[280px]">
            <Image
              src="/amostra.png"
              alt="Amostras de Café"
              width={260}
              height={163}
              className="mx-auto rounded-lg object-contain md:w-[280px] md:h-[175px]"
              priority
              quality={100}
              unoptimized
            />
          </div>

          {/* Pin Input - Mobile optimized with reduced size */}
          <div className="text-center space-y-1 flex-shrink-0 w-full">
            <p className="text-gray-700 text-sm md:text-base">
              Digite seu código de 6 dígitos
            </p>
            {error && (
              <p className="text-red-600 text-xs font-medium">{error}</p>
            )}
            <div className="flex justify-center">
              <PinInput6Mobile onComplete={(v) => setCode(v)} />
            </div>
          </div>

          {/* Redeem Button - Mobile optimized */}
          <div className="text-center flex-shrink-0 pt-1">
            <button
              onClick={handleSubmit}
              disabled={loading || code.length !== 6}
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-5 py-3 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 text-sm md:px-6 md:py-4 md:text-base"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  Resgatar Amostras
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-3 w-full max-w-[240px] text-center mx-4">
            <h3 className="text-sm font-bold text-gray-900">Código Inativo ou Inexistente</h3>
            <p className="text-gray-700 mt-1 text-xs">Verifique o código e tente novamente.</p>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-2 inline-flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-semibold px-3 py-2 rounded-lg shadow-md transition text-xs"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function HomePageClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
