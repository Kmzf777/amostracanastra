"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Package, User, MapPin, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface OrderData {
  customer: {
    full_name: string;
    email: string;
    phone: string;
    cpf: string;
  };
  shipment: {
    receiver_name: string;
    address_line1: string;
    address_line2?: string;
    number: string;
    district: string;
    city: string;
    state: string;
    postal_code: string;
  };
  code: string;
}

function CheckoutSummaryContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get order data from URL parameters
    const code = searchParams.get("code");
    const customerData = searchParams.get("customer");
    const shipmentData = searchParams.get("shipment");

    if (!code || !customerData || !shipmentData) {
      setError("Dados do pedido incompletos");
      return;
    }

    try {
      const customer = JSON.parse(decodeURIComponent(customerData));
      const shipment = JSON.parse(decodeURIComponent(shipmentData));
      setOrderData({ code, customer, shipment });
    } catch {
      setError("Erro ao carregar dados do pedido");
    }
  }, [searchParams]);

  const handleProceedToPayment = async () => {
    if (!orderData) return;
    
    setLoading(true);
    setError(null);

    try {
      const payload = {
        code: orderData.code,
        customer: orderData.customer,
        shipment: orderData.shipment,
      };

      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const code = data?.error;
        const message = code === 'invalid_cpf'
          ? 'CPF inválido. Verifique seus dados.'
          : code === 'invalid_code'
            ? 'Código inválido. Verifique seus 6 dígitos.'
            : code === 'mp_missing_token'
              ? 'Configuração de pagamento ausente. Tente novamente mais tarde.'
              : code === 'mp_invalid_token'
                ? 'Pagamento indisponível: credencial inválida. Tente novamente mais tarde.'
                : code === 'mp_invalid_payload'
                  ? 'Dados do pagamento inválidos. Verifique suas informações.'
                  : 'Erro ao criar pedido';
        console.error('checkout_create_error_client', { errorCode: code, status: res.status });
        throw new Error(message);
      }

      const result = await res.json();
      
      if (result.init_point) {
        window.location.href = result.init_point;
      } else {
        throw new Error("Erro ao criar pagamento");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao processar pagamento. Tente novamente.";
      setError(msg);
      setLoading(false);
    }
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
  };

  const formatCPF = (cpf: string) => {
    const digits = cpf.replace(/\D/g, "");
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatCEP = (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
  };

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro</h1>
            <p className="text-gray-600">{error}</p>
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

  if (!orderData) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Carregando dados do pedido...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resumo do Pedido</h1>
          <p className="text-gray-600">Revise suas informações antes de prosseguir</p>
        </div>

        <div className="space-y-6">
          {/* Product Summary */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">Produto</h2>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-900">Frete Amostras Grátis Café Canastra</h3>
                  <p className="text-sm text-gray-600">3 amostras de café premium</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">R$ 19,90</p>
                  <p className="text-sm text-gray-600">Envio para todo Brasil</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">Dados Pessoais</h2>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Nome:</span>
                <span className="font-medium text-gray-900">{orderData.customer.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">E-mail:</span>
                <span className="font-medium text-gray-900">{orderData.customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Telefone:</span>
                <span className="font-medium text-gray-900">{formatPhone(orderData.customer.phone)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CPF:</span>
                <span className="font-medium text-gray-900">{formatCPF(orderData.customer.cpf)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-gray-900">Endereço de Entrega</h2>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Destinatário:</span>
                <span className="font-medium text-gray-900">{orderData.shipment.receiver_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Endereço:</span>
                <span className="font-medium text-gray-900">
                  {orderData.shipment.address_line1}, {orderData.shipment.number}
                  {orderData.shipment.address_line2 && ` - ${orderData.shipment.address_line2}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bairro:</span>
                <span className="font-medium text-gray-900">{orderData.shipment.district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cidade/Estado:</span>
                <span className="font-medium text-gray-900">{orderData.shipment.city} - {orderData.shipment.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CEP:</span>
                <span className="font-medium text-gray-900">{formatCEP(orderData.shipment.postal_code)}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg shadow transition-all duration-200"
            >
              Cancelar
            </Link>
            <button
              onClick={handleProceedToPayment}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Prosseguir Pagamento
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSummaryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>}>
      <CheckoutSummaryContent />
    </Suspense>
  );
}