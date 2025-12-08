"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Copy, Check, Printer } from "lucide-react";
import { getSaleById, updateSaleStatus } from "../../../actions";
import { QRCodeSVG } from "qrcode.react";

interface SaleData {
  id: number;
  created_at: string;
  nome_completo: string;
  cpf: string;
  number: string;
  email: string;
  endereco: string;
  endereco_numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  codigo_gerado: string;
  order_status: string;
}

export default function SaleDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [sale, setSale] = useState<SaleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);

  useEffect(() => {
    const loadSale = async () => {
      try {
        if (!params.id) return;
        
        const result = await getSaleById(params.id as string);
        if ('error' in result && result.error) {
          setError(result.error as string);
        } else {
          setSale(result as SaleData);
        }
      } catch (err) {
        setError("Falha ao carregar detalhes da venda");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSale();
  }, [params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPrint = async () => {
    if (!sale) return;
    
    setUpdating(true);
    setShowConfirmModal(false);
    try {
      const result = await updateSaleStatus(String(sale.id), 'Aguardando Envio');
      if (result.error) {
        alert("Erro ao atualizar status: " + result.error);
      } else {
        setSale({ ...sale, order_status: 'Aguardando Envio' });
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status");
    } finally {
      setUpdating(false);
    }
  };

  const handleConfirmShipment = async () => {
    if (!sale) return;
    
    setUpdating(true);
    setShowShipModal(false);
    try {
      const result = await updateSaleStatus(String(sale.id), 'Enviado');
      if (result.error) {
        alert("Erro ao atualizar status: " + result.error);
      } else {
        setSale({ ...sale, order_status: 'Enviado' });
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !sale) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="text-red-500">Erro: {error || "Venda não encontrada"}</div>
        <button 
          onClick={() => router.back()}
          className="text-blue-600 hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      </div>
    );
  }

  // Format full address
  const fullAddress = [
    sale.endereco,
    sale.endereco_numero,
    sale.complemento,
    sale.bairro,
    sale.cidade,
    sale.estado,
    sale.cep
  ].filter(Boolean).join(", ");

  let statusColor = "bg-gray-100 text-gray-800";
  if (sale.order_status === "Aguardando Impressão") statusColor = "bg-red-100 text-red-800";
  else if (sale.order_status === "Aguardando Envio") statusColor = "bg-yellow-100 text-yellow-800";
  else if (sale.order_status === "Enviado") statusColor = "bg-green-100 text-green-800";

  return (
    <>
      <div className="hidden print:flex fixed inset-0 z-50 bg-white flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center w-full h-full border-[10px] border-black p-8 m-4 max-w-[210mm] max-h-[297mm] mx-auto box-border">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-[100px] leading-none font-black text-black tracking-tighter uppercase">CAFÉ</h1>
            <h1 className="text-[100px] leading-none font-black text-black tracking-tighter uppercase">GRÁTIS</h1>
          </div>
          
          <div className="p-8 bg-white">
            {sale.codigo_gerado && (
              <QRCodeSVG 
                value={`https://amostra.cafecanastra.com/?code=${sale.codigo_gerado}`}
                size={350}
                level="H"
              />
            )}
          </div>

          <div className="text-center mt-16">
            <p className="text-5xl font-bold text-black font-mono tracking-[0.2em]">{sale.codigo_gerado || '-'}</p>
            <p className="text-2xl text-gray-600 mt-4">amostra.cafecanastra.com</p>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Impressão</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja confirmar a impressão? Isso mudará o status do pedido para "Aguardando Envio".
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmPrint}
                className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ship Confirmation Modal */}
      {showShipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirmar Envio</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja confirmar o envio? Isso mudará o status do pedido para "Enviado".
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowShipModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmShipment}
                className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="print:hidden max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes da Venda #{sale.id}</h1>
          <p className="text-sm text-gray-500">
            Realizada em {new Date(sale.created_at).toLocaleString('pt-BR')}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${statusColor}`}>
            {sale.order_status || 'Pendente'}
          </span>
        </div>
      </div>

      {/* User Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Informações do Cliente</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Nome Completo</label>
            <p className="text-gray-900 font-medium">{sale.nome_completo || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">CPF</label>
            <p className="text-gray-900 font-mono">{sale.cpf || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
            <p className="text-gray-900">{sale.email || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Telefone</label>
            <p className="text-gray-900">{sale.number || '-'}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 mb-1">Endereço Completo</label>
            <div className="flex items-start justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
              <p className="text-gray-900">{fullAddress || '-'}</p>
              <button 
                onClick={() => copyToClipboard(fullAddress)}
                className="text-gray-500 hover:text-blue-600 transition-colors p-1"
                title="Copiar endereço"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Affiliate Information Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Informações do Afiliado</h2>
        </div>
        <div className="p-6">
          <div className="inline-block">
            <label className="block text-sm font-medium text-gray-500 mb-2">Código Gerado</label>
            <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-2 rounded-lg font-mono text-lg font-bold tracking-wider">
              {sale.codigo_gerado || '-'}
            </div>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Adesivo</span>
            </button>
            
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={updating || sale.order_status === 'Aguardando Envio' || sale.order_status === 'Enviado'}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Confirmar Impressão do QR CODE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Confirmation Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Confirmar Envio</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Após realizar o envio do produto, confirme abaixo para atualizar o status do pedido para "Enviado".
          </p>
          <button
            onClick={() => setShowShipModal(true)}
            disabled={updating || sale.order_status === 'Enviado' || sale.order_status !== 'Aguardando Envio'}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Confirmar Envio</span>
          </button>
        </div>
      </div>
    </div>
    </>
  );
}
