import type { Metadata } from "next";
import AtivacoesContent from "@/components/AtivacoesContent";
import GoldNetworkBackground from "@/components/GoldNetworkBackground";

export const metadata: Metadata = {
  title: "Ativação de Licenças GSM | UnlockTool, TSM Tool, Chimera Tool, Moto M Tool, Alien Tool | Prime Legends",
  description:
    "Ative ou renove sua licença de UnlockTool, TSM Tool, Chimera Tool, Moto M Tool e Alien Tool com entrega rápida e suporte especializado para técnicos de celular.",
  alternates: { canonical: "/ativacao" },
  openGraph: {
    title: "Ativação de Licenças GSM | Prime Legends",
    description:
      "Ative ou renove licenças de UnlockTool, TSM Tool, Chimera Tool, Moto M Tool e Alien Tool com entrega rápida.",
    url: "/ativacao",
  },
};

export default function AtivacaoPage() {
  return (
    <main className="relative min-h-screen bg-black px-4 py-12 overflow-hidden">
      <GoldNetworkBackground />
      <div className="relative z-10 pt-24">
        <AtivacoesContent />
      </div>
    </main>
  );
}
