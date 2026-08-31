import Link from "next/link";

function formatarReais(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SaldoCarteira({ saldoInicialCentavos }: { saldoInicialCentavos: number }) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4 mb-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">Saldo</p>
        <p className="text-2xl font-black text-yellow-400">{formatarReais(saldoInicialCentavos)}</p>
      </div>
      <Link
        href="/minha-conta/adicionar-saldo"
        className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold px-4 py-2 hover:brightness-110 transition"
      >
        + Adicionar
      </Link>
    </div>
  );
}
