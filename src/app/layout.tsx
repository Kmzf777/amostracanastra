import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"], weight: ["400","500","600","700","800","900"], display: "swap" })

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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#d97706" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
