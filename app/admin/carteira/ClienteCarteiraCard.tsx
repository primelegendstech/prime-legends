"use client";

import { useState } from "react";
import type { ClienteCarteira } from "@/lib/admin-carteira";

function formatarReaisCentavos(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(data: string | null) {
  if (!data) return "";
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const ROTULOS: Record<string, string> = { deposito: "Depósito", compra: "Compra", estorno: "Estorno/Ajuste" };

export default function ClienteCarteiraCard({ cliente }: { cliente: ClienteCarteira }) {
  const [aberto, setAberto] = useState(false);
  const [extrato, setExtrato] = useState<any[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [tipoAjuste, setTipoAjuste] = useState<"credito" | "debito">("credito");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);
  const [saldoAtual, setSaldoAtual] = useState(cliente.saldoCentavos);

  async function abrirExtrato() {
    const novoAberto = !aberto;
    setAberto(novoAberto);
    if (novoAberto && !extrato) {
      setCarregando(true);
      try {
        const resp = await fetch(`/api/admin/carteira/extrato?usuarioId=${cliente.usuarioId}`);
        const data = await resp.json();
        setExtrato(data.movimentacoes ?? []);
      } catch {
        setExtrato([]);
      } finally {
        setCarregando(false);
      }
    }
  }

  async function enviarAjuste(e: React.FormEvent) {
    e.preventDefault();
    const valorNum = Number(valor.replace(",", "."));
    if (!valorNum || valorNum <= 0) {
      setMensagem({ tipo: "erro", texto: "Informe um valor válido" });
      return;
    }

    setCarregando(true);
    setMensagem(null);
    try {
      const resp = await fetch("/api/admin/carteira/ajustar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId: cliente.usuarioId, tipoAjuste, valorReais: valorNum, descricao }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setMensagem({ tipo: "erro", texto: data.erro || "Falha no ajuste" });
      } else {
        const delta = tipoAjuste === "credito" ? valorNum * 100 : -valorNum * 100;
        setSaldoAtual((s) => s + delta);
        setMensagem({ tipo: "ok", texto: "Ajuste aplicado com sucesso." });
        setValor("");
        setDescricao("");
        setExtrato(null); // força recarregar na próxima abertura
      }
    } catch {
      setMensagem({ tipo: "erro", texto: "Erro de conexão" });
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] overflow-hidden">
      <button onClick={abrirExtrato} className="w-full p-4 flex items-center justify-between gap-3 flex-wrap text-left">
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{cliente.nome || cliente.email}</p>
          <p className="text-gray-500 text-xs mt-0.5 truncate">{cliente.email}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-yellow-400 font-bold text-sm">{formatarReaisCentavos(saldoAtual)}</span>
          <span className="text-gray-500 text-xs">{aberto ? "▲" : "▼"}</span>
        </div>
      </button>

      {aberto && (
        <div className="border-t border-yellow-500/10 p-4 space-y-4">
          <form onSubmit={enviarAjuste} className="flex flex-wrap gap-2 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Ação</label>
              <select
                value={tipoAjuste}
                onChange={(e) => setTipoAjuste(e.target.value as any)}
                className="rounded-lg bg-white/[0.04] border border-yellow-500/20 text-white text-sm px-3 py-2 focus:outline-none"
              >
                <option value="credito">Creditar (+)</option>
                <option value="debito">Debitar (-)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Valor (R$)</label>
              <input
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
                className="w-28 rounded-lg bg-white/[0.04] border border-yellow-500/20 text-white text-sm px-3 py-2 placeholder:text-gray-600 focus:outline-none"
              />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs text-gray-500 block mb-1">Motivo (opcional)</label>
              <input
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: reembolso combinado no WhatsApp"
                className="w-full rounded-lg bg-white/[0.04] border border-yellow-500/20 text-white text-sm px-3 py-2 placeholder:text-gray-600 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={carregando}
              className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold px-4 py-2 hover:brightness-110 transition disabled:opacity-50"
            >
              Aplicar
            </button>
          </form>

          {mensagem && (
            <p className={`text-xs font-semibold ${mensagem.tipo === "ok" ? "text-emerald-400" : "text-red-400"}`}>
              {mensagem.texto}
            </p>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-2">Últimas movimentações</p>
            {carregando && !extrato ? (
              <p className="text-xs text-gray-600">Carregando...</p>
            ) : extrato && extrato.length > 0 ? (
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {extrato.map((mov, i) => {
                  const entrada = mov.tipo === "deposito" || mov.tipo === "estorno";
                  return (
                    <div key={i} className="flex items-center justify-between text-xs bg-black/20 rounded-lg px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-gray-300 truncate">
                          {ROTULOS[mov.tipo] ?? mov.tipo}
                          {mov.descricao ? ` — ${mov.descricao}` : ""}
                        </p>
                        <p className="text-gray-600">{formatarData(mov.created_at)}</p>
                      </div>
                      <span className={`font-bold shrink-0 ${entrada ? "text-emerald-400" : "text-red-400"}`}>
                        {entrada ? "+" : "-"} {formatarReaisCentavos(mov.valor_centavos)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-gray-600">Sem movimentações.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
