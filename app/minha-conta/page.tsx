import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { supabase as supabaseAdmin } from "@/lib/supabase";
import LogoutButton from "./logout-button";
import SaldoCarteira from "./SaldoCarteira";
import HistoricoPedidos from "./HistoricoPedidos";

export default async function MinhaContaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const nome = (user.user_metadata?.nome as string) || user.email;

  // Saldo: consultado com a sessão do próprio cliente — o RLS já garante
  // que ele só vê a própria carteira.
  const { data: saldoRow } = await supabase
    .from("carteira_saldo")
    .select("saldo_centavos")
    .eq("usuario_id", user.id)
    .maybeSingle();

  const saldoCentavos = saldoRow?.saldo_centavos ?? 0;

  // Histórico: aluguéis (tabela pedidos) + licenças pagas (checkouts_ativacao),
  // ambos filtrados pelo e-mail do cliente. Consultados com o cliente admin
  // porque essas tabelas não têm RLS ligado a auth.uid() (são vinculadas por
  // e-mail, não por usuario_id).
  const [{ data: alugueis }, { data: licencas }] = await Promise.all([
    supabaseAdmin
      .from("pedidos")
      .select("ferramenta, duracao, preco, dados, created_at")
      .eq("email_cliente", user.email)
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseAdmin
      .from("checkouts_ativacao")
      .select("ferramenta, duracao, preco, payment_id, created_at")
      .eq("email", user.email)
      .not("payment_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const pedidosAluguel = (alugueis ?? []).map((p) => ({
    tipo: "aluguel" as const,
    ferramenta: p.ferramenta,
    duracao: p.duracao,
    preco: p.preco,
    status: p.dados?.estado === "concluido" || p.dados?.estado === "manual" ? "concluido" : "processando",
    data: p.created_at,
  }));

  const pedidosLicenca = (licencas ?? []).map((p) => ({
    tipo: "licenca" as const,
    ferramenta: p.ferramenta,
    duracao: p.duracao,
    preco: p.preco,
    status: "concluido",
    data: p.created_at,
  }));

  const todosPedidos = [...pedidosAluguel, ...pedidosLicenca].sort((a, b) => {
    if (!a.data) return 1;
    if (!b.data) return -1;
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });

  return (
    <main className="min-h-screen bg-black px-4 pt-24 pb-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-black text-white mb-1">Olá, {nome}!</h1>
        <p className="text-gray-400 mb-8">{user.email}</p>

        <SaldoCarteira saldoInicialCentavos={saldoCentavos} />

        <h2 className="text-white font-bold mb-3">Meus pedidos</h2>
        <HistoricoPedidos pedidos={todosPedidos} />

        <div className="mt-8">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
