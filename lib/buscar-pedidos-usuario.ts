import { supabase as supabaseAdmin } from "@/lib/supabase";
import { metodos } from "@/data/metodos";
import { gerarLinkDownloadB2 } from "@/lib/b2";

export type PedidoCompleto = {
  tipo: "aluguel" | "licenca" | "metodo";
  ferramenta: string;
  duracao: string;
  preco: number;
  status: string;
  data: string | null;
  codigo: string | null;
  // Dados brutos da entrega automática (só existe pra aluguéis via GSM Cheap).
  // Licenças de ativação são liberadas manualmente por WhatsApp/e-mail, então
  // não têm login/senha entregues automaticamente por aqui. Métodos usam um
  // formato próprio (ver DadosMetodo abaixo) em vez de login/senha.
  dados: unknown;
};

// Formato específico do campo `dados` quando tipo === "metodo". O link de
// download do B2 expira em 72h (ver lib/b2.ts), então NUNCA reaproveitamos
// o link salvo no banco pra exibição posterior — ele é sempre regerado na
// hora que o cliente abre a Ordem de Serviço, aqui em buscarPedidosUsuario.
export type DadosMetodo = {
  descricao: string | null;
  video: string | null;
  linkDownload: string | null;
  // true quando não foi possível regerar o link (arquivo removido do bucket,
  // método saiu do catálogo, falha no B2, etc) — a tela mostra uma mensagem
  // pedindo pra chamar no WhatsApp em vez de um botão de download quebrado.
  linkIndisponivel: boolean;
};

// Consultado com o cliente admin (service role) porque essas tabelas não têm
// RLS ligado a auth.uid() — são vinculadas pelo e-mail do cliente, não pelo
// usuario_id da conta.
export async function buscarPedidosUsuario(email: string): Promise<PedidoCompleto[]> {
  const [{ data: alugueis }, { data: licencas }, { data: metodosComprados }] = await Promise.all([
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
    supabaseAdmin
      .from("pedidos_metodos")
      .select("payment_id, metodo_id, nome, preco, created_at")
      .eq("email_cliente", email)
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

  // Métodos (arquivos/procedimentos entregues via link do B2). A linha só
  // existe na tabela DEPOIS de uma entrega bem-sucedida (Pix ou saldo), então
  // status é sempre "concluído" — não existe estado "processando" pra esse tipo.
  const pedidosMetodo: PedidoCompleto[] = await Promise.all(
    (metodosComprados ?? []).map(async (p) => {
      const catalogo = metodos.find((m) => m.id === p.metodo_id);

      let linkDownload: string | null = null;
      let linkIndisponivel = false;

      if (catalogo?.arquivoPath) {
        try {
          linkDownload = await gerarLinkDownloadB2(catalogo.arquivoPath);
        } catch (erroAssinatura) {
          console.error("[buscar-pedidos-usuario] erro ao regerar link do B2:", erroAssinatura);
          linkIndisponivel = true;
        }
      } else {
        // Método saiu do catálogo ou nunca teve arquivo — sem link pra regerar.
        linkIndisponivel = true;
      }

      const dados: DadosMetodo = {
        descricao: catalogo?.descricao ?? null,
        video: catalogo?.video || null,
        linkDownload,
        linkIndisponivel,
      };

      return {
        tipo: "metodo",
        ferramenta: p.nome,
        duracao: "Download imediato",
        preco: p.preco,
        status: "concluido",
        data: p.created_at,
        codigo: p.payment_id ? String(p.payment_id) : null,
        dados,
      } satisfies PedidoCompleto;
    })
  );

  return [...pedidosAluguel, ...pedidosLicenca, ...pedidosMetodo].sort((a, b) => {
    if (!a.data) return 1;
    if (!b.data) return -1;
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });
}
