"use client";

import { useState, useMemo } from "react";
import CheckoutPix from "@/components/CheckoutPix";
import DetalheServicoModal from "@/components/DetalheServicoModal";
import { ferramentas, type Ferramenta, type Plano } from "@/data/ferramentas";
import { useIdioma } from "@/context/LanguageContext";

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type Listagem = {
  ferramenta: Ferramenta;
  plano: Plano;
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
    online: "🟢 ONLINE",
    manutencao: "🔴 EM MANUTENÇÃO",
    indisponivel: "Indisponível",
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
    online: "🟢 ONLINE",
    manutencao: "🔴 MAINTENANCE",
    indisponivel: "Unavailable",
    vazio: (busca: string) => `No service found for "${busca}".`,
  },
};

export default function AlugueisContent() {
  const { idioma } = useIdioma();
  const t = textos[idioma];

  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [detalheAberto, setDetalheAberto] = useState<Listagem | null>(null);
  const [planoSelecionado, setPlanoSelecionado] = useState<{
    ferramenta: string;
    nome: string;
    preco: number;
  } | null>(null);

  const listagens: Listagem[] = useMemo(() => {
    return ferramentas.flatMap((f) => f.planos.map((p) => ({ ferramenta: f, plano: p })));
  }, []);

  const listagensFiltradas = useMemo(() => {
    let resultado = listagens;

    if (busca.trim()) {
      const termo = normalizar(busca);
      resultado = resultado.filter(
        (l) =>
          normalizar(l.ferramenta.nome).includes(termo) ||
          normalizar(l.plano.nome).includes(termo)
      );
    }

    if (filtro === "instantaneo") {
      resultado = resultado.filter((l) => l.plano.instantaneo);
    }

    if (filtro === "barato") {
      resultado = [...resultado].sort((a, b) => a.plano.preco - b.plano.preco);
    }

    return resultado;
  }, [busca, filtro, listagens]);

  const chips: { key: Filtro; label: string }[] = [
    { key: "todos", label: t.filtroTodos },
    { key: "instantaneo", label: t.filtroInstantaneo },
    { key: "barato", label: t.filtroBarato },
  ];

  function abrirCheckoutDireto(l: Listagem) {
    if (l.ferramenta.online === false) return;
    setPlanoSelecionado({
      ferramenta: l.ferramenta.nome,
      nome: l.plano.nome,
      preco: l.plano.preco,
    });
  }

  function confirmarAluguelDoModal() {
    if (!detalheAberto) return;
    abrirCheckoutDireto(detalheAberto);
    setDetalheAberto(null);
  }

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
            {listagensFiltradas.map((l, i) => {
              const offline = l.ferramenta.online === false;
              return (
                <button
                  key={`${l.ferramenta.nome}-${l.plano.nome}-${i}`}
                  onClick={() => setDetalheAberto(l)}
                  className={`flex items-center gap-4 bg-white/[0.03] border rounded-xl p-4 transition text-left ${
                    offline
                      ? "border-red-500/20 opacity-60"
                      : "border-yellow-500/15 hover:border-yellow-400/50"
                  }`}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10 relative">
                    <img
                      src={l.ferramenta.imagens[0]}
                      alt={l.ferramenta.nome}
                      className={`w-full h-full object-cover ${offline ? "grayscale" : ""}`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm md:text-base leading-tight">
                      # {l.ferramenta.nome}
                      {l.ferramenta.badge && (
                        <span className="ml-2 text-[10px] font-semibold text-yellow-400 border border-yellow-400/50 px-1.5 py-0.5 rounded">
                          {l.ferramenta.badge}
                        </span>
                      )}
                    </p>
                    <p className="text-gray-400 text-xs md:text-sm">{l.plano.nome}</p>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-sm font-extrabold bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                        R$ {l.plano.preco.toFixed(2).replace(".", ",")}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          offline
                            ? "text-red-400 border-red-400/40 bg-red-400/10"
                            : "text-emerald-400 border-emerald-400/40 bg-emerald-400/10"
                        }`}
                      >
                        {offline ? t.manutencao : t.online}
                      </span>
                      {!offline && l.plano.instantaneo && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-emerald-400 border-emerald-400/40 bg-emerald-400/10">
                          {t.instantaneo}
                        </span>
                      )}
                      {!offline && !l.plano.instantaneo && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-amber-400 border-amber-400/40 bg-amber-400/10">
                          {t.minutos}
                        </span>
                      )}
                      {!offline && l.plano.destaque && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-black">
                          {t.popular}
                        </span>
                      )}
                    </div>
                  </div>

                  {offline ? (
                    <span className="flex-shrink-0 px-4 py-2 rounded-full font-bold text-gray-400 bg-white/[0.05] border border-white/10 text-xs md:text-sm whitespace-nowrap cursor-not-allowed">
                      {t.indisponivel}
                    </span>
                  ) : (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetalheAberto(l);
                      }}
                      className="flex-shrink-0 px-4 py-2 rounded-full font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 transition text-xs md:text-sm whitespace-nowrap"
                    >
                      {t.alugar}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-8 text-center">{t.vazio(busca)}</p>
        )}
      </div>

      {detalheAberto && (
        <DetalheServicoModal
          ferramenta={detalheAberto.ferramenta}
          plano={detalheAberto.plano}
          onFechar={() => setDetalheAberto(null)}
          onAlugar={confirmarAluguelDoModal}
        />
      )}

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
