import { Suspense } from "react";
import ErroPagamentoContent from "./view";

export default function ErroPagamentoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>}>
      <ErroPagamentoContent />
    </Suspense>
  );
}
