import { supabase as supabaseAdmin } from "@/lib/supabase";

export type StatusPedido = "concluido" | "processando" | "manual" | "erro";

export type PedidoAdmin = {
  tipo: "aluguel" | "licenca" | "metodo";
  id: string; // payment_id — chave usada nas ações (marcar entregue, reenviar e-mail, estornar)
  ferramenta: string;
  duracao: string;
  preco: number;
  status: StatusPedido;
  emailCliente: string | null;
  codigo: string | null;
  criadoEm: string | null;
  pagoComSaldo: boolean; // payment_id começando com "saldo_" → não existe no Mercado Pago, não dá pra estornar por lá
  estornado: boolean;
  dados: any; // json bruto (aluguel) ou null
  // Só em licenças:
  entregueManual?: boolean;
  nomeCliente?: string;
};

export type FiltrosPedidos = {
  tipo?: "aluguel" | "licenca" | "metodo" | "todos";
  status?: StatusPedido | "todos";
  busca?: string; // e-mail, código ou ferramenta
  pagina?: number;
  porPagina?: number;
};

function estadoAluguel(dados: any): StatusPedido {
  const estado = dados?.estado;
  if (estado === "concluido" || estado === "manual") return estado === "manual" ? "manual" : "concluido";
  if (estado === "processando" || estado === "reservando") return "processando";
  if (estado === "erro") return "erro";
  return "processando";
}

// Busca os pedidos dos 3 tipos e devolve já unificados, mais recentes primeiro.
// Filtros são aplicados depois de buscar (o volume de pedidos de uma loja
// desse porte cabe tranquilo numa única página de resultados client-side).
export async function buscarPedidosAdmin(filtros: FiltrosPedidos = {}): Promise<{
  pedidos: PedidoAdmin[];
  total: number;
}> {
  const { tipo = "todos", status = "todos", busca = "", pagina = 1, porPagina = 25 } = filtros;

  const buscarAlugueis = tipo === "todos" || tipo === "aluguel";
  const buscarLicencas = tipo === "todos" || tipo === "licenca";
  const buscarMetodos = tipo === "todos" || tipo === "metodo";

  const [alugueisRes, licencasRes, metodosRes] = await Promise.all([
    buscarAlugueis
      ? supabaseAdmin
          .from("pedidos")
          .select("payment_id, codigo, ferramenta, duracao, preco, dados, email_cliente, created_at, estornado")
          .order("created_at", { ascending: false })
          .limit(300)
      : Promise.resolve({ data: [] as any[] }),
    buscarLicencas
      ? supabaseAdmin
          .from("checkouts_ativacao")
          .select(
            "payment_id, ferramenta, duracao, preco, nome, email, username, senha, entregue, created_at, estornado"
          )
          .not("payment_id", "is", null)
          .order("created_at", { ascending: false })
          .limit(300)
      : Promise.resolve({ data: [] as any[] }),
    buscarMetodos
      ? supabaseAdmin
          .from("pedidos_metodos")
          .select("payment_id, metodo_id, nome, preco, email_cliente, created_at, estornado")
          .order("created_at", { ascending: false })
          .limit(300)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const pedidosAluguel: PedidoAdmin[] = (alugueisRes.data ?? []).map((p: any) => ({
    tipo: "aluguel",
    id: p.payment_id,
    ferramenta: p.ferramenta,
    duracao: p.duracao,
    preco: p.preco,
    status: estadoAluguel(p.dados),
    emailCliente: p.email_cliente,
    codigo: p.codigo,
    criadoEm: p.created_at,
    pagoComSaldo: String(p.payment_id).startsWith("saldo_"),
    estornado: !!p.estornado,
    dados: p.dados,
  }));

  const pedidosLicenca: PedidoAdmin[] = (licencasRes.data ?? []).map((p: any) => ({
    tipo: "licenca",
    id: p.payment_id,
    ferramenta: p.ferramenta,
    duracao: p.duracao,
    preco: p.preco,
    // "entregue" pode não existir ainda no banco (coluna nova, ver migração) —
    // nesse caso trata como não entregue ainda.
    status: p.entregue ? "concluido" : "manual",
    emailCliente: p.email,
    codigo: null,
    criadoEm: p.created_at,
    pagoComSaldo: String(p.payment_id).startsWith("saldo_"),
    estornado: !!p.estornado,
    dados: { username: p.username, senha: p.senha },
    entregueManual: !!p.entregue,
    nomeCliente: p.nome,
  }));

  const pedidosMetodo: PedidoAdmin[] = (metodosRes.data ?? []).map((p: any) => ({
    tipo: "metodo",
    id: p.payment_id,
    ferramenta: p.nome,
    duracao: "Download imediato",
    preco: p.preco,
    status: "concluido",
    emailCliente: p.email_cliente,
    codigo: null,
    criadoEm: p.created_at,
    pagoComSaldo: String(p.payment_id).startsWith("saldo_"),
    estornado: !!p.estornado,
    dados: null,
  }));

  let todos = [...pedidosAluguel, ...pedidosLicenca, ...pedidosMetodo].sort((a, b) => {
    if (!a.criadoEm) return 1;
    if (!b.criadoEm) return -1;
    return new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime();
  });

  if (status !== "todos") {
    todos = todos.filter((p) => p.status === status);
  }

  if (busca.trim()) {
    const termo = busca.trim().toLowerCase();
    todos = todos.filter(
      (p) =>
        p.emailCliente?.toLowerCase().includes(termo) ||
        p.codigo?.toLowerCase().includes(termo) ||
        p.ferramenta?.toLowerCase().includes(termo) ||
        p.id?.toLowerCase().includes(termo) ||
        p.nomeCliente?.toLowerCase().includes(termo)
    );
  }

  const total = todos.length;
  const inicio = (pagina - 1) * porPagina;
  const pagina_atual = todos.slice(inicio, inicio + porPagina);

  return { pedidos: pagina_atual, total };
}

// KPIs do dashboard — reaproveita as mesmas 3 tabelas, sem paginação, olhando
// só pra data de hoje / pendências.
export async function buscarResumoDashboard() {
  const inicioHoje = new Date();
  inicioHoje.setHours(0, 0, 0, 0);

  const [{ pedidos: todosRecentes }, { data: saldos }, { data: depositosHoje }] = await Promise.all([
    buscarPedidosAdmin({ tipo: "todos", porPagina: 300 }),
    supabaseAdmin.from("carteira_saldo").select("saldo_centavos"),
    supabaseAdmin
      .from("carteira_transacoes")
      .select("valor_centavos")
      .eq("tipo", "deposito")
      .gte("created_at", inicioHoje.toISOString()),
  ]);

  const pedidosHoje = todosRecentes.filter((p) => p.criadoEm && new Date(p.criadoEm) >= inicioHoje);
  const receitaHoje = pedidosHoje.reduce((soma, p) => soma + Number(p.preco || 0), 0);
  const pendentes = todosRecentes.filter((p) => p.status === "manual" || p.status === "erro" || p.status === "processando");
  const saldoTotalCentavos = (saldos ?? []).reduce((soma, s: any) => soma + Number(s.saldo_centavos || 0), 0);
  const depositosHojeCentavos = (depositosHoje ?? []).reduce((soma, d: any) => soma + Number(d.valor_centavos || 0), 0);

  return {
    pedidosHojeQtd: pedidosHoje.length,
    receitaHoje,
    pendentesQtd: pendentes.length,
    pendentes: pendentes.slice(0, 8),
    saldoTotalCentavos,
    depositosHojeCentavos,
    recentes: todosRecentes.slice(0, 8),
  };
}
