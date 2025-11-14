import { headers } from "next/headers";

function isValidCode(code: string) {
  // Accept both 6-digit codes and 9-character codes (6 digits + 3 spaces)
  const trimmedCode = code.trim();
  return /^\d{6}$/.test(trimmedCode) || (code.length === 9 && /^\d{6}\s{3}$/.test(code));
}

export default async function CodePage({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { code } = await params;
  const sp = await searchParams;
  const hdrs = await headers();
  const referer = hdrs.get("referer") || undefined;

  if (!isValidCode(code)) {
    return (
      <main className="container">
        <h1>Código inválido</h1>
        <p className="muted">Verifique o link ou tente novamente.</p>
      </main>
    );
  }

  // Validação silenciosa via API (sem expor dados sensíveis)
  const proto = hdrs.get("x-forwarded-proto") || "https";
  const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
  const origin = `${proto}://${host}`;
  const res = await fetch(`${origin}/api/codes/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, utm: sp, referer }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return (
      <main className="container">
        <h1>Código não encontrado</h1>
        <p className="muted">Se o problema persistir, entre em contato.</p>
      </main>
    );
  }

  return (
    <main className="container">
      <h1>Bem-vindo!</h1>
      <p className="muted">Código validado. Continue para o checkout.</p>
      <a href={`/checkout?code=${code}`} style={{ display: "inline-block", marginTop: 12 }}>Ir para o checkout</a>
    </main>
  );
}
