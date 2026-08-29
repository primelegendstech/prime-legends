import type { DepositoAdmin } from "@/lib/admin-carteira";

function formatarReais(centavos: number) {
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

const STATUS_ESTILO: Record<string, string> = {
  pago: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  pendente: "text-amber-400 border-amber-500/30 bg-amber-500/10",
};

const STATUS_TEXTO: Record<string, string> = {
  pago: "Pago",
  pendente: "Pendente",
};

export default function DepositoCard({ deposito }: { deposito: DepositoAdmin }) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4 flex items-center justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white font-semibold text-sm truncate">{deposito.nome || deposito.email}</p>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${STATUS_ESTILO[deposito.status]}`}
          >
            {STATUS_TEXTO[deposito.status]}
          </span>
        </div>
        {deposito.nome && <p className="text-gray-500 text-xs truncate">{deposito.email}</p>}
        <p className="text-gray-500 text-xs mt-0.5">{formatarData(deposito.criadoEm)}</p>
        {deposito.paymentId && (
          <p className="text-gray-600 text-[11px] mt-0.5 truncate">Payment ID: {deposito.paymentId}</p>
        )}
      </div>
      <p className="font-bold text-sm shrink-0 text-emerald-400">{formatarReais(deposito.valorCentavos)}</p>
    </div>
  );
}
