"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import SaldoCarteira from "./SaldoCarteira";
import HistoricoPedidos from "./HistoricoPedidos";
import ExtratoCarteira from "./ExtratoCarteira";

type Pedido = {
  tipo: "aluguel" | "licenca";
  ferramenta: string;
  duracao: string;
  preco: number;
  status: string;
  data: string | null;
};

type Movimentacao = {
  tipo: string;
  valor_centavos: number;
  descricao: string | null;
  created_at: string | null;
};

type Aba = "dashboard" | "pedidos" | "extrato" | "depositos";

const ABAS: { id: Aba; label: string; emoji: string }[] = [
  { id: "dashboard", label: "Painel", emoji: "📊" },
  { id: "pedidos", label: "Meus Pedidos", emoji: "📦" },
  { id: "extrato", label: "Extrato", emoji: "📋" },
  { id: "depositos", label: "Depósitos", emoji: "💰" },
];

export default function PainelConta({
  saldoCentavos,
  pedidos,
  movimentacoes,
}: {
  saldoCentavos: number;
  pedidos: Pedido[];
  movimentacoes: Movimentacao[];
}) {
  const searchParams = useSearchParams();
  const abaInicial = (searchParams.get("tab") as Aba) || "dashboard";
  const [abaAtiva, setAbaAtiva] = useState<Aba>(
    ABAS.some((a) => a.id === abaInicial) ? abaInicial : "dashboard"
  );

  // Como o painel inteiro fica numa única página (as "abas" são só um
  // estado local), navegar de novo pra cá com um ?tab= diferente (ex: pelo
  // menu do header) não re-executa o useState acima — precisa sincronizar
  // sempre que o parâmetro da URL mudar.
  useEffect(() => {
    const abaDaUrl = searchParams.get("tab") as Aba | null;
    if (abaDaUrl && ABAS.some((a) => a.id === abaDaUrl) && abaDaUrl !== abaAtiva) {
      setAbaAtiva(abaDaUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const stats = useMemo(() => {
    const total = pedidos.length;
    const concluidos = pedidos.filter((p) => p.status === "concluido").length;
    const processando = total - concluidos;
    return { total, concluidos, processando };
  }, [pedidos]);

  const depositos = useMemo(
    () => movimentacoes.filter((m) => m.tipo === "deposito"),
    [movimentacoes]
  );

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 overflow-x-auto">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            onClick={() => setAbaAtiva(aba.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition ${
              abaAtiva === aba.id
                ? "border-yellow-400 text-yellow-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <span>{aba.emoji}</span> {aba.label}
          </button>
        ))}
      </div>

      {abaAtiva === "dashboard" && (
        <div>
          <SaldoCarteira saldoInicialCentavos={saldoCentavos} />

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4 text-center">
              <p className="text-2xl font-black text-white">{stats.total}</p>
              <p className="text-gray-500 text-[11px] uppercase mt-1">Pedidos</p>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-white/[0.03] p-4 text-center">
              <p className="text-2xl font-black text-emerald-400">{stats.concluidos}</p>
              <p className="text-gray-500 text-[11px] uppercase mt-1">Concluídos</p>
            </div>
            <div className="rounded-xl border border-amber-500/20 bg-white/[0.03] p-4 text-center">
              <p className="text-2xl font-black text-amber-400">{stats.processando}</p>
              <p className="text-gray-500 text-[11px] uppercase mt-1">Processando</p>
            </div>
          </div>

          <h2 className="text-white font-bold mb-3">Pedidos recentes</h2>
          <HistoricoPedidos pedidos={pedidos.slice(0, 3)} />

          {pedidos.length > 3 && (
            <button
              onClick={() => setAbaAtiva("pedidos")}
              className="mt-3 text-yellow-400 text-sm font-semibold hover:underline"
            >
              Ver todos os pedidos →
            </button>
          )}
        </div>
      )}

      {abaAtiva === "pedidos" && (
        <div>
          <h2 className="text-white font-bold mb-3">Meus pedidos</h2>
          <HistoricoPedidos pedidos={pedidos} />
        </div>
      )}

      {abaAtiva === "extrato" && (
        <div>
          <h2 className="text-white font-bold mb-3">Extrato da carteira</h2>
          <ExtratoCarteira movimentacoes={movimentacoes} />
        </div>
      )}

      {abaAtiva === "depositos" && (
        <div>
          <h2 className="text-white font-bold mb-3">Depósitos realizados</h2>
          <ExtratoCarteira movimentacoes={depositos} />
        </div>
      )}
    </div>
  );
}
