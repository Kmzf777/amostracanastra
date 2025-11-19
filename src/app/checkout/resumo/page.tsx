"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, User, Mail, Phone, MapPin } from "lucide-react";
import { useState, useEffect, useCallback, Suspense } from "react";

interface CustomerData {
  full_name: string;
  email: string;
  phone: string;
  cpf: string;
  address_line1: string;
  address_line2: string;
  number: string;
  district: string;
  city: string;
  state: string;
  postal_code: string;
  complemento?: string; // Adicionar complemento como opcional
}

// Função auxiliar para extrair o link de pagamento de diferentes formatos de resposta
function extractPaymentLink(response: unknown): string | null {
  console.log('Extraindo link de:', response);

  if (Array.isArray(response) && response.length > 0) {
    const first = response[0] as Record<string, unknown>;
    const val = first['link_de_pagamento'];
    if (typeof val === 'string') return val;
  }

  if (typeof response === 'object' && response !== null) {
    const obj = response as Record<string, unknown>;
    const direct = obj['link_de_pagamento'];
    if (typeof direct === 'string') return direct;

    const data = obj['data'] as Record<string, unknown> | undefined;
    const nested = data?.['link_de_pagamento'];
    if (typeof nested === 'string') return nested;

    const possibleKeys = ['link', 'url', 'payment_link', 'checkout_url', 'link_de_pagamento'] as const;
    for (const key of possibleKeys) {
      const candidate = obj[key];
      if (typeof candidate === 'string' && candidate.startsWith('http')) return candidate;
    }
  }

  if (typeof response === 'string' && response.startsWith('http')) {
    return response;
  }

  console.log('Nenhum link encontrado nos formatos conhecidos');
  return null;
}

function OrderSummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [paymentClicked, setPaymentClicked] = useState(false);
  const [paymentLinkId, setPaymentLinkId] = useState<string | null>(null);
  const code = searchParams.get("code") || "";

  useEffect(() => {
    // Get customer data from localStorage (saved during checkout)
    const savedData = localStorage.getItem('checkout_customer_data');
    if (savedData) {
      setCustomerData(JSON.parse(savedData));
    } else {
      // If no data found, redirect back to checkout
      router.push(`/checkout?code=${code}`);
    }
  }, [code, router]);

  // Função para verificar status do pagamento
  const checkPaymentStatus = useCallback(async (linkId: string) => {
    try {
      const response = await fetch(`/api/order-status?payment_link_id=${linkId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.is_paid) {
          // Pagamento confirmado, redirecionar para sucesso
          router.push('/checkout/sucesso');
          return true;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
    return false;
  }, [router]);

  // Efeito para verificar status do pagamento periodicamente
  useEffect(() => {
    if (!paymentLinkId) return;

    let checkInterval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    const startChecking = async () => {
      // Verificar imediatamente
      const isPaid = await checkPaymentStatus(paymentLinkId);
      
      if (!isPaid) {
        // Se não estiver pago, continuar verificando a cada 3 segundos
        checkInterval = setInterval(async () => {
          const paid = await checkPaymentStatus(paymentLinkId);
          if (paid) {
            clearInterval(checkInterval);
            clearTimeout(timeout);
          }
        }, 3000);

        // Timeout após 5 minutos (300 segundos)
        timeout = setTimeout(() => {
          clearInterval(checkInterval);
          console.log('⏰ Timeout na verificação de pagamento');
        }, 300000);
      }
    };

    startChecking();

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (timeout) clearTimeout(timeout);
    };
  }, [paymentLinkId, checkPaymentStatus]);

  const handleBackToEdit = () => {
    router.push(`/checkout?code=${code}`);
  };

  const handlePayment = async () => {
    if (!customerData) return;
    
    setLoading(true);
    setPaymentClicked(true);
    
    try {
      console.log('Enviando dados para webhook...');
      
      const response = await fetch('https://webhook.canastrainteligencia.com/webhook/linkpagamentoamostra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          customer: {
            ...customerData,
            complemento: customerData.address_line2 || '' // Enviar complemento como parâmetro separado
          },
          product: {
            name: 'Frete Amostra Grátis Café Especial',
            price: 19.90,
            quantity: 1
          }
        }),
      });

      console.log('Resposta HTTP recebida:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta HTTP:', errorText);
        throw new Error(`Erro ao processar pagamento: ${response.status} ${response.statusText}`);
      }

      console.log('Aguardando JSON da resposta...');
      const result = await response.json();
      
      // Debug: Log da resposta completa
      console.log('Resposta do webhook:', result);
      console.log('Tipo da resposta:', typeof result);
      console.log('Conteúdo da resposta:', JSON.stringify(result, null, 2));
      
      // Extrair link de pagamento usando a função auxiliar
      const paymentLink = extractPaymentLink(result);
      
      // Tentar extrair o payment_link_id da resposta
      let extractedPaymentLinkId = null;
      if (Array.isArray(result) && result.length > 0) {
        const first = result[0] as Record<string, unknown>;
        extractedPaymentLinkId = first['payment_link_id'] as string || first['preference_id'] as string;
      } else if (typeof result === 'object' && result !== null) {
        const obj = result as Record<string, unknown>;
        extractedPaymentLinkId = obj['payment_link_id'] as string || obj['preference_id'] as string;
        
        if (!extractedPaymentLinkId && obj['data']) {
          const data = obj['data'] as Record<string, unknown>;
          extractedPaymentLinkId = data['payment_link_id'] as string || data['preference_id'] as string;
        }
      }
      
      if (extractedPaymentLinkId) {
        console.log('Payment Link ID encontrado:', extractedPaymentLinkId);
        setPaymentLinkId(extractedPaymentLinkId);
        
        // Salvar no localStorage para persistência
        localStorage.setItem('payment_link_id', extractedPaymentLinkId);
      }
      
      if (paymentLink) {
        console.log('Link de pagamento encontrado:', paymentLink);
        window.open(paymentLink, '_blank');
      } else {
        console.error('Formato da resposta não reconhecido:', result);
        throw new Error(`Link de pagamento não recebido. Formato: ${JSON.stringify(result)}`);
      }
      
    } catch (error) {
      console.error('Erro completo no webhook:', error);
      alert(`Erro ao processar pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setPaymentClicked(false);
    } finally {
      setLoading(false);
    }
  };

  if (!customerData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={handleBackToEdit}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para editar
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Resumo do Pedido</h1>
        </div>

        {/* Product Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Produto</h2>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src="/amostra.png"
                alt="Amostras de Café"
                width={80}
                height={50}
                className="rounded-lg object-cover"
                priority
                quality={100}
                unoptimized
              />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Frete Amostra Grátis Café Especial</h3>
              <p className="text-gray-600 text-sm">Quantidade: 1</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">R$ 19,90</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-amber-600">R$ 19,90</span>
            </div>
          </div>
        </div>

        {/* Customer Data Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Dados do Cliente</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium text-gray-900">{customerData.full_name}</p>
                <p className="text-sm text-gray-600">CPF: {customerData.cpf}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-1" />
              <p className="text-gray-900">{customerData.email}</p>
            </div>
            
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-1" />
              <p className="text-gray-900">{customerData.phone}</p>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-gray-900">
                  {customerData.address_line1}, {customerData.number}
                  {customerData.address_line2 && ` - ${customerData.address_line2}`}
                </p>
                <p className="text-sm text-gray-600">
                  {customerData.district} • {customerData.city} - {customerData.state}
                </p>
                <p className="text-sm text-gray-600">CEP: {customerData.postal_code}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <div className="text-center space-y-4">
          {paymentClicked && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                ✅ Você será redirecionado para o Mercado Pago em uma nova aba para concluir o pagamento.
              </p>
              {paymentLinkId && (
                <div className="mt-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                  <span className="text-blue-700 text-sm">Aguardando confirmação do pagamento...</span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={handlePayment}
            disabled={loading || (paymentClicked && paymentLinkId !== null)}
            className="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processando...
              </>
            ) : paymentClicked && paymentLinkId ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Aguardando Pagamento...
              </>
            ) : (
              <>
                Clique aqui para pagar
                <ArrowRight className="w-6 h-6" />
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

export default function OrderSummary() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>}>
      <OrderSummaryContent />
    </Suspense>
  )
}