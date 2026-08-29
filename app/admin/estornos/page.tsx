import { buscarEstornosAdmin } from "@/lib/admin-carteira";
import FiltroEstornos from "./FiltroEstornos";

function formatarReaisCentavos(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

export default async function AdminEstornosPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>;
}) {
  const params = await searchParams;
  const estornos = await buscarEstornosAdmin(params.busca || "");
  const total = estornos.reduce((s, e) => s + e.valorCentavos, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-white font-bold">Estornos e reembolsos</h2>
        <p className="text-gray-500 text-xs">
          {estornos.length} registro{estornos.length !== 1 ? "s" : ""} · Total creditado: {formatarReaisCentavos(total)}
        </p>
      </div>
      <p className="text-gray-500 text-sm mb-4">
        Todo crédito de estorno lançado na carteira de um cliente — tanto pelo botão "Estornar (creditar saldo)" num
        pedido quanto por um ajuste manual na aba Carteira.
      </p>

      <FiltroEstornos />

      {estornos.length === 0 ? (
        <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-6 text-center">
          <p className="text-gray-400 text-sm">Nenhum estorno encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {estornos.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4 flex items-center justify-between gap-3 flex-wrap"
            >
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{e.nome || e.email}</p>
                <p className="text-gray-500 text-xs mt-0.5 truncate">{e.email}</p>
                {e.descricao && <p className="text-gray-400 text-xs mt-1">{e.descricao}</p>}
                <p className="text-gray-600 text-xs mt-1">{formatarData(e.criadoEm)}</p>
              </div>
              <span className="text-emerald-400 font-bold text-sm shrink-0">
                + {formatarReaisCentavos(e.valorCentavos)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
