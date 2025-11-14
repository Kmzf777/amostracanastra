"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    
    // Simular autenticação - em produção, integrar com backend real
    setTimeout(() => {
      if (email === "admin@cafecanastra.com" && password === "admin123") {
        router.push("/admin/dashboard");
      } else {
        setError("Credenciais inválidas");
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Café Canastra</h1>
          <p className="text-gray-600">Acesso Administrativo</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail"
                className="w-full text-lg px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-0 transition-colors duration-200 bg-white"
                autoFocus
              />
            </div>

            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full text-lg px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-0 transition-colors duration-200 bg-white"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
              >
                {loading ? "Entrando..." : "Entrar"}
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Use admin@cafecanastra.com / admin123 para teste
          </p>
        </div>
      </div>
    </main>
  );
}