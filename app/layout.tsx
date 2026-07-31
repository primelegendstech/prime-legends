import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://primelegendsgsm.vercel.app"),
  title: "Prime Legends GSM | Ativações e Aluguéis Profissionais",
  description:
    "Sua solução completa para serviços técnicos. Ferramentas, licenças, downloads e suporte remoto especializado para manutenção de dispositivos Android e iPhone.",
  keywords: [
    "unlock tool",
    "aluguel de ferramentas gsm",
    "ativação frp",
    "unlock samsung",
    "prime legends",
    "gsm prime",
  ],
  openGraph: {
    title: "Prime Legends GSM | Ativações e Aluguéis Profissionais",
    description:
      "Ferramentas, licenças, downloads e suporte remoto especializado para técnicos em smartphones.",
    url: "https://primelegendsgsm.vercel.app",
    siteName: "Prime Legends GSM",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Prime Legends GSM | Ativações e Aluguéis Profissionais",
    description:
      "Ferramentas, licenças, downloads e suporte remoto especializado para técnicos em smartphones.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}