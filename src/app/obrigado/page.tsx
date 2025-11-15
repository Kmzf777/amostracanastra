import { Suspense } from "react";
import Link from "next/link";
import ObrigadoContent from "./view";

export default function ObrigadoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Carregando...</div>}>
      <ObrigadoContent />
    </Suspense>
  );
}
