"use client";

import { useEffect } from "react";
import Link from "next/link";
import GoldNetworkBackground from "@/components/GoldNetworkBackground";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <main className="relative min-h-screen bg-black text-white px-6 flex items-center justify-center overflow-hidden">
      <GoldNetworkBackground />
      <div className="relative z-10 text-center max-w-md">
        <p className="text-yellow-400 font-black text-5xl md:text-6xl mb-4">Ops</p>
        <h1 className="text-2xl md:text-3xl font-extrabold mb-3">Algo deu errado</h1>
        <p className="text-gray-400 text-sm md:text-base mb-8">
          Tivemos um problema inesperado ao carregar essa página. Tente de novo — se continuar, fala com a
          gente pelo WhatsApp.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => reset()}
            className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold px-6 py-3 hover:brightness-110 transition"
          >
            Tentar de novo
          </button>
          <Link
            href="/"
            className="rounded-lg border border-yellow-500/30 text-yellow-400 text-sm font-bold px-6 py-3 hover:bg-yellow-500/10 transition"
          >
            Voltar para o site
          </Link>
        </div>
      </div>
    </main>
  );
}
