"use client";

import { useState, useMemo } from "react";
import CheckoutAtivacao from "@/components/CheckoutAtivacao";
import DetalheAtivacaoModal from "@/components/DetalheAtivacaoModal";
import { ativacoes, type Ativacao, type PlanoAtivacao } from "@/data/ativacoes";

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

type Listagem = {
  ativacao: Ativacao;
  plano: PlanoAtivacao;
};

type Filtro = "todos" | "ativacao" | "credito" | "barato";

export default function AtivacoesContent() {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [detalheAberto, setDetalheAberto] = useState<Listagem | null>(null);
  const [planoSelecionado, setPlanoSelecionado] = useState<{
    ferramenta: string;
    nome: string;
    preco: number;
    nomeCliente: string;
    username: string;
    senha: string;
    email: string;
  } | null>(null);

  const listagens: Listagem[] = useMemo(() => {
    return ativacoes.flatMap((a) => a.planos.map((p) => ({ ativacao: a, plano: p })));
  }, []);

  const listagensFiltradas = useMemo(() => {
    let resultado = listagens;

    if (busca.trim()) {
      const termo = normalizar(busca);
      resultado = resultado.filter(
        (l) =>
          normalizar(l.ativacao.nome).includes(termo) ||
          normalizar(l.plano.nome).includes(termo)
      );
    }

    if (filtro === "ativacao") {
      resultado = resultado.filter((l) => (l.plano.tipo ?? "ativacao") === "ativacao");
    }

    if (filtro === "credito") {
      resultado = resultado.filter((l) => l.plano.tipo === "credito");
    }

    if (filtro === "barato") {
      resultado = [...resultado].sort((a, b) => a.plano.preco - b.plano.preco);
    }

    return resultado;
  }, [busca, filtro, listagens]);

  const chips: { key: Filtro; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "ativacao", label: "🔑 Ativação" },
    { key: "credito", label: "💳 Créditos" },
    { key: "barato", label: "💰 Mais baratos" },
  ];

  function abrirCheckoutDireto(l: Listagem, dados: { nome: string; username: string; senha: string; email: string }) {
    setPlanoSelecionado({
      ferramenta: l.ativacao.nome,
      nome: l.plano.nome,
      preco: l.plano.preco,
      nomeCliente: dados.nome,
      username: dados.username,
      senha: dados.senha,
      email: dados.email,
    });
  }

  function confirmarAtivacaoDoModal(dados: { nome: string; username: string; senha: string; email: string }) {
    if (!detalheAberto) return;
    abrirCheckoutDireto(detalheAberto, dados);
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
                LICENÇAS <span className="text-yellow-400 italic">• CRÉDITOS</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">Início › Licenças • Créditos</p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar serviço..."
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
            {listagensFiltradas.map((l, i) => (
              <button
                key={`${l.ativacao.nome}-${l.plano.nome}-${i}`}
                onClick={() => setDetalheAberto(l)}
                className="flex items-center gap-4 bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4 hover:border-yellow-400/50 transition text-left"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10">
                  <img
                    src={l.ativacao.imagens[0]}
                    alt={l.ativacao.nome}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold text-sm md:text-base leading-tight">
                    # {l.ativacao.nome}
                    {l.ativacao.badge && (
                      <span className="ml-2 text-[10px] font-semibold text-yellow-400 border border-yellow-400/50 px-1.5 py-0.5 rounded">
                        {l.ativacao.badge}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400 text-xs md:text-sm">{l.plano.nome}</p>

                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-sm font-extrabold bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                      R$ {l.plano.preco.toFixed(2).replace(".", ",")}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border text-amber-400 border-amber-400/40 bg-amber-400/10">
                      🕐 MINUTOS
                    </span>
                    {l.plano.destaque && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-black">
                        POPULAR
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className="flex-shrink-0 px-4 py-2 rounded-full font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 transition text-xs md:text-sm whitespace-nowrap"
                >
                  Ativar
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-8 text-center">
            Nenhum serviço encontrado para &quot;{busca}&quot;.
          </p>
        )}
      </div>

      {detalheAberto && (
        <DetalheAtivacaoModal
          ativacao={detalheAberto.ativacao}
          plano={detalheAberto.plano}
          onFechar={() => setDetalheAberto(null)}
          onAtivar={confirmarAtivacaoDoModal}
        />
      )}

      {planoSelecionado && (
        <CheckoutAtivacao
          ferramenta={planoSelecionado.ferramenta}
          duracao={planoSelecionado.nome}
          preco={planoSelecionado.preco}
          nome={planoSelecionado.nomeCliente}
          username={planoSelecionado.username}
          senha={planoSelecionado.senha}
          email={planoSelecionado.email}
          onFechar={() => setPlanoSelecionado(null)}
        />
      )}
    </>
  );
}
