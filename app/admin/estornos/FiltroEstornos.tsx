"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function FiltroEstornos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState(searchParams.get("busca") ?? "");

  function enviarBusca(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (busca.trim()) {
      params.set("busca", busca.trim());
    } else {
      params.delete("busca");
    }
    router.push(`/admin/estornos?${params.toString()}`);
  }

  return (
    <form onSubmit={enviarBusca} className="flex gap-2 mb-5">
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por e-mail, nome ou motivo..."
        className="flex-1 rounded-lg bg-white/[0.04] border border-yellow-500/20 text-white text-sm px-3.5 py-2.5 placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50"
      />
      <button
        type="submit"
        className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold px-4 py-2.5 hover:brightness-110 transition"
      >
        Buscar
      </button>
    </form>
  );
}
