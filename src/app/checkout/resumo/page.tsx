"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, ArrowRight, User, Mail, Phone, MapPin } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
 

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
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [paymentLinkUrl, setPaymentLinkUrl] = useState<string | null>(null);
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
    
    // Recuperar payment_link_id do localStorage se existir
    const savedPaymentLinkId = localStorage.getItem('payment_link_id');
    if (savedPaymentLinkId) {
      console.log('📦 Payment Link ID encontrado no localStorage:', savedPaymentLinkId);
      setPaymentLinkId(savedPaymentLinkId);
    }

    const savedPaymentLinkUrl = localStorage.getItem('payment_link_url');
    if (savedPaymentLinkUrl) {
      setPaymentLinkUrl(savedPaymentLinkUrl);
    }
  }, [code, router]);

  

  // Log para monitorar estados
  useEffect(() => {
    console.log('🔄 Estados atualizados:');
    console.log('  paymentLinkId:', paymentLinkId);
    console.log('  showConfirmButton:', showConfirmButton);
    console.log('  loading:', loading);
    console.log('  paymentClicked:', paymentClicked);
  }, [paymentLinkId, showConfirmButton, loading, paymentClicked]);

  const handleBackToEdit = () => {
    router.push(`/checkout?code=${code}`);
  };

  

  const copyPaymentLink = async () => {
    if (!paymentLinkUrl) return;
    try {
      await navigator.clipboard.writeText(paymentLinkUrl);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = paymentLinkUrl;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const handlePayment = async () => {
    if (!customerData) return;

    // Abrir janela imediatamente para evitar bloqueio de popup
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Processando Pagamento...</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #f9fafb; color: #111827; }
              .loader { border: 4px solid #e5e7eb; border-top: 4px solid #d97706; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 16px; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              p { font-size: 18px; font-weight: 500; }
            </style>
          </head>
          <body>
            <div class="loader"></div>
            <p>Gerando seu link de pagamento...</p>
          </body>
        </html>
      `);
    }
    
    setLoading(true);
    setPaymentClicked(true);

    try {
      console.log('🚀 Criando pagamento via Mercado Pago...');

      // Limpar formatação de CPF, telefone e CEP (apenas dígitos)
      const cleanCustomerData = {
        ...customerData,
        cpf: String(customerData.cpf || '').replace(/\D/g, ''),
        phone: String(customerData.phone || '').replace(/\D/g, ''),
        postal_code: String(customerData.postal_code || '').replace(/\D/g, ''),
        complemento: customerData.address_line2 || ''
      };

      console.log('📋 Dados do cliente (limpos):', cleanCustomerData);

      const response = await fetch('/api/checkout/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          customer: cleanCustomerData,
          product: {
            name: 'Frete Amostra Grátis Café Especial',
            price: 24.90,
            quantity: 1
          }
        }),
      });

      console.log('Resposta recebida:', response.status, response.statusText);

      if (!response.ok) {
        if (newWindow) newWindow.close();
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('❌ Erro na API:', errorData);

        // Se tem detalhes de validação Zod, mostrar
        if (errorData.details && Array.isArray(errorData.details)) {
          const validationErrors = errorData.details
            .map((err: any) => `${err.path.join('.')}: ${err.message}`)
            .join('\n');
          throw new Error(`Dados inválidos:\n${validationErrors}`);
        }

        throw new Error(errorData.error || errorData.message || `Erro ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Resposta da API:', result);

      // Nova resposta simplificada: { init_point, preference_id, external_reference }
      const paymentLink = result.init_point;
      const preferenceId = result.preference_id;
      const externalReference = result.external_reference;

      if (!paymentLink || !preferenceId) {
        if (newWindow) newWindow.close();
        throw new Error('Link de pagamento não recebido da API');
      }

      console.log('💳 Preference ID:', preferenceId);
      console.log('🆔 External Reference:', externalReference);
      console.log('🔗 Payment Link:', paymentLink);

      // Salvar dados no state e localStorage
      setPaymentLinkId(preferenceId);
      setPaymentLinkUrl(paymentLink);

      localStorage.setItem('payment_link_id', preferenceId);
      localStorage.setItem('payment_link_url', paymentLink);
      localStorage.setItem('external_reference', externalReference);

      // Mostrar botão de confirmar pagamento
      setShowConfirmButton(true);
      setPaymentClicked(false);

      // Redirecionar para Mercado Pago
      if (newWindow) {
        newWindow.location.href = paymentLink;
      } else {
        window.open(paymentLink, '_blank');
      }

    } catch (error) {
      if (newWindow) newWindow.close();
      console.error('❌ Erro ao processar pagamento:', error);
      alert(`Erro ao processar pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setPaymentClicked(false);
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    console.log('🚀 Iniciando confirmPayment (sem exigir payment_link_id)...');
    
    setLoading(true);
    
    try {
      // Obter dados do localStorage
      const savedData = localStorage.getItem('checkout_customer_data');
      const customerDataFromStorage = savedData ? JSON.parse(savedData) : {};
      const savedPaymentLinkId = localStorage.getItem('payment_link_id');
      
      const requestBody: Record<string, unknown> = {
        customer: customerDataFromStorage,
      };
      
      if (savedPaymentLinkId) {
        requestBody.payment_link_id = savedPaymentLinkId;
      }
      
      console.log('📤 Enviando webhook com body:', requestBody);
      
      const response = await fetch('https://webhook.canastrainteligencia.com/webhook/confirmar-status-pagamento', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Resposta do webhook:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na confirmação:', errorText);
        throw new Error(`Erro ao confirmar pagamento: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Resposta da confirmação:', result);

      let pago = false;
      
      // Verificar se é array (novo formato)
      if (Array.isArray(result) && result.length > 0) {
        const firstItem = result[0] as Record<string, unknown>;
        pago = firstItem['status_pagamento'] === true || firstItem['status_pagamento'] === 'true';
      } 
      // Verificar se é objeto (formato antigo)
      else if (typeof result === 'object' && result !== null) {
        const obj = result as Record<string, unknown>;
        pago = obj['status_pagamento'] === true || obj['status_pagamento'] === 'true';
      }

      if (pago) {
        router.push('/checkout/sucesso');
      } else {
        const message = Array.isArray(result) && result.length > 0 
          ? (result[0] as Record<string, unknown>)?.['message'] as string
          : (result as Record<string, unknown>)?.['message'] as string;
          
        setPopupMessage(message || 'Pagamento Não Confirmado');
        setShowPaymentPopup(true);
      }
      
    } catch (error) {
      console.error('❌ Erro ao confirmar pagamento:', error);
      setPopupMessage('Erro ao confirmar pagamento. Tente novamente.');
      setShowPaymentPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const tryPaymentAgain = () => {
    setShowPaymentPopup(false);
    confirmPayment();
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
              <p className="text-lg font-bold text-gray-900">R$ 24,90</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-amber-600">R$ 24,90</span>
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
          
          {/* Botão Confirmar Pagamento */}
          {showConfirmButton && (
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800 text-sm mb-2">Caso o link de pagamento não tenha aberto automaticamente, copie o link aqui</p>
                <button
                  onClick={copyPaymentLink}
                  disabled={!paymentLinkUrl}
                  className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-gray-800 font-medium px-4 py-2 rounded-lg border border-gray-300 transition-colors"
                >
                  Copiar Link
                </button>
              </div>
              <button
                onClick={() => {
                  console.log('🎯 Botão Confirmar Pagamento clicado!');
                  confirmPayment();
                }}
                disabled={loading}
                className="inline-flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Confirmando...
                  </>
                ) : (
                  'Confirmar Pagamento'
                )}
              </button>
            </div>
          )}
          
          
          
          {!showConfirmButton && (
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
          )}
        </div>
        
        {/* Popup de Pagamento Não Confirmado */}
        {showPaymentPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{popupMessage}</h3>
                <p className="text-gray-600 text-sm mb-4">
                  O pagamento ainda não foi confirmado. Deseja tentar novamente?
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={tryPaymentAgain}
                    disabled={loading}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    {loading ? 'Tentando...' : 'Tentar Novamente'}
                  </button>
                  <button
                    onClick={() => setShowPaymentPopup(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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