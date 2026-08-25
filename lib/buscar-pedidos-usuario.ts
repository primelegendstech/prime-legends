import { supabase as supabaseAdmin } from "@/lib/supabase";

export type PedidoCompleto = {
  tipo: "aluguel" | "licenca";
  ferramenta: string;
  duracao: string;
  preco: number;
  status: string;
  data: string | null;
  codigo: string | null;
  // Dados brutos da entrega automática (só existe pra aluguéis via GSM Cheap).
  // Licenças de ativação são liberadas manualmente por WhatsApp/e-mail, então
  // não têm login/senha entregues automaticamente por aqui.
  dados: unknown;
};

// Consultado com o cliente admin (service role) porque essas tabelas não têm
// RLS ligado a auth.uid() — são vinculadas pelo e-mail do cliente, não pelo
// usuario_id da conta.
export async function buscarPedidosUsuario(email: string): Promise<PedidoCompleto[]> {
  const [{ data: alugueis }, { data: licencas }] = await Promise.all([
    supabaseAdmin
      .from("pedidos")
      .select("codigo, ferramenta, duracao, preco, dados, created_at")
      .eq("email_cliente", email)
      .order("created_at", { ascending: false })
      .limit(50),
    supabaseAdmin
      .from("checkouts_ativacao")
      .select("ferramenta, duracao, preco, payment_id, created_at")
      .eq("email", email)
      .not("payment_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const pedidosAluguel: PedidoCompleto[] = (alugueis ?? []).map((p) => ({
    tipo: "aluguel",
    ferramenta: p.ferramenta,
    duracao: p.duracao,
    preco: p.preco,
    status:
      p.dados?.estado === "concluido" || p.dados?.estado === "manual" ? "concluido" : "processando",
    data: p.created_at,
    codigo: p.codigo ?? null,
    dados: p.dados ?? null,
  }));

  const pedidosLicenca: PedidoCompleto[] = (licencas ?? []).map((p) => ({
    tipo: "licenca",
    ferramenta: p.ferramenta,
    duracao: p.duracao,
    preco: p.preco,
    status: "concluido",
    data: p.created_at,
    codigo: p.payment_id ? String(p.payment_id) : null,
    dados: null,
  }));

  return [...pedidosAluguel, ...pedidosLicenca].sort((a, b) => {
    if (!a.data) return 1;
    if (!b.data) return -1;
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });
}
