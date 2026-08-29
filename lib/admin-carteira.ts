import { supabase as supabaseAdmin } from "@/lib/supabase";

export type ClienteCarteira = {
  usuarioId: string;
  email: string;
  nome: string;
  saldoCentavos: number;
};

// carteira_saldo só guarda usuario_id + saldo — pra mostrar e-mail/nome no
// painel, cruza com auth.users via API admin do Supabase (só o service role
// consegue chamar isso). listUsers pagina de 1000 em 1000; pra uma loja
// desse porte isso cobre a base inteira numa chamada só.
export async function mapaUsuarios(): Promise<Map<string, { email: string; nome: string }>> {
  const mapa = new Map<string, { email: string; nome: string }>();
  let pagina = 1;
  // Limite de segurança pra nunca entrar em loop infinito caso a API mude.
  for (let tentativas = 0; tentativas < 20; tentativas++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: pagina, perPage: 1000 });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      mapa.set(u.id, { email: u.email ?? "", nome: (u.user_metadata?.nome as string) || "" });
    }
    if (data.users.length < 1000) break;
    pagina++;
  }
  return mapa;
}

// Localiza o usuario_id a partir do e-mail do cliente — necessário pro
// estorno de saldo, já que pedidos/checkouts_ativacao/pedidos_metodos só
// guardam o e-mail, não o usuario_id. Reaproveita a mesma paginação da
// listUsers usada em mapaUsuarios().
export async function buscarUsuarioIdPorEmail(email: string): Promise<string | null> {
  const alvo = email.trim().toLowerCase();
  let pagina = 1;
  for (let tentativas = 0; tentativas < 20; tentativas++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: pagina, perPage: 1000 });
    if (error || !data?.users?.length) break;
    const encontrado = data.users.find((u) => u.email?.toLowerCase() === alvo);
    if (encontrado) return encontrado.id;
    if (data.users.length < 1000) break;
    pagina++;
  }
  return null;
}

export async function buscarClientesCarteira(busca = ""): Promise<ClienteCarteira[]> {
  const [{ data: saldos }, usuarios] = await Promise.all([
    supabaseAdmin.from("carteira_saldo").select("usuario_id, saldo_centavos"),
    mapaUsuarios(),
  ]);

  // Mapa de saldo por usuario_id — quem nunca depositou simplesmente não
  // tem linha aqui, e por isso entra com 0 abaixo.
  const saldoPorUsuario = new Map<string, number>();
  for (const s of saldos ?? []) saldoPorUsuario.set((s as any).usuario_id, (s as any).saldo_centavos);

  // Parte de TODOS os usuários cadastrados (não só de quem já tem linha em
  // carteira_saldo) — assim quem acabou de se cadastrar e nunca depositou
  // também aparece aqui, com saldo R$ 0,00, pronto pra receber um crédito manual.
  let clientes: ClienteCarteira[] = Array.from(usuarios.entries()).map(([usuarioId, u]) => ({
    usuarioId,
    email: u.email || "(sem e-mail)",
    nome: u.nome ?? "",
    saldoCentavos: saldoPorUsuario.get(usuarioId) ?? 0,
  }));

  clientes.sort((a, b) => b.saldoCentavos - a.saldoCentavos);

  if (busca.trim()) {
    const termo = busca.trim().toLowerCase();
    clientes = clientes.filter(
      (c) => c.email.toLowerCase().includes(termo) || c.nome.toLowerCase().includes(termo)
    );
  }

  return clientes;
}

export type StatusDeposito = "pago" | "pendente";

export type DepositoAdmin = {
  id: string;
  usuarioId: string;
  email: string;
  nome: string;
  valorCentavos: number;
  status: StatusDeposito;
  externalReference: string;
  paymentId: string | null;
  criadoEm: string | null;
};

export type FiltrosDepositos = {
  status?: StatusDeposito | "todos";
  busca?: string; // e-mail, nome, external_reference ou payment_id
};

// Lista todos os depósitos (tentativas de adicionar saldo) já iniciados no site,
// pagos ou não. Um depósito nasce em checkouts_carteira quando o cliente clica em
// "adicionar saldo" (/api/carteira/depositar) e só ganha payment_id quando o
// Mercado Pago confirma o pagamento e o webhook credita o saldo
// (lib/processar-entrega-carteira.ts) — por isso payment_id nulo = ainda pendente.
export async function buscarDepositosAdmin(filtros: FiltrosDepositos = {}): Promise<DepositoAdmin[]> {
  const { status = "todos", busca = "" } = filtros;

  const [{ data: checkouts, error }, usuarios] = await Promise.all([
    supabaseAdmin
      .from("checkouts_carteira")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500),
    mapaUsuarios(),
  ]);

  if (error) {
    console.error("[admin-carteira] erro ao buscar depositos:", error);
    return [];
  }

  let depositos: DepositoAdmin[] = (checkouts ?? []).map((c: any) => {
    const u = usuarios.get(c.usuario_id);
    return {
      id: String(c.id ?? c.external_reference),
      usuarioId: c.usuario_id,
      email: u?.email || "(sem e-mail)",
      nome: u?.nome ?? "",
      valorCentavos: c.valor_centavos,
      status: c.payment_id ? "pago" : "pendente",
      externalReference: c.external_reference,
      paymentId: c.payment_id ?? null,
      criadoEm: c.created_at ?? null,
    };
  });

  if (status !== "todos") {
    depositos = depositos.filter((d) => d.status === status);
  }

  if (busca.trim()) {
    const termo = busca.trim().toLowerCase();
    depositos = depositos.filter(
      (d) =>
        d.email.toLowerCase().includes(termo) ||
        d.nome.toLowerCase().includes(termo) ||
        d.externalReference?.toLowerCase().includes(termo) ||
        d.paymentId?.toLowerCase().includes(termo)
    );
  }

  return depositos;
}

export async function buscarExtratoCliente(usuarioId: string) {
  const { data } = await supabaseAdmin
    .from("carteira_transacoes")
    .select("tipo, valor_centavos, descricao, created_at")
    .eq("usuario_id", usuarioId)
    .order("created_at", { ascending: false })
    .limit(100);

  return data ?? [];
}
