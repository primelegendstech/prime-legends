"use client";

import { useState } from "react";
import type { PedidoAdmin } from "@/lib/admin-pedidos";

function formatarReais(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

const ROTULO_TIPO: Record<string, string> = { aluguel: "Aluguel", licenca: "Licença", metodo: "Método" };
const ROTULO_STATUS: Record<string, { texto: string; cor: string }> = {
  concluido: { texto: "Concluído", cor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  processando: { texto: "Processando", cor: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  manual: { texto: "Manual", cor: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  erro: { texto: "Erro", cor: "text-red-400 border-red-500/30 bg-red-500/10" },
};

export default function PedidoCard({ pedido }: { pedido: PedidoAdmin }) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [detalhesPagamento, setDetalhesPagamento] = useState<any>(null);

  const st = ROTULO_STATUS[pedido.status];

  async function chamarAcao(acao: string, url: string, body: any) {
    setCarregando(acao);
    setMensagem(null);
    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMensagem({ tipo: "erro", texto: data.erro || "Falha na ação" });
      } else {
        setMensagem({ tipo: "ok", texto: acaoSucessoTexto(acao) });
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de conexão" });
    } finally {
      setCarregando(null);
    }
  }

  function acaoSucessoTexto(acao: string) {
    if (acao === "entregue") return "Marcado como entregue e cliente notificado.";
    if (acao === "email") return "E-mail reenviado com sucesso.";
    if (acao === "estornar") return "Pagamento estornado no Mercado Pago.";
    if (acao === "estornar-saldo") return "Valor devolvido pro saldo do cliente.";
    return "Feito.";
  }

  async function verPagamento() {
    setCarregando("ver");
    setMensagem(null);
    try {
      const resp = await fetch(`/api/admin/pagamento/${pedido.id}`);
      const data = await resp.json();
      if (!resp.ok) {
        setMensagem({ tipo: "erro", texto: data.erro || "Falha ao consultar" });
      } else {
        setDetalhesPagamento(data);
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de conexão" });
    } finally {
      setCarregando(null);
    }
  }

  const podeMarcarEntregue =
    (pedido.tipo === "aluguel" && pedido.status !== "concluido") ||
    (pedido.tipo === "licenca" && !pedido.entregueManual);

  return (
    <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] overflow-hidden">
      <button
        onClick={() => setAberto(!aberto)}
        className="w-full p-4 flex items-center justify-between gap-3 flex-wrap text-left"
      >
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">
            <span className="text-yellow-400/80">{ROTULO_TIPO[pedido.tipo]}</span> — {pedido.ferramenta} {pedido.duracao}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            {pedido.emailCliente ?? "sem e-mail"} · {formatarReais(pedido.preco)} · {formatarData(pedido.criadoEm)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${st.cor}`}>{st.texto}</span>
          <span className="text-gray-500 text-xs">{aberto ? "▲" : "▼"}</span>
        </div>
      </button>

      {aberto && (
        <div className="border-t border-yellow-500/10 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <p>
              <span className="text-gray-600">Payment ID:</span> {pedido.id}
            </p>
            {pedido.codigo && (
              <p>
                <span className="text-gray-600">Código:</span> {pedido.codigo}
              </p>
            )}
            {pedido.nomeCliente && (
              <p>
                <span className="text-gray-600">Nome:</span> {pedido.nomeCliente}
              </p>
            )}
            <p>
              <span className="text-gray-600">Pago com:</span> {pedido.pagoComSaldo ? "Saldo interno" : "Mercado Pago"}
            </p>
            {pedido.estornado && (
              <p className="text-red-400 font-semibold">↩ Já estornado</p>
            )}
          </div>

          {pedido.dados && (
            <pre className="text-[11px] text-gray-500 bg-black/30 rounded-lg p-3 overflow-x-auto max-h-40">
              {JSON.stringify(pedido.dados, null, 2)}
            </pre>
          )}

          {mensagem && (
            <p className={`text-xs font-semibold ${mensagem.tipo === "ok" ? "text-emerald-400" : "text-red-400"}`}>
              {mensagem.texto}
            </p>
          )}

          {detalhesPagamento && (
            <div className="text-xs text-gray-400 bg-black/30 rounded-lg p-3 space-y-1">
              <p>
                <span className="text-gray-600">Status MP:</span> {detalhesPagamento.status} ({detalhesPagamento.status_detail})
              </p>
              <p>
                <span className="text-gray-600">Método:</span> {detalhesPagamento.metodo}
              </p>
              <p>
                <span className="text-gray-600">Estornado:</span> {formatarReais((detalhesPagamento.valorEstornado || 0))}
              </p>
              <a href={detalhesPagamento.linkPainelMp} target="_blank" className="text-yellow-400 hover:underline">
                Ver no Mercado Pago →
              </a>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            {podeMarcarEntregue && (
              <button
                disabled={!!carregando}
                onClick={() =>
                  chamarAcao("entregue", "/api/admin/pedidos/marcar-entregue", { tipo: pedido.tipo, paymentId: pedido.id })
                }
                className="text-xs font-bold px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition disabled:opacity-50"
              >
                {carregando === "entregue" ? "Marcando..." : "✓ Marcar como entregue"}
              </button>
            )}

            {pedido.emailCliente && (
              <button
                disabled={!!carregando}
                onClick={() =>
                  chamarAcao("email", "/api/admin/pedidos/reenviar-email", { tipo: pedido.tipo, paymentId: pedido.id })
                }
                className="text-xs font-bold px-3 py-2 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition disabled:opacity-50"
              >
                {carregando === "email" ? "Enviando..." : "✉ Reenviar e-mail"}
              </button>
            )}

            {!pedido.pagoComSaldo && (
              <>
                <button
                  disabled={!!carregando}
                  onClick={verPagamento}
                  className="text-xs font-bold px-3 py-2 rounded-lg bg-white/[0.05] text-gray-300 border border-white/10 hover:bg-white/[0.08] transition disabled:opacity-50"
                >
                  {carregando === "ver" ? "Consultando..." : "🔍 Ver pagamento"}
                </button>

                {!pedido.estornado && (
                  <button
                    disabled={!!carregando}
                    onClick={() => {
                      if (confirm(`Estornar ${formatarReais(pedido.preco)} desse pagamento no Mercado Pago?`)) {
                        chamarAcao("estornar", "/api/admin/pagamento/estornar", {
                          paymentId: pedido.id,
                          tipo: pedido.tipo,
                        });
                      }
                    }}
                    className="text-xs font-bold px-3 py-2 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition disabled:opacity-50"
                  >
                    {carregando === "estornar" ? "Estornando..." : "↩ Estornar pagamento"}
                  </button>
                )}
              </>
            )}

            {pedido.pagoComSaldo && !pedido.estornado && (
              <button
                disabled={!!carregando}
                onClick={() => {
                  if (
                    confirm(
                      `Devolver ${formatarReais(pedido.preco)} pro saldo do cliente (${pedido.emailCliente ?? "sem e-mail"})?`
                    )
                  ) {
                    chamarAcao("estornar-saldo", "/api/admin/pedidos/estornar-saldo", {
                      paymentId: pedido.id,
                      tipo: pedido.tipo,
                    });
                  }
                }}
                className="text-xs font-bold px-3 py-2 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition disabled:opacity-50"
              >
                {carregando === "estornar-saldo" ? "Devolvendo..." : "↩ Estornar (creditar saldo)"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
