import { randomUUID } from "crypto";
import { mapaServicos } from "@/lib/gsmcheap-servicos";
import { fornecedores } from "@/lib/fornecedores";
import { supabase } from "@/lib/supabase";
import { planosValidos } from "@/lib/planos";
import { planosAtivacaoValidos } from "@/lib/planosAtivacao";
import { metodos } from "@/data/metodos";
import { enviarEmailAcesso, enviarEmailAlertaPedido, enviarEmailNotificacaoAtivacao, enviarEmailAcessoMetodo } from "@/lib/enviar-email";
import { avaliarResultadoFornecedor, type EstadoPedido } from "@/lib/avaliar-resultado";
import { gerarLinkDownloadB2 } from "@/lib/b2";
import { debitarCarteira, estornarCarteira } from "@/lib/carteira-debito";

function pareceEmailValido(email: string | null | undefined): email is string {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function montarLinkConsulta(codigo: string) {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/consultar?codigo=${codigo}`;
}

type Resposta = { status: number; body: any };

// ─────────────────────────────────────────────────────────────────────────
// ALUGUEL — mesmo pipeline (GSM Cheap) do fluxo por Pix em lib/processar-entrega.ts,
// só que disparado direto pelo débito da carteira em vez de esperar confirmação
// do Mercado Pago. Se o fornecedor falhar DEPOIS de já ter debitado, o valor
// é devolvido automaticamente pro saldo do cliente.
// ─────────────────────────────────────────────────────────────────────────
export async function pagarAluguelComSaldo(params: {
  usuarioId: string;
  ferramenta: string;
  duracao: string;
  emailCliente: string | null;
}): Promise<Resposta> {
  const { usuarioId, ferramenta, duracao, emailCliente } = params;

  if (!ferramenta || !duracao) {
    return { status: 400, body: { erro: "Dados do plano ausentes" } };
  }

  const chave = `${ferramenta}|${duracao}`;
  const preco = planosValidos[chave];
  if (!preco) {
    return { status: 400, body: { erro: "Plano inválido" } };
  }

  const valorCentavos = Math.round(preco * 100);
  const debito = await debitarCarteira(usuarioId, valorCentavos, `Aluguel: ${ferramenta} - ${duracao}`);
  if (!debito.sucesso) {
    return { status: 400, body: { erro: "saldo_insuficiente" } };
  }

  const paymentId = `saldo_${randomUUID()}`;
  const codigo = randomUUID();
  const emailFinal = pareceEmailValido(emailCliente) ? emailCliente : null;
  const nomeServico = `${ferramenta} - Aluguel ${duracao}`;
  const servico = { ferramenta, duracao, preco };

  // Reserva o pedido — cada paymentId aqui é um UUID novo gerado por nós,
  // então nunca colide (diferente do fluxo Pix, que precisa lidar com
  // webhooks duplicados do Mercado Pago).
  const { error: erroReserva } = await supabase.from("pedidos").insert({
    payment_id: paymentId,
    reference_id: null,
    ferramenta,
    duracao,
    preco,
    codigo,
    email_cliente: emailFinal,
    dados: { estado: "reservando" },
  });

  if (erroReserva) {
    console.error("[pagar-saldo aluguel] erro ao reservar pedido:", erroReserva);
    await estornarCarteira(usuarioId, valorCentavos, "Estorno: falha ao reservar pedido de aluguel");
    return { status: 500, body: { erro: "Falha ao criar pedido" } };
  }

  const mapeado = mapaServicos[chave];
  const adapter = mapeado ? fornecedores[mapeado.fornecedor] : undefined;

  if (!mapeado || !adapter) {
    await supabase
      .from("pedidos")
      .update({ dados: { estado: "manual", mensagem: "Serviço não automatizado" } })
      .eq("payment_id", paymentId);

    if (emailFinal) {
      await enviarEmailAcesso({
        destinatario: emailFinal,
        servico: nomeServico,
        linkConsulta: montarLinkConsulta(codigo),
        manual: true,
      });
    }

    return {
      status: 200,
      body: {
        sucesso: true,
        manual: true,
        mensagem: "Pedido registrado! A liberação é feita manualmente, você recebe por e-mail em instantes.",
        servico,
        codigo,
      },
    };
  }

  let criacao: { referenceId?: string; mensagemErro?: string; respostaCompleta?: any };
  try {
    criacao = await adapter.criarPedido(
      String(mapeado.serviceId),
      mapeado.precisaDadoExtra ? emailFinal ?? undefined : undefined
    );
  } catch (erroInesperado: any) {
    console.error("[pagar-saldo aluguel] exceção ao chamar fornecedor:", erroInesperado?.message);
    criacao = { mensagemErro: `Erro inesperado: ${erroInesperado?.message ?? "desconhecido"}`, respostaCompleta: null };
  }

  if (!criacao.referenceId) {
    const mensagemErro = criacao.mensagemErro ?? `Falha ao gerar acesso na ${mapeado.fornecedor}`;
    console.error(`[pagar-saldo aluguel] ${mapeado.fornecedor} não retornou referenceId:`, JSON.stringify(criacao.respostaCompleta));

    await supabase
      .from("pedidos")
      .update({ dados: { estado: "erro", mensagem: mensagemErro, respostaCompleta: criacao.respostaCompleta } })
      .eq("payment_id", paymentId);

    // Fornecedor falhou DEPOIS do débito — devolve o valor automaticamente.
    await estornarCarteira(usuarioId, valorCentavos, `Estorno: falha ao gerar ${ferramenta} - ${duracao}`);

    await enviarEmailAlertaPedido({
      motivo: "Falha ao CRIAR pedido na GSM Cheap (pago com saldo — já estornado automaticamente)",
      ferramenta,
      duracao,
      codigo,
      paymentId,
      detalhes: mensagemErro,
    });

    return {
      status: 200,
      body: {
        erro: "fornecedor_falhou",
        estornado: true,
        mensagem: "Não foi possível concluir agora. O valor já foi devolvido pro seu saldo — tente novamente em instantes.",
      },
    };
  }

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
    console.error("[pagar-saldo aluguel] exceção ao consultar resultado:", erroConsulta?.message);
    dadosFinais = { erro: erroConsulta?.message ?? "erro ao consultar resultado" };
    estadoFinal = "processando";
  }

  const dadosParaSalvar = { ...dadosFinais, estado: estadoFinal };
  await supabase.from("pedidos").update({ dados: dadosParaSalvar }).eq("payment_id", paymentId);

  if (estadoFinal === "concluido" && emailFinal) {
    await enviarEmailAcesso({
      destinatario: emailFinal,
      servico: nomeServico,
      linkConsulta: montarLinkConsulta(codigo),
      manual: false,
    });
  }

  return {
    status: 200,
    body: { sucesso: true, dados: dadosParaSalvar, estado: estadoFinal, servico, codigo, paymentId },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// ATIVAÇÃO — plano "Créditos (usuário existente)" do Moto M Tool reaproveita
// o MESMO pipeline automático do Aluguel (é assim que o fluxo Pix já
// funciona hoje). Os demais planos de ativação são sempre liberação manual
// (avisa você por e-mail, sem risco de falha de fornecedor — não precisa
// de estorno automático).
// ─────────────────────────────────────────────────────────────────────────
const FERRAMENTA_CREDITO_AUTOMATICO = "Moto M Tool";
const DURACAO_CREDITO_AUTOMATICO = "Créditos (usuário existente)";

export async function pagarAtivacaoComSaldo(params: {
  usuarioId: string;
  ferramenta: string;
  duracao: string;
  nome: string;
  username?: string;
  senha?: string;
  email: string | null;
}): Promise<Resposta> {
  const { usuarioId, ferramenta, duracao, nome, username, senha, email } = params;

  if (!ferramenta || !duracao || !nome || (!username && !email)) {
    return { status: 400, body: { erro: "Dados do plano ou do cliente ausentes" } };
  }

  const ehCreditoAutomatico = ferramenta === FERRAMENTA_CREDITO_AUTOMATICO && duracao === DURACAO_CREDITO_AUTOMATICO;

  if (ehCreditoAutomatico) {
    if (!email) {
      return { status: 400, body: { erro: "E-mail cadastrado na ferramenta é obrigatório" } };
    }
    // Mesmo pipeline automático do Aluguel — reaproveita a função inteira,
    // igual o fluxo Pix já faz (grava na tabela "checkouts"/"pedidos" normal).
    return pagarAluguelComSaldo({ usuarioId, ferramenta, duracao, emailCliente: email });
  }

  const preco = planosAtivacaoValidos[`${ferramenta}|${duracao}`];
  if (!preco) {
    return { status: 400, body: { erro: "Plano inválido" } };
  }

  const valorCentavos = Math.round(preco * 100);
  const debito = await debitarCarteira(usuarioId, valorCentavos, `Ativação: ${ferramenta} - ${duracao}`);
  if (!debito.sucesso) {
    return { status: 400, body: { erro: "saldo_insuficiente" } };
  }

  const paymentId = `saldo_${randomUUID()}`;

  const { error: erroInsercao } = await supabase.from("checkouts_ativacao").insert({
    external_reference: randomUUID(),
    payment_id: paymentId,
    ferramenta,
    duracao,
    preco,
    nome,
    username: username || null,
    senha: senha || null,
    email,
  });

  if (erroInsercao) {
    console.error("[pagar-saldo ativacao] erro ao salvar checkout:", erroInsercao);
    await estornarCarteira(usuarioId, valorCentavos, "Estorno: falha ao registrar pedido de ativação");
    return { status: 500, body: { erro: "Erro ao criar pedido" } };
  }

  // Liberação manual — só avisa você, sem chamar nenhum fornecedor externo.
  // Não tem "o que falhar" aqui, então não precisa de estorno.
  await enviarEmailNotificacaoAtivacao({
    ferramenta,
    duracao,
    preco,
    nome,
    username: username ?? "",
    senha: senha ?? undefined,
    email: email ?? "",
  });

  return {
    status: 200,
    body: {
      sucesso: true,
      mensagem: "Pedido registrado! Você recebe a confirmação da ativação em instantes.",
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────
// MÉTODOS — igual ao fluxo Pix em lib/processar-entrega-metodo.ts: gera o
// link assinado no B2 e manda por e-mail. Se o B2 falhar, não estorna (o
// pedido fica registrado pra liberação manual — mesmo comportamento do Pix).
// ─────────────────────────────────────────────────────────────────────────
export async function pagarMetodoComSaldo(params: {
  usuarioId: string;
  metodoId: string;
  emailCliente: string | null;
}): Promise<Resposta> {
  const { usuarioId, metodoId, emailCliente } = params;

  const metodo = metodos.find((m) => m.id === metodoId);
  if (!metodo) {
    return { status: 400, body: { erro: "Item não encontrado" } };
  }

  const valorCentavos = Math.round(metodo.preco * 100);
  const debito = await debitarCarteira(usuarioId, valorCentavos, `Método: ${metodo.nome}`);
  if (!debito.sucesso) {
    return { status: 400, body: { erro: "saldo_insuficiente" } };
  }

  const paymentId = `saldo_${randomUUID()}`;
  const emailFinal = pareceEmailValido(emailCliente) ? emailCliente : null;

  let linkDownload: string | null = null;
  if (metodo.arquivoPath) {
    try {
      linkDownload = await gerarLinkDownloadB2(metodo.arquivoPath);
    } catch (erroAssinatura) {
      console.error("[pagar-saldo metodo] erro ao gerar link assinado no B2:", erroAssinatura);
    }
  }

  const { error: erroInsercao } = await supabase.from("pedidos_metodos").insert({
    payment_id: paymentId,
    metodo_id: metodo.id,
    nome: metodo.nome,
    preco: metodo.preco,
    email_cliente: emailFinal,
    link_download: linkDownload,
  });

  if (erroInsercao) {
    console.error("[pagar-saldo metodo] erro ao registrar pedido:", erroInsercao);
    await estornarCarteira(usuarioId, valorCentavos, "Estorno: falha ao registrar pedido de método");
    return { status: 500, body: { erro: "Erro ao criar pedido" } };
  }

  if (emailFinal) {
    await enviarEmailAcessoMetodo({
      destinatario: emailFinal,
      nome: metodo.nome,
      descricao: metodo.descricao,
      video: metodo.video,
      linkDownload,
    });
  }

  return {
    status: 200,
    body: { sucesso: true, nome: metodo.nome, descricao: metodo.descricao, video: metodo.video || null, linkDownload },
  };
}
