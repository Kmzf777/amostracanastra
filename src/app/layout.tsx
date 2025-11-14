import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Café Premium - Amostras Grátis | Café Canastra",
  description: "Experimente nosso café especial de alta qualidade. 3 amostras grátis - você só paga o frete! Códigos exclusivos de afiliados.",
  keywords: "café especial, amostras grátis, café premium, café canastra, afiliados, amostra café",
  authors: [{ name: "Café Canastra" }],
  openGraph: {
    title: "Café Premium - Amostras Grátis",
    description: "3 amostras grátis de café especial - você só paga o frete!",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Café Premium - Amostras Grátis",
    description: "3 amostras grátis de café especial - você só paga o frete!",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#d97706" />
      </head>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}
