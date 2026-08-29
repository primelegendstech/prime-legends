import { buscarDepositosAdmin } from "@/lib/admin-carteira";
import FiltrosDepositos from "./FiltrosDepositos";
import DepositoCard from "./DepositoCard";

function formatarReaisCentavos(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminDepositosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; busca?: string }>;
}) {
  const params = await searchParams;

  const depositos = await buscarDepositosAdmin({
    status: (params.status as any) || "todos",
    busca: params.busca || "",
  });

  const totalPago = depositos
    .filter((d) => d.status === "pago")
    .reduce((s, d) => s + d.valorCentavos, 0);
  const totalPendente = depositos.filter((d) => d.status === "pendente").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-white font-bold">Depósitos</h2>
        <p className="text-gray-500 text-xs">
          {depositos.length} resultado{depositos.length !== 1 ? "s" : ""} · Pago: {formatarReaisCentavos(totalPago)}
          {totalPendente > 0 ? ` · ${totalPendente} pendente${totalPendente !== 1 ? "s" : ""}` : ""}
        </p>
      </div>
      <p className="text-gray-500 text-sm mb-4">Todas as tentativas de adicionar saldo na carteira, pagas ou não.</p>

      <FiltrosDepositos />

      {depositos.length === 0 ? (
        <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-6 text-center">
          <p className="text-gray-400 text-sm">Nenhum depósito encontrado com esses filtros.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {depositos.map((d) => (
            <DepositoCard key={d.id} deposito={d} />
          ))}
        </div>
      )}
    </div>
  );
}
