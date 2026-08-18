import { randomUUID } from "crypto";
import { mapaServicos } from "@/lib/gsmcheap-servicos";
import { fornecedores } from "@/lib/fornecedores";
import { supabase } from "@/lib/supabase";
import { enviarEmailAcesso, enviarEmailAlertaPedido } from "@/lib/enviar-email";
import { avaliarResultadoFornecedor, type EstadoPedido } from "@/lib/avaliar-resultado";

function montarLinkConsulta(codigo: string) {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/consultar?codigo=${codigo}`;
}

function pareceEmailValido(email: string | null): email is string {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Monta a resposta que a rota /api/entregar devolve pro front-end, a partir
// do estado já salvo/atualizado no Supabase. Centralizado aqui pra garantir
// que TODOS os caminhos (pedido novo, re-checagem, etc) respondem com o
// mesmo formato — é isso que o front-end usa pra decidir o que mostrar.
function montarResposta(params: {
  estado: EstadoPedido | "manual" | "reservando";
  dados?: any;
  servico: { ferramenta: string; duracao: string; preco: number };
  codigo: string;
  mensagem?: string;
}) {
  const { estado, dados, servico, codigo, mensagem } = params;

  if (estado === "reservando") {
    return { status: 200, body: { reservando: true, mensagem: "Pedido já está sendo processado", servico } };
  }
  if (estado === "concluido") {
    return { status: 200, body: { sucesso: true, dados, servico, codigo } };
  }
  if (estado === "processando") {
    return {
      status: 200,
      body: {
        processando: true,
        mensagem: mensagem ?? "Pagamento confirmado! Gerando seu acesso na GSM Cheap, só mais um instante...",
        servico,
        codigo,
      },
    };
  }
  // "erro" ou "manual": pedido não automatizado ou falhou de vez — cai pra liberação manual
  return {
    status: 200,
    body: {
      erro: "fornecedor_falhou",
      manual: true,
      mensagem: mensagem ?? "Pagamento aprovado. Nossa equipe está finalizando a liberação, você recebe por e-mail em instantes.",
      servico,
      codigo,
    },
  };
}

export async function processarEntrega(paymentId: string) {
  if (!paymentId) {
    return { status: 400, body: { erro: "paymentId ausente" } };
  }

  // 1. Verifica se já existe um pedido salvo pra esse pagamento (evita duplicar e reenviar e-mail)
  const { data: pedidoExistente } = await supabase
    .from("pedidos")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();

  if (pedidoExistente) {
    const servico = {
      ferramenta: pedidoExistente.ferramenta,
      duracao: pedidoExistente.duracao,
      preco: pedidoExistente.preco,
    };
    // Compatibilidade com pedidos salvos ANTES dessa correção (usavam a chave
    // "status" em vez de "estado", e alguns nunca tiveram nenhuma das duas —
    // eram só a resposta crua da GSM Cheap). Nesses casos, reavalia a partir
    // do conteúdo já salvo em vez de presumir "reservando" (o que travaria
    // pedidos antigos já concluídos).
    const estadoAtual: string =
      pedidoExistente.dados?.estado ??
      (pedidoExistente.dados?.status === "reservando" ? "reservando" : undefined) ??
      (pedidoExistente.dados && Object.keys(pedidoExistente.dados).length > 0
        ? avaliarResultadoFornecedor(pedidoExistente.dados)
        : "reservando");

    if (estadoAtual === "reservando") {
      // Outra chamada (webhook duplicado, ou a tela do cliente correndo em
      // paralelo com o webhook) já está processando esse pagamento agora
      // mesmo. Não faz nada — evita criar um segundo pedido no fornecedor.
      return montarResposta({ estado: "reservando", servico, codigo: pedidoExistente.codigo });
    }

    if (!pedidoExistente.reference_id) {
      // Serviço não automatizado (sem fornecedor mapeado) — já ficou assim
      // desde o início, não tem o que re-checar.
      return montarResposta({
        estado: "manual",
        servico,
        codigo: pedidoExistente.codigo,
        mensagem: pedidoExistente.dados?.mensagem,
      });
    }

    if (estadoAtual === "concluido") {
      // Já tinha finalizado antes — devolve o que já está salvo, sem chamar
      // o fornecedor de novo.
      return montarResposta({ estado: "concluido", dados: pedidoExistente.dados, servico, codigo: pedidoExistente.codigo });
    }

    // estado === "processando" (ou "erro" de uma consulta anterior): já temos
    // o reference_id, então é seguro só CONSULTAR de novo (nunca cria pedido
    // novo no fornecedor) pra ver se finalizou nesse meio-tempo. É isso que
    // permite ao cliente (ou ao próprio front, tentando de novo) "destravar"
    // um pedido que ficou processando na primeira tentativa.
    const chaveExistente = `${pedidoExistente.ferramenta}|${pedidoExistente.duracao}`;
    const mapeadoExistente = mapaServicos[chaveExistente];
    const adapterExistente = mapeadoExistente ? fornecedores[mapeadoExistente.fornecedor] : undefined;

    const dadosConsulta = adapterExistente
      ? await adapterExistente.consultarPedido(pedidoExistente.reference_id)
      : pedidoExistente.dados;

    const novoEstado = avaliarResultadoFornecedor(dadosConsulta);
    const dadosParaSalvar = { ...dadosConsulta, estado: novoEstado };

    await supabase.from("pedidos").update({ dados: dadosParaSalvar }).eq("payment_id", paymentId);

    // Só dispara e-mail de sucesso se ISSO É UMA TRANSIÇÃO (antes não estava
    // concluído, agora está) — evita mandar o e-mail de novo a cada re-checagem.
    if (novoEstado === "concluido" && estadoAtual !== "concluido" && pedidoExistente.email_cliente) {
      await enviarEmailAcesso({
        destinatario: pedidoExistente.email_cliente,
        servico: `${pedidoExistente.ferramenta} - Aluguel ${pedidoExistente.duracao}`,
        linkConsulta: montarLinkConsulta(pedidoExistente.codigo),
        manual: false,
      });
    }

    if (novoEstado === "erro" && estadoAtual !== "erro") {
      await enviarEmailAlertaPedido({
        motivo: "Consulta à GSM Cheap retornou erro após pedido já criado",
        ferramenta: pedidoExistente.ferramenta,
        duracao: pedidoExistente.duracao,
        codigo: pedidoExistente.codigo,
        paymentId,
        detalhes: JSON.stringify(dadosConsulta)?.slice(0, 500),
      });
    }

    return montarResposta({ estado: novoEstado, dados: dadosParaSalvar, servico, codigo: pedidoExistente.codigo });
  }

  // 2. Confirma no Mercado Pago que o pagamento foi realmente aprovado (e pega o e-mail de quem pagou)
  const pagamentoResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  });
  const pagamento = await pagamentoResp.json();

  if (pagamento.status !== "approved") {
    return { status: 200, body: { erro: "Pagamento ainda não confirmado" } };
  }

  const emailBruto: string | null = pagamento?.payer?.email ?? null;
  const emailCliente: string | null = pareceEmailValido(emailBruto) ? emailBruto : null;
  if (emailBruto && !emailCliente) {
    console.warn("[entrega] e-mail retornado pelo Mercado Pago não parece válido, ignorando:", emailBruto);
  }
  const externalReference = pagamento.external_reference;

  if (!externalReference) {
    console.error("[entrega] pagamento sem external_reference:", paymentId);
    return { status: 400, body: { erro: "Pedido não identificado" } };
  }

  // 3. Busca o que foi REALMENTE contratado, gravado no momento do checkout
  const { data: checkout } = await supabase
    .from("checkouts")
    .select("*")
    .eq("external_reference", externalReference)
    .maybeSingle();

  if (!checkout) {
    console.error("[entrega] checkout não encontrado para external_reference:", externalReference);
    return { status: 400, body: { erro: "Pedido não identificado" } };
  }

  if (Number(pagamento.transaction_amount) < Number(checkout.preco)) {
    console.error("[entrega] valor pago menor que o esperado:", pagamento.transaction_amount, checkout.preco);
    return { status: 400, body: { erro: "Valor pago não confere" } };
  }

  const { ferramenta, duracao, preco } = checkout;
  const servico = { ferramenta, duracao, preco };
  const nomeServico = `${ferramenta} - Aluguel ${duracao}`;
  const codigo = randomUUID();

  // 3.5. TRAVA DE SEGURANÇA (idempotência real):
  // Antes de chamar QUALQUER fornecedor, tenta "reservar" esse payment_id no banco.
  // Se outra chamada (webhook duplicado do Mercado Pago, ou a tela do cliente
  // rodando em paralelo com o webhook) chegou nos mesmos milissegundos e já
  // reservou, essa segunda tentativa falha aqui e NUNCA chega a chamar a GSM Cheap.
  // Isso exige uma constraint UNIQUE na coluna payment_id da tabela "pedidos" no Supabase.
  const { error: erroReserva } = await supabase.from("pedidos").insert({
    payment_id: paymentId,
    reference_id: null,
    ferramenta,
    duracao,
    preco,
    codigo,
    email_cliente: emailCliente,
    dados: { estado: "reservando" },
  });

  if (erroReserva) {
    if (erroReserva.code === "23505") {
      // Outra chamada simultânea já reservou esse payment_id primeiro — para aqui, sem duplicar.
      console.warn("[entrega] payment_id já reservado por outra chamada simultânea:", paymentId);
      return montarResposta({ estado: "reservando", servico, codigo });
    }
    console.error("[entrega] erro ao reservar payment_id:", erroReserva);
    return { status: 500, body: { erro: "Falha ao reservar pedido" } };
  }

  // 4. Verifica se temos o serviço mapeado, e com qual fornecedor
  const chave = `${ferramenta}|${duracao}`;
  const mapeado = mapaServicos[chave];
  const adapter = mapeado ? fornecedores[mapeado.fornecedor] : undefined;

  if (!mapeado || !adapter) {
    await supabase
      .from("pedidos")
      .update({ dados: { estado: "manual", mensagem: "Serviço não automatizado" } })
      .eq("payment_id", paymentId);
    if (emailCliente) {
      await enviarEmailAcesso({
        destinatario: emailCliente,
        servico: nomeServico,
        linkConsulta: montarLinkConsulta(codigo),
        manual: true,
      });
    }
    return montarResposta({ estado: "manual", servico, codigo, mensagem: "Serviço não automatizado" });
  }

  // 5. Faz o pedido no fornecedor certo (GSM Cheap, ou qualquer outro cadastrado em lib/fornecedores)
  // A essa altura, temos GARANTIA de que somos a única chamada processando esse payment_id.
  let criacao: { referenceId?: string; mensagemErro?: string; respostaCompleta?: any };
  try {
    criacao = await adapter.criarPedido(String(mapeado.serviceId));
  } catch (erroInesperado: any) {
    console.error("[entrega] exceção inesperada ao chamar o fornecedor:", erroInesperado?.message, erroInesperado?.stack);
    criacao = {
      mensagemErro: `Erro inesperado: ${erroInesperado?.message ?? "desconhecido"}`,
      respostaCompleta: null,
    };
  }

  if (!criacao.referenceId) {
    const mensagemErro = criacao.mensagemErro ?? `Falha ao gerar acesso na ${mapeado.fornecedor}`;
    console.error(
      `[entrega] ${mapeado.fornecedor} não retornou referenceId. Resposta completa:`,
      JSON.stringify(criacao.respostaCompleta)
    );

    await supabase
      .from("pedidos")
      .update({
        dados: { estado: "erro", mensagem: mensagemErro, respostaCompleta: criacao.respostaCompleta },
      })
      .eq("payment_id", paymentId);

    if (emailCliente) {
      await enviarEmailAcesso({
        destinatario: emailCliente,
        servico: nomeServico,
        linkConsulta: montarLinkConsulta(codigo),
        manual: true,
      });
    }
    await enviarEmailAlertaPedido({
      motivo: "Falha ao CRIAR pedido na GSM Cheap (pagamento já aprovado)",
      ferramenta,
      duracao,
      codigo,
      paymentId,
      detalhes: mensagemErro,
    });

    return montarResposta({ estado: "erro", servico, codigo, mensagem: mensagemErro });
  }

  // 6. IMPORTANTE: a partir daqui já temos um reference_id válido — o pedido
  // JÁ EXISTE na GSM Cheap. Qualquer coisa que dê errado a partir daqui NUNCA
  // pode fazer a gente perder esse reference_id (senão o pedido fica órfão,
  // pago e criado no fornecedor, mas sem ninguém saber consultar de novo).
  // Por isso salvamos o reference_id primeiro, e só DEPOIS tentamos consultar
  // o resultado — envolvido em try/catch próprio.
  await supabase
    .from("pedidos")
    .update({ reference_id: criacao.referenceId, dados: { estado: "processando" } })
    .eq("payment_id", paymentId);

  let dadosFinais: any = null;
  let estadoFinal: EstadoPedido = "processando";
  try {
    dadosFinais = await adapter.consultarPedido(criacao.referenceId);
    estadoFinal = avaliarResultadoFornecedor(dadosFinais);
  } catch (erroConsulta: any) {
    // Mesmo se a consulta explodir, o reference_id já está salvo no passo
    // acima — o pedido pode ser recuperado depois (re-tentando /api/entregar
    // com o mesmo paymentId, que vai só CONSULTAR de novo, nunca recriar).
    console.error("[entrega] exceção ao consultar resultado:", erroConsulta?.message);
    dadosFinais = { erro: erroConsulta?.message ?? "erro ao consultar resultado" };
    estadoFinal = "processando";
  }

  const dadosParaSalvar = { ...dadosFinais, estado: estadoFinal };

  const { error: erroUpdateFinal } = await supabase
    .from("pedidos")
    .update({ dados: dadosParaSalvar })
    .eq("payment_id", paymentId);

  if (erroUpdateFinal) {
    console.error("[entrega] erro ao salvar resultado final do pedido:", erroUpdateFinal);
  }

  if (estadoFinal === "concluido" && emailCliente) {
    await enviarEmailAcesso({
      destinatario: emailCliente,
      servico: nomeServico,
      linkConsulta: montarLinkConsulta(codigo),
      manual: false,
    });
  }

  return montarResposta({ estado: estadoFinal, dados: dadosParaSalvar, servico, codigo });
}
