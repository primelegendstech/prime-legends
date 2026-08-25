import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { supabase as supabaseAdmin } from "@/lib/supabase";
import LogoutButton from "./logout-button";
import PainelConta from "./PainelConta";
import GoldNetworkBackground from "@/components/GoldNetworkBackground";

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

  // Extrato: consultado com a sessão do próprio cliente — RLS garante que ele
  // só vê as próprias movimentações.
  const { data: transacoesRow } = await supabase
    .from("carteira_transacoes")
    .select("tipo, valor_centavos, descricao, created_at")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  const movimentacoes = transacoesRow ?? [];

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
    <main className="relative min-h-screen bg-black px-4 pt-24 pb-10 overflow-hidden">
      <GoldNetworkBackground />
      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Olá, {nome}!</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        <Suspense fallback={null}>
          <PainelConta saldoCentavos={saldoCentavos} pedidos={todosPedidos} movimentacoes={movimentacoes} />
        </Suspense>
      </div>
    </main>
  );
}
