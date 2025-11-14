"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { LogOut, TrendingUp, DollarSign, Package, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface SalesData {
  period: string;
  sales: number;
  revenue: number;
}

interface ProductData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // Add index signature for ChartDataInput compatibility
}

const mockSalesData: SalesData[] = [
  { period: "Hoje", sales: 12, revenue: 480 },
  { period: "7 dias", sales: 89, revenue: 3560 },
  { period: "15 dias", sales: 156, revenue: 6240 },
  { period: "30 dias", sales: 298, revenue: 11920 }
];

const mockDailyData = [
  { day: "Seg", sales: 15 },
  { day: "Ter", sales: 22 },
  { day: "Qua", sales: 18 },
  { day: "Qui", sales: 25 },
  { day: "Sex", sales: 32 },
  { day: "Sáb", sales: 28 },
  { day: "Dom", sales: 20 }
];

const mockProductData: ProductData[] = [
  { name: "Amostra 100g", value: 45, color: "#f59e0b" },
  { name: "Amostra 250g", value: 35, color: "#10b981" },
  { name: "Amostra 500g", value: 20, color: "#3b82f6" }
];

export default function AdminDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30 dias");
  const [totalSales] = useState(1247);
  const [totalRevenue] = useState(49880);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/admin");
  };

  // const currentData = mockSalesData.find(data => data.period === selectedPeriod) || mockSalesData[3];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Café Canastra</h1>
              <span className="ml-3 text-sm text-gray-500">Dashboard</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vendas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{mockSalesData[0].sales}</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Últimos 7 dias</p>
                <p className="text-2xl font-bold text-gray-900">{mockSalesData[1].sales}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Últimos 15 dias</p>
                <p className="text-2xl font-bold text-gray-900">{mockSalesData[2].sales}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Últimos 30 dias</p>
                <p className="text-2xl font-bold text-gray-900">{mockSalesData[3].sales}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas por Período</h3>
            <div className="flex gap-2 mb-6">
              {["Hoje", "7 dias", "15 dias", "30 dias"].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }} 
                />
                <Bar dataKey="sales" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendas da Semana</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockDailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Sales Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Total de Vendas Realizadas</h2>
            <div className="flex justify-center items-baseline gap-4 mt-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-amber-600">{totalSales}</p>
                <p className="text-sm text-gray-600 mt-1">Vendas Totais</p>
              </div>
              <div className="w-px h-12 bg-gray-200"></div>
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600">R$ {totalRevenue.toLocaleString('pt-BR')}</p>
                <p className="text-sm text-gray-600 mt-1">Receita Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Produto</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockProductData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockProductData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "white", 
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo por Produto</h3>
            <div className="space-y-4">
              {mockProductData.map((product) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: product.color }}
                    ></div>
                    <span className="font-medium text-gray-900">{product.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-900">{product.value}%</span>
                    <p className="text-sm text-gray-600">das vendas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}