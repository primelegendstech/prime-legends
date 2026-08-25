"use client";

import { useState } from "react";
import { formatarCredenciais } from "@/lib/formatar-credenciais";
import type { PedidoCompleto } from "@/lib/buscar-pedidos-usuario";

function formatarData(data: string | null) {
  if (!data) return "";
  return new Date(data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatarPreco(preco: number) {
  return preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function BadgeStatus({ status }: { status: string }) {
  const concluido = status === "concluido";
  return (
    <span
      className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
        concluido ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
      }`}
    >
      {concluido ? "✓ Concluído" : "⏳ Processando"}
    </span>
  );
}

export default function OrdensServico({ pedidos }: { pedidos: PedidoCompleto[] }) {
  const [selecionado, setSelecionado] = useState<PedidoCompleto | null>(null);
  const [copiado, setCopiado] = useState(false);

  if (pedidos.length === 0) {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-6 text-center">
        <p className="text-gray-400 text-sm">Nenhuma ordem de serviço por aqui ainda.</p>
      </div>
    );
  }

  const credenciais = selecionado ? formatarCredenciais(selecionado.dados) : null;

  function copiarCredenciais() {
    if (!credenciais) return;
    const texto =
      credenciais.login || credenciais.senha
        ? `${credenciais.login ?? ""}${credenciais.login && credenciais.senha ? " / " : ""}${credenciais.senha ?? ""}`
        : credenciais.linhas.map((l) => `${l.label}: ${l.valor}`).join("\n");
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  return (
    <>
      <div className="space-y-3">
        {pedidos.map((pedido, i) => (
          <button
            key={i}
            onClick={() => setSelecionado(pedido)}
            className="w-full text-left rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4 flex items-center justify-between gap-3 hover:border-yellow-500/40 transition"
          >
            <div className="min-w-0 flex items-center gap-3">
              <BadgeStatus status={pedido.status} />
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {pedido.ferramenta} — {pedido.duracao}
                  <span className="text-gray-500 font-normal">
                    {" "}
                    ({pedido.tipo === "aluguel" ? "Aluguel" : "Licença"})
                  </span>
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {pedido.codigo ? `#${pedido.codigo} · ` : ""}
                  {formatarData(pedido.data)}
                </p>
              </div>
            </div>
            <p className="text-yellow-400 font-bold text-sm shrink-0">{formatarPreco(pedido.preco)}</p>
          </button>
        ))}
      </div>

      {selecionado && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setSelecionado(null)}
        >
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#0d0d0d] border border-yellow-500/25 rounded-2xl p-6 animate-hero-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelecionado(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 text-xl leading-none"
              aria-label="Fechar"
            >
              ✕
            </button>

            <p className="text-xs text-gray-500 uppercase font-bold mb-1">
              Ordem {selecionado.codigo ? `#${selecionado.codigo}` : ""}
            </p>
            <h3 className="text-xl font-black text-white mb-4 pr-8">
              {selecionado.ferramenta} — {selecionado.duracao}
            </h3>

            <div className="flex items-center justify-between bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Valor</p>
                <p className="text-lg font-extrabold text-yellow-400">
                  {formatarPreco(selecionado.preco)}
                </p>
              </div>
              <BadgeStatus status={selecionado.status} />
            </div>

            <div className="bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-2">Linha do tempo</p>
              <p className="text-sm text-gray-300">
                <span className="text-gray-500">Enviado em:</span> {formatarData(selecionado.data)}
              </p>
              <p className="text-sm text-gray-300 mt-1">
                <span className="text-gray-500">Tipo:</span>{" "}
                {selecionado.tipo === "aluguel" ? "Aluguel de ferramenta" : "Licença de ativação"}
              </p>
            </div>

            <div className="bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wide">Login e senha</p>
                {(credenciais?.login || credenciais?.senha || (credenciais?.linhas.length ?? 0) > 0) && (
                  <button
                    onClick={copiarCredenciais}
                    className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition"
                  >
                    {copiado ? "✓ Copiado" : "📋 Copiar"}
                  </button>
                )}
              </div>

              {selecionado.tipo === "licenca" ? (
                <p className="text-sm text-gray-400">
                  Licenças de ativação são liberadas manualmente — os dados foram enviados por WhatsApp
                  ou e-mail no momento da entrega.
                </p>
              ) : credenciais?.login || credenciais?.senha ? (
                <div className="space-y-1.5 text-sm">
                  {credenciais.login && (
                    <p className="text-gray-300">
                      <span className="text-gray-500">Login:</span>{" "}
                      <span className="text-white font-semibold">{credenciais.login}</span>
                    </p>
                  )}
                  {credenciais.senha && (
                    <p className="text-gray-300">
                      <span className="text-gray-500">Senha:</span>{" "}
                      <span className="text-white font-semibold">{credenciais.senha}</span>
                    </p>
                  )}
                </div>
              ) : credenciais && credenciais.linhas.length > 0 ? (
                <div className="space-y-1.5 text-sm">
                  {credenciais.linhas.map((l, i) => (
                    <p key={i} className="text-gray-300">
                      <span className="text-gray-500">{l.label}:</span>{" "}
                      <span className="text-white font-semibold">{l.valor}</span>
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  {selecionado.status === "concluido"
                    ? "Nenhum dado de acesso registrado pra esse pedido."
                    : "Ainda sendo gerado — atualize essa página em alguns instantes."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
