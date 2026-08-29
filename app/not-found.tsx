import Link from "next/link";
import type { Metadata } from "next";
import GoldNetworkBackground from "@/components/GoldNetworkBackground";

export const metadata: Metadata = {
  title: "Página não encontrada | Prime Legends",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-black text-white px-6 flex items-center justify-center overflow-hidden">
      <GoldNetworkBackground />
      <div className="relative z-10 text-center max-w-md">
        <p className="text-yellow-400 font-black text-6xl md:text-7xl mb-4">404</p>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-3">Página não encontrada</h1>
        <p className="text-gray-400 text-sm md:text-base mb-8">
          O link que você acessou não existe mais ou foi movido. Volte pra página inicial e encontre o que
          precisa.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold px-6 py-3 hover:brightness-110 transition"
        >
          ← Voltar para o site
        </Link>
      </div>
    </main>
  );
}
