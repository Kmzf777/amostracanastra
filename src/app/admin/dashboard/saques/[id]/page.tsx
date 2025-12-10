"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle, AlertCircle, Copy, DollarSign, ShoppingBag, CreditCard } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getWithdrawalById, updateWithdrawalStatus } from "../../../actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WithdrawalDetail = any;

export default function WithdrawalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [withdrawal, setWithdrawal] = useState<WithdrawalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!params.id) return;
        const result = await getWithdrawalById(params.id as string);
        if (result && 'error' in result) {
          setError(result.error as string);
        } else {
          setWithdrawal(result);
        }
      } catch (err) {
        setError("Falha ao carregar detalhes do saque");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsPaid = async () => {
    if (!withdrawal) return;
    if (!confirm("Tem certeza que deseja marcar este saque como pago?")) return;

    setUpdating(true);
    try {
      const result = await updateWithdrawalStatus(withdrawal.id, 'paid');
      if (result && 'error' in result) {
        alert("Erro ao atualizar status: " + result.error);
      } else {
        setWithdrawal({ ...withdrawal, status: 'paid' });
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
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (error || !withdrawal) {
    return (
      <div className="h-full flex items-center justify-center flex-col gap-4">
        <div className="text-red-500">Erro: {error || "Saque não encontrado"}</div>
        <button 
          onClick={() => router.back()}
          className="text-amber-600 hover:underline"
        >
          Voltar
        </button>
      </div>
    );
  }

  const { affiliate } = withdrawal;
  const customer = affiliate?.customer;
  const salesCount = affiliate?.sales_count || 0;
  const totalWithdrawalsCount = affiliate?.total_withdrawals_count || 0;
  const totalWithdrawalsAmount = affiliate?.total_withdrawals_amount || 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalhes do Saque</h1>
          <p className="text-gray-500">Solicitação #{withdrawal.id.slice(0, 8)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status da Solicitação</h2>
            <div className="flex items-center gap-4">
              {withdrawal.status === 'paid' ? (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">Pago</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-4 py-2 rounded-lg">
                  <AlertCircle className="w-6 h-6" />
                  <span className="font-medium">Aguardando Pagamento</span>
                </div>
              )}
              <div className="text-sm text-gray-500">
                Solicitado em: {formatDate(withdrawal.created_at)}
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Valor do Saque</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(Number(withdrawal.amount))}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informações do Afiliado</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Nome Completo</dt>
                <dd className="mt-1 text-base font-medium text-gray-900">{customer?.full_name || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">CPF</dt>
                <dd className="mt-1 text-base font-medium text-gray-900">{customer?.cpf || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-base font-medium text-gray-900 break-all">{customer?.email || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Telefone</dt>
                <dd className="mt-1 text-base font-medium text-gray-900">{customer?.number || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Código de Afiliado</dt>
                <dd className="mt-1 text-base font-medium text-gray-900 bg-gray-100 inline-block px-2 py-1 rounded">
                  {affiliate?.code || 'N/A'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">ID do Afiliado</dt>
                <dd className="mt-1 text-sm text-gray-500 font-mono">{withdrawal.affiliate_id}</dd>
              </div>
            </dl>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Estatísticas do Afiliado</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Total de Vendas</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">{salesCount}</p>
                <p className="text-xs text-blue-600 mt-1">com código {affiliate?.code}</p>
              </div>

              <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Total Saques</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">{totalWithdrawalsCount}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-900">Valor Total</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalWithdrawalsAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Pix Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Pagamento via Pix</h2>
            
            <div className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-xl mb-6">
              <QRCodeSVG 
                value={withdrawal.pix_key} 
                size={200}
                level="H"
                includeMargin={true}
              />
              <p className="text-xs text-gray-500 mt-4 text-center">
                Escaneie o QR Code para pagar
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Chave Pix</label>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-50 p-3 rounded-lg font-mono text-sm break-all border border-gray-200">
                    {withdrawal.pix_key}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(withdrawal.pix_key)}
                    className="p-3 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-colors"
                    title="Copiar Chave"
                  >
                    {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {withdrawal.pix_key_type && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Chave</label>
                  <p className="mt-1 text-sm font-medium text-gray-900 capitalize">
                    {withdrawal.pix_key_type}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              {withdrawal.status !== 'paid' && (
                <button 
                  onClick={handleMarkAsPaid}
                  disabled={updating}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                  Marcar como Pago
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
