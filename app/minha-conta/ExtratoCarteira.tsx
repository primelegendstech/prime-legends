type Movimentacao = {
  tipo: string;
  valor_centavos: number;
  descricao: string | null;
  created_at: string | null;
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

function formatarReais(centavos: number) {
  return (Math.abs(centavos) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const ROTULOS: Record<string, string> = {
  deposito: "Depósito",
  compra: "Compra",
  estorno: "Estorno",
};

export default function ExtratoCarteira({ movimentacoes }: { movimentacoes: Movimentacao[] }) {
  if (movimentacoes.length === 0) {
    return (
      <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-6 text-center">
        <p className="text-gray-400 text-sm">Nenhuma movimentação por aqui ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {movimentacoes.map((mov, i) => {
        const entrada = mov.tipo === "deposito" || mov.tipo === "estorno";
        return (
          <div
            key={i}
            className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm truncate">
                {ROTULOS[mov.tipo] ?? mov.tipo}
                {mov.descricao ? ` — ${mov.descricao}` : ""}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">{formatarData(mov.created_at)}</p>
            </div>
            <p className={`font-bold text-sm shrink-0 ${entrada ? "text-emerald-400" : "text-red-400"}`}>
              {entrada ? "+" : "-"} {formatarReais(mov.valor_centavos)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
