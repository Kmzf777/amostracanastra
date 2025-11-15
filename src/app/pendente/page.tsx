import { Suspense } from "react";
import PendenteContent from "./view";

export default function PendentePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>}>
      <PendenteContent />
    </Suspense>
  );
}
