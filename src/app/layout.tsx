import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], weight: ["400","500","600","700","800","900"], display: "swap" })

export const metadata: Metadata = {
  title: "Café Especial - Amostra Grátis...",
  description: "Café Especial - Amostra Grátis...",
  keywords: "café especial, amostras grátis, café premium, café canastra, afiliados, amostra café",
  authors: [{ name: "Café Canastra" }],
  openGraph: {
    title: "Café Especial - Amostra Grátis...",
    description: "Café Especial - Amostra Grátis...",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Café Especial - Amostra Grátis...",
    description: "Café Especial - Amostra Grátis...",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#d97706" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
