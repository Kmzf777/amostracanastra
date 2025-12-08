"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login } from "./actions";
import { ArrowRight } from "lucide-react";

const initialState = {
  error: "",
};

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(login, initialState);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Café Canastra</h1>
          <p className="text-gray-600">Acesso Administrativo</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
          <form action={formAction} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                name="email"
                placeholder="Usuário"
                className="w-full text-lg px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-0 transition-colors duration-200 bg-white"
                autoFocus
                required
              />
            </div>

            <div className="relative">
              <input
                type="password"
                name="password"
                placeholder="Senha"
                className="w-full text-lg px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-0 transition-colors duration-200 bg-white"
                required
              />
            </div>

            {state?.error && (
              <p className="text-red-500 text-sm text-center">{state.error}</p>
            )}
            
            <div className="flex justify-end">
              <LoginButton />
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:-translate-y-1"
    >
      {pending ? "Entrando..." : "Entrar"}
      <ArrowRight className="w-6 h-6" />
    </button>
  );
}
