"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getDashboardData } from "../../actions";

interface DashboardData {
  stats: {
    today: number;
    sevenDays: number;
    total: number;
  };
  charts: {
    today: { hour: string; sales: number }[];
    sevenDays: { date: string; sales: number }[];
    total: { date: string; sales: number }[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sales: any[];
}

export default function AdminSalesPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await getDashboardData();
        if ('error' in result && result.error) {
          setError(result.error as string);
        } else {
          setData(result as DashboardData);
        }
      } catch (err) {
        setError("Falha ao carregar dados");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
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

  if (!data) return null;

  const filteredSales = data.sales.filter((sale) => {
    if (statusFilter !== "all") {
      const status = sale.order_status || 'Pendente';
      if (status !== statusFilter) return false;
    }
    
    if (startDate || endDate) {
      const date = new Date(sale.created_at);
      const brazilOffset = 3 * 60 * 60 * 1000;
      const brazilDate = new Date(date.getTime() - brazilOffset);
      const saleDate = brazilDate.toISOString().split('T')[0];
      
      if (startDate && saleDate < startDate) return false;
      if (endDate && saleDate > endDate) return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vendas</h2>
        <p className="mt-1 text-sm text-gray-500">Gerencie todas as vendas realizadas.</p>
      </div>

      {/* Sales List Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Painel de Vendas</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 p-2"
            >
              <option value="all">Todos os Status</option>
              <option value="Aguardando Impressão">Aguardando Impressão</option>
              <option value="Aguardando Envio">Aguardando Envio</option>
              <option value="Enviado">Enviado</option>
            </select>
            
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                placeholder="De"
              />
              <span className="text-gray-500">até</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 p-2"
                placeholder="Até"
              />
            </div>
            
            {(statusFilter !== "all" || startDate || endDate) && (
              <button
                onClick={() => {
                  setStatusFilter("all");
                  setStartDate("");
                  setEndDate("");
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CPF</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.map((sale) => {
                let statusColor = "bg-gray-100 text-gray-800";
                if (sale.order_status === "Aguardando Impressão") statusColor = "bg-red-100 text-red-800";
                else if (sale.order_status === "Aguardando Envio") statusColor = "bg-yellow-100 text-yellow-800";
                else if (sale.order_status === "Enviado") statusColor = "bg-green-100 text-green-800";

                return (
                  <tr 
                    key={sale.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => window.location.href = `/admin/dashboard/vendas/${sale.id}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sale.created_at).toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.customer_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {sale.cpf || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}`}>
                        {sale.order_status || 'Pendente'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma venda encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
