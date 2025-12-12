"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TrendingUp, AlertCircle, CheckCircle, Printer, Copy } from "lucide-react";
import * as XLSX from 'xlsx';
import { getWithdrawals, updateWithdrawalStatus } from "../../actions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Withdrawal = any; // Using any for flexibility with Supabase joins

export default function WithdrawalsPage() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'paid'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getWithdrawals();
        if (result && 'error' in result) {
          setError(result.error as string);
        } else {
          setWithdrawals(result as Withdrawal[]);
        }
      } catch (err) {
        setError("Falha ao carregar saques");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDueDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 10);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleConfirmPayment = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Confirmar pagamento deste saque?')) return;

    setProcessingId(id);
    try {
      const result = await updateWithdrawalStatus(id, 'paid');
      if (result && 'error' in result) {
        alert('Erro ao confirmar pagamento: ' + result.error);
      } else {
        setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'paid' } : w));
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao processar solicitação');
    } finally {
      setProcessingId(null);
    }
  };

  const generateData = () => {
    return filteredWithdrawals.map(w => ({
      'Usuário': w.affiliate?.customer?.full_name || 'Afiliado Desconhecido',
      'CPF/CNPJ': w.affiliate?.customer?.cpf || w.affiliate_id,
      'Chave Pix': w.pix_key,
      'Tipo Chave': w.pix_key_type || '',
      'Valor': Number(w.amount),
      'Status': w.status === 'paid' ? 'Pago' : 'Aguardando Pagamento',
      'Data Solicitação': formatDate(w.created_at),
      'Data Vencimento': getDueDate(w.created_at)
    }));
  };

  const handleExportExcel = () => {
    const data = generateData();
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Saques");
    XLSX.writeFile(workbook, `saques_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleCopyExcel = async () => {
    const data = generateData();
    // Generate TSV for copy-paste compatibility
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const tsvContent = [
      headers.join('\t'),
      ...data.map((row: any) => headers.map(header => row[header]).join('\t'))
    ].join('\n');
    
    try {
      await navigator.clipboard.writeText(tsvContent);
      alert('Tabela copiada para a área de transferência! (Compatível com Excel)');
    } catch (err) {
      console.error('Falha ao copiar:', err);
      alert('Erro ao copiar tabela');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Pago
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Aguardando Pagamento
      </span>
    );
  };

  const filteredWithdrawals = withdrawals.filter(w => {
    if (filterStatus === 'all') return true;
    return w.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Erro: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Saques</h2>
        <p className="mt-1 text-sm text-gray-500">Gerencie as solicitações de saque dos afiliados.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Solicitações Recentes</h2>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pending' | 'paid')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm p-2 border"
            >
              <option value="all">Todos</option>
              <option value="pending">Aguardando Pagamento</option>
              <option value="paid">Pago</option>
            </select>
            <button
              onClick={handleCopyExcel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Excel
            </button>
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Printer className="w-4 h-4 mr-2" />
              Baixar Excel
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário / CPF</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chave Pix</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Solicitação</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Vencimento</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhum saque encontrado
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((withdrawal: any) => (
                  <tr 
                    key={withdrawal.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/admin/dashboard/saques/${withdrawal.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {withdrawal.affiliate?.customer?.full_name || 'Afiliado Desconhecido'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {withdrawal.affiliate?.customer?.cpf || withdrawal.affiliate_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{withdrawal.pix_key}</div>
                      <div className="text-xs text-gray-500 capitalize">{withdrawal.pix_key_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(Number(withdrawal.amount))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(withdrawal.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getDueDate(withdrawal.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {withdrawal.status !== 'paid' && (
                        <button
                          onClick={(e) => handleConfirmPayment(e, withdrawal.id)}
                          disabled={processingId === withdrawal.id}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processingId === withdrawal.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          Confirmar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
