import Link from "next/link";
import { buscarResumoDashboard } from "@/lib/admin-pedidos";

function formatarReais(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarReaisCentavos(centavos: number) {
  return formatarReais(centavos / 100);
}

function formatarData(data: string | null) {
  if (!data) return "";
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

const ROTULO_TIPO: Record<string, string> = { aluguel: "Aluguel", licenca: "Licença", metodo: "Método" };
const ROTULO_STATUS: Record<string, { texto: string; cor: string }> = {
  concluido: { texto: "Concluído", cor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  processando: { texto: "Processando", cor: "text-blue-400 border-blue-500/30 bg-blue-500/10" },
  manual: { texto: "Manual", cor: "text-amber-400 border-amber-500/30 bg-amber-500/10" },
  erro: { texto: "Erro", cor: "text-red-400 border-red-500/30 bg-red-500/10" },
};

export default async function AdminDashboardPage() {
  const resumo = await buscarResumoDashboard();

  const cards = [
    { label: "Pedidos hoje", valor: resumo.pedidosHojeQtd.toString(), emoji: "🧾" },
    { label: "Receita hoje", valor: formatarReais(resumo.receitaHoje), emoji: "💵" },
    { label: "Pendentes de atenção", valor: resumo.pendentesQtd.toString(), emoji: "⚠️" },
    { label: "Saldo total em carteiras", valor: formatarReaisCentavos(resumo.saldoTotalCentavos), emoji: "💰" },
    { label: "Depósitos hoje", valor: formatarReaisCentavos(resumo.depositosHojeCentavos), emoji: "➕" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4">
            <p className="text-xs text-gray-500 mb-1">
              {c.emoji} {c.label}
            </p>
            <p className="text-xl font-black text-white">{c.valor}</p>
          </div>
        ))}
      </div>

      {resumo.pendentesQtd > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-bold">⚠️ Precisam de atenção</h2>
            <Link href="/admin/pedidos?status=manual" className="text-yellow-400 text-sm font-semibold hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-2">
            {resumo.pendentes.map((p) => {
              const st = ROTULO_STATUS[p.status];
              return (
                <div
                  key={p.tipo + p.id}
                  className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4 flex items-center justify-between gap-3 flex-wrap"
                >
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">
                      {ROTULO_TIPO[p.tipo]} — {p.ferramenta} {p.duracao}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {p.emailCliente ?? "sem e-mail"} · {formatarData(p.criadoEm)}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${st.cor}`}>{st.texto}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-bold">Pedidos recentes</h2>
          <Link href="/admin/pedidos" className="text-yellow-400 text-sm font-semibold hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="space-y-2">
          {resumo.recentes.map((p) => {
            const st = ROTULO_STATUS[p.status];
            return (
              <div
                key={p.tipo + p.id}
                className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4 flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {ROTULO_TIPO[p.tipo]} — {p.ferramenta} {p.duracao}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {p.emailCliente ?? "sem e-mail"} · {formatarReais(p.preco)} · {formatarData(p.criadoEm)}
                  </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${st.cor}`}>{st.texto}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
