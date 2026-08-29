import type { Metadata } from "next";
import MetodosContent from "@/components/MetodosContent";
import GoldNetworkBackground from "@/components/GoldNetworkBackground";

export const metadata: Metadata = {
  title: "Métodos e Arquivos para Reparo de Celular | Downloads Técnicos | Prime Legends",
  description:
    "Métodos, ROMs e arquivos técnicos para reparo e desbloqueio de smartphones, com download liberado automaticamente após o pagamento.",
  alternates: { canonical: "/metodos" },
  openGraph: {
    title: "Métodos e Arquivos Técnicos | Prime Legends",
    description: "Métodos, ROMs e arquivos técnicos para reparo e desbloqueio de smartphones, download automático.",
    url: "/metodos",
  },
};

export default function MetodosPage() {
  return (
    <>
      <main className="relative min-h-screen bg-black text-white px-6 pt-24 pb-20 overflow-hidden">
        <GoldNetworkBackground />
        <div className="relative z-10">
          <MetodosContent />

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
