type Pedido = {
  tipo: "aluguel" | "licenca";
  ferramenta: string;
  duracao: string;
  preco: number;
  status: string;
  data: string | null;
};

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

export default function HistoricoPedidos({ pedidos }: { pedidos: Pedido[] }) {
  if (pedidos.length === 0) {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-6 text-center">
        <p className="text-gray-400 text-sm">Você ainda não fez nenhum pedido.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pedidos.map((pedido, i) => (
        <div
          key={i}
          className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4 flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {pedido.ferramenta} — {pedido.duracao}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">{formatarData(pedido.data)}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-yellow-400 font-bold text-sm">{formatarPreco(pedido.preco)}</p>
            <span
              className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                pedido.status === "concluido"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-amber-500/15 text-amber-400"
              }`}
            >
              {pedido.status === "concluido" ? "Concluído" : "Processando"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
