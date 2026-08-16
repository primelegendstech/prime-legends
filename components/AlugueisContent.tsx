"use client";

import { useState, useMemo } from "react";
import CheckoutPix from "@/components/CheckoutPix";
import { ferramentas } from "@/data/ferramentas";
import { useIdioma } from "@/context/LanguageContext";

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type Listagem = {
  ferramentaNome: string;
  badge?: string;
  imagem: string;
  planoNome: string;
  preco: number;
  destaque?: boolean;
  instantaneo?: boolean;
};

type Filtro = "todos" | "instantaneo" | "barato";

const textos = {
  pt: {
    titulo: "ALUGUEL DE FERRAMENTAS GSM",
    subtitulo: "- TEMPORÁRIO",
    breadcrumb: "Início › Aluguel de Ferramentas",
    buscarPlaceholder: "Buscar serviço...",
    filtroTodos: "Todos",
    filtroInstantaneo: "⚡ Instantâneo",
    filtroBarato: "💰 Mais baratos",
    alugar: "Alugar",
    instantaneo: "⚡ INSTANTÂNEO",
    minutos: "🕐 MINUTOS",
    popular: "POPULAR",
    vazio: (busca: string) => `Nenhum serviço encontrado para "${busca}".`,
  },
  en: {
    titulo: "GSM TOOL RENTALS",
    subtitulo: "- TEMPORARY",
    breadcrumb: "Home › Tool Rentals",
    buscarPlaceholder: "Search service...",
    filtroTodos: "All",
    filtroInstantaneo: "⚡ Instant",
    filtroBarato: "💰 Cheapest",
    alugar: "Rent",
    instantaneo: "⚡ INSTANT",
    minutos: "🕐 MINUTES",
    popular: "POPULAR",
    vazio: (busca: string) => `No service found for "${busca}".`,
  },
};

export default function AlugueisContent() {
  const { idioma } = useIdioma();
  const t = textos[idioma];

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [planoSelecionado, setPlanoSelecionado] = useState<{
    ferramenta: string;
    nome: string;
    preco: number;
  } | null>(null);

  const listagens: Listagem[] = useMemo(() => {
    return ferramentas.flatMap((f) =>
      f.planos.map((p) => ({
        ferramentaNome: f.nome,
        badge: f.badge,
        imagem: f.imagens[0],
        planoNome: p.nome,
        preco: p.preco,
        destaque: p.destaque,
        instantaneo: p.instantaneo,
      }))
    );
  }, []);

  const listagensFiltradas = useMemo(() => {
    let resultado = listagens;

    if (busca.trim()) {
      const termo = normalizar(busca);
      resultado = resultado.filter(
        (l) =>
          normalizar(l.ferramentaNome).includes(termo) ||
          normalizar(l.planoNome).includes(termo)
      );
    }

    if (filtro === "instantaneo") {
      resultado = resultado.filter((l) => l.instantaneo);
    }

    if (filtro === "barato") {
      resultado = [...resultado].sort((a, b) => a.preco - b.preco);
    }

    return resultado;
  }, [busca, filtro, listagens]);

  const chips: { key: Filtro; label: string }[] = [
    { key: "todos", label: t.filtroTodos },
    { key: "instantaneo", label: t.filtroInstantaneo },
    { key: "barato", label: t.filtroBarato },
  ];

  return (
    <>
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-yellow-400 rounded-full" />
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">
                {t.titulo} <span className="text-yellow-400 italic">{t.subtitulo}</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">{t.breadcrumb}</p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder={t.buscarPlaceholder}
              className="w-full bg-white/[0.04] border border-yellow-500/20 rounded-full pl-11 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400/60 transition"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-yellow-400 text-sm"
                aria-label="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Chips de filtro rápido */}
        <div className="flex flex-wrap gap-2 mb-6">
          {chips.map((c) => (
            <button
              key={c.key}
              onClick={() => setFiltro(c.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition border ${
                filtro === c.key
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black border-transparent"
                  : "text-gray-300 border-yellow-500/20 hover:border-yellow-400/50 hover:text-yellow-400"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {listagensFiltradas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {listagensFiltradas.map((l, i) => (
              <div
                key={`${l.ferramentaNome}-${l.planoNome}-${i}`}
                className="flex items-center gap-4 bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4 hover:border-yellow-400/50 transition"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10">
                  <img
                    src={l.imagem}
                    alt={l.ferramentaNome}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold text-sm md:text-base leading-tight">
                    # {l.ferramentaNome}
                    {l.badge && (
                      <span className="ml-2 text-[10px] font-semibold text-yellow-400 border border-yellow-400/50 px-1.5 py-0.5 rounded">
                        {l.badge}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400 text-xs md:text-sm">{l.planoNome}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-sm font-extrabold bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                      R$ {l.preco.toFixed(2).replace(".", ",")}
                    </span>
                    {l.instantaneo ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-emerald-400 border-emerald-400/40 bg-emerald-400/10">
                        {t.instantaneo}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-amber-400 border-amber-400/40 bg-amber-400/10">
                        {t.minutos}
                      </span>
                    )}
                    {l.destaque && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-black">
                        {t.popular}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    setPlanoSelecionado({
                      ferramenta: l.ferramentaNome,
                      nome: l.planoNome,
                      preco: l.preco,
                    })
                  }
                  className="flex-shrink-0 px-4 py-2 rounded-full font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 transition text-xs md:text-sm whitespace-nowrap"
                >
                  {t.alugar}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-8 text-center">{t.vazio(busca)}</p>
        )}
      </div>

      {planoSelecionado && (
        <CheckoutPix
          ferramenta={planoSelecionado.ferramenta}
          duracao={planoSelecionado.nome}
          preco={planoSelecionado.preco}
          onFechar={() => setPlanoSelecionado(null)}
        />
      )}
    </>
  );
}
