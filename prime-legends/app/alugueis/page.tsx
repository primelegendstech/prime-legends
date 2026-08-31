import type { Metadata } from "next";
import AlugueisContent from "@/components/AlugueisContent";
import GoldNetworkBackground from "@/components/GoldNetworkBackground";

export const metadata: Metadata = {
  title: "Aluguel de Ferramentas GSM | UnlockTool, TSM Tool, AMT Tool, Samsung Tool | Prime Legends",
  description:
    "Alugue UnlockTool, TSM Tool, AMT Tool, Samsung Tool e Griffin-Unlocker com liberação automática de login e senha após o pagamento. Planos por hora, sem fidelidade.",
  alternates: { canonical: "/alugueis" },
  openGraph: {
    title: "Aluguel de Ferramentas GSM | Prime Legends",
    description:
      "UnlockTool, TSM Tool, AMT Tool, Samsung Tool e Griffin-Unlocker com liberação automática após o pagamento.",
    url: "/alugueis",
  },
};

export default function AlugueisPage() {
  return (
    <>
      <main className="relative min-h-screen bg-black text-white px-6 pt-24 pb-20 overflow-hidden">
        <GoldNetworkBackground />
        <div className="relative z-10">
          <AlugueisContent />

          <div className="text-center mt-16">
            <a href="/" className="text-sm text-yellow-400 hover:text-yellow-300 transition">
              ← Voltar para o site
            </a>
          </div>
        </div>
      </main>
    </>
  );
}