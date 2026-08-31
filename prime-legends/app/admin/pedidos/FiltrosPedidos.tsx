"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const TIPOS = [
  { valor: "todos", label: "Todos" },
  { valor: "aluguel", label: "Aluguel" },
  { valor: "licenca", label: "Licença" },
  { valor: "metodo", label: "Método" },
];

const STATUS = [
  { valor: "todos", label: "Todos" },
  { valor: "concluido", label: "Concluído" },
  { valor: "processando", label: "Processando" },
  { valor: "manual", label: "Manual" },
  { valor: "erro", label: "Erro" },
];

export default function FiltrosPedidos() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busca, setBusca] = useState(searchParams.get("busca") ?? "");

  const tipoAtual = searchParams.get("tipo") ?? "todos";
  const statusAtual = searchParams.get("status") ?? "todos";

  function aplicarFiltro(chave: string, valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor === "todos" || !valor) {
      params.delete(chave);
    } else {
      params.set(chave, valor);
    }
    params.delete("pagina");
    router.push(`/admin/pedidos?${params.toString()}`);
  }

  function enviarBusca(e: React.FormEvent) {
    e.preventDefault();
    aplicarFiltro("busca", busca);
  }

  return (
    <div className="space-y-3 mb-5">
      <form onSubmit={enviarBusca} className="flex gap-2">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por e-mail, código, ferramenta ou payment ID..."
          className="flex-1 rounded-lg bg-white/[0.04] border border-yellow-500/20 text-white text-sm px-3.5 py-2.5 placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50"
        />
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold px-4 py-2.5 hover:brightness-110 transition"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5">
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            onClick={() => aplicarFiltro("tipo", t.valor)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
              tipoAtual === t.valor
                ? "bg-yellow-400/15 text-yellow-400 border-yellow-500/40"
                : "text-gray-400 border-white/10 hover:border-white/25"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="w-px bg-white/10 mx-1" />
        {STATUS.map((s) => (
          <button
            key={s.valor}
            onClick={() => aplicarFiltro("status", s.valor)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition ${
              statusAtual === s.valor
                ? "bg-yellow-400/15 text-yellow-400 border-yellow-500/40"
                : "text-gray-400 border-white/10 hover:border-white/25"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
