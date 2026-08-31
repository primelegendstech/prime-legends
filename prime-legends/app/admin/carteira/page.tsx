import { buscarClientesCarteira } from "@/lib/admin-carteira";
import BuscaCliente from "./BuscaCliente";
import ClienteCarteiraCard from "./ClienteCarteiraCard";

function formatarReaisCentavos(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminCarteiraPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>;
}) {
  const params = await searchParams;
  const clientes = await buscarClientesCarteira(params.busca || "");
  const saldoTotal = clientes.reduce((s, c) => s + c.saldoCentavos, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-white font-bold">Carteira dos clientes</h2>
        <p className="text-gray-500 text-xs">
          {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} · Total: {formatarReaisCentavos(saldoTotal)}
        </p>
      </div>
      <p className="text-gray-500 text-sm mb-4">Saldo, extrato e ajustes manuais (crédito/débito) por cliente.</p>

      <BuscaCliente />

      {clientes.length === 0 ? (
        <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-6 text-center">
          <p className="text-gray-400 text-sm">Nenhum cliente encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clientes.map((c) => (
            <ClienteCarteiraCard key={c.usuarioId} cliente={c} />
          ))}
        </div>
      )}
    </div>
  );
}
