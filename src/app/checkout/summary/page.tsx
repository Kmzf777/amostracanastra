"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Package, User, MapPin, CheckCircle } from "lucide-react";
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h1>
          <p className="text-gray-600">Suas amostras grátis foram reservadas com sucesso</p>
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
                  <h3 className="font-medium text-gray-900">3 Amostras Grátis Café Canastra</h3>
                  <p className="text-sm text-gray-600">Café premium selecionado</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">GRÁTIS</p>
                  <p className="text-sm text-gray-600">Frete grátis</p>
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

          {/* Order Code */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Código do Pedido</h3>
              <p className="text-2xl font-bold text-blue-800 font-mono">{orderData.code}</p>
              <p className="text-blue-700 text-sm mt-2">
                Guarde este código para acompanhar seu pedido
              </p>
            </div>
          </div>

          

          {/* Action Button */}
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
            >
              Voltar ao Início
            </Link>
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