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
async function mapaUsuarios(): Promise<Map<string, { email: string; nome: string }>> {
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
    supabaseAdmin.from("carteira_saldo").select("usuario_id, saldo_centavos").order("saldo_centavos", { ascending: false }),
    mapaUsuarios(),
  ]);

  let clientes: ClienteCarteira[] = (saldos ?? []).map((s: any) => {
    const u = usuarios.get(s.usuario_id);
    return {
      usuarioId: s.usuario_id,
      email: u?.email ?? "(usuário não encontrado)",
      nome: u?.nome ?? "",
      saldoCentavos: s.saldo_centavos,
    };
  });

  if (busca.trim()) {
    const termo = busca.trim().toLowerCase();
    clientes = clientes.filter(
      (c) => c.email.toLowerCase().includes(termo) || c.nome.toLowerCase().includes(termo)
    );
  }

  return clientes;
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
