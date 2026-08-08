import { randomUUID } from "crypto";
import { mapaServicos } from "@/lib/gsmcheap-servicos";
import { fornecedores } from "@/lib/fornecedores";
import { supabase } from "@/lib/supabase";
import { enviarEmailAcesso } from "@/lib/enviar-email";

function montarLinkConsulta(codigo: string) {
  return `${process.env.NEXT_PUBLIC_SITE_URL}/consultar?codigo=${codigo}`;
}

// O Mercado Pago às vezes retorna "XXXXXXXXXXX" no lugar do e-mail real
// (comum em PIX ou pagador sem conta MP verificada). Isso não é um e-mail válido.
function pareceEmailValido(email: string | null): email is string {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

    if (!pedidoExistente.reference_id) {
      return {
        status: 200,
        body: {
          erro: "gsmcheap_falhou",
          manual: true,
          mensagem: pedidoExistente.dados?.mensagem ?? "Pedido pendente de liberação manual",
          servico,
          codigo: pedidoExistente.codigo,
        },
      };
    }

    // Descobre qual fornecedor foi usado nesse pedido, pra consultar no adaptador certo
    const chaveExistente = `${pedidoExistente.ferramenta}|${pedidoExistente.duracao}`;
    const mapeadoExistente = mapaServicos[chaveExistente];
    const adapterExistente = mapeadoExistente ? fornecedores[mapeadoExistente.fornecedor] : undefined;

    const dadosConsulta = adapterExistente
      ? await adapterExistente.consultarPedido(pedidoExistente.reference_id)
      : pedidoExistente.dados;

    return {
      status: 200,
      body: { sucesso: true, dados: dadosConsulta, servico, codigo: pedidoExistente.codigo },
    };
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

  // 4. Verifica se temos o serviço mapeado, e com qual fornecedor
  const chave = `${ferramenta}|${duracao}`;
  const mapeado = mapaServicos[chave];
  const adapter = mapeado ? fornecedores[mapeado.fornecedor] : undefined;

  if (!mapeado || !adapter) {
    await supabase.from("pedidos").insert({
      payment_id: paymentId,
      reference_id: null,
      ferramenta,
      duracao,
      preco,
      codigo,
      email_cliente: emailCliente,
      dados: { status: "manual", mensagem: "Serviço não automatizado" },
    });
    if (emailCliente) {
      await enviarEmailAcesso({
        destinatario: emailCliente,
        servico: nomeServico,
        linkConsulta: montarLinkConsulta(codigo),
        manual: true,
      });
    }
    return { status: 200, body: { manual: true, servico, codigo } };
  }

  // 5. Faz o pedido no fornecedor certo (GSM Cheap, ou qualquer outro cadastrado em lib/fornecedores)
const criacao = await adapter.criarPedido(String(mapeado.serviceId));
  if (!criacao.referenceId) {
    const mensagemErro = criacao.mensagemErro ?? `Falha ao gerar acesso na ${mapeado.fornecedor}`;
    console.error(
      `[entrega] ${mapeado.fornecedor} não retornou referenceId. Resposta completa:`,
      JSON.stringify(criacao.respostaCompleta)
    );

    const { error: erroInsert } = await supabase.from("pedidos").insert({
      payment_id: paymentId,
      reference_id: null,
      ferramenta,
      duracao,
      preco,
      codigo,
      email_cliente: emailCliente,
      dados: {
        status: `erro_${mapeado.fornecedor}`,
        mensagem: mensagemErro,
        respostaCompleta: criacao.respostaCompleta,
      },
    });
    if (erroInsert && erroInsert.code !== "23505") {
      console.error("[entrega] erro ao salvar pedido pendente:", erroInsert);
    }

    if (emailCliente) {
      await enviarEmailAcesso({
        destinatario: emailCliente,
        servico: nomeServico,
        linkConsulta: montarLinkConsulta(codigo),
        manual: true,
      });
    }

    return {
      status: 200,
      body: { erro: `${mapeado.fornecedor}_falhou`, manual: true, mensagem: mensagemErro, servico, codigo },
    };
  }

  // 6. Consulta o resultado (instantâneo, na maioria dos fornecedores)
  const dadosFinais = await adapter.consultarPedido(criacao.referenceId);

  // 7. Salva no banco pra não duplicar depois
  const { error: erroInsertFinal } = await supabase.from("pedidos").insert({
    payment_id: paymentId,
    reference_id: criacao.referenceId,
    ferramenta,
    duracao,
    preco,
    codigo,
    email_cliente: emailCliente,
    dados: dadosFinais,
  });

  if (erroInsertFinal) {
    if (erroInsertFinal.code === "23505") {
      const { data: jaExiste } = await supabase
        .from("pedidos")
        .select("*")
        .eq("payment_id", paymentId)
        .maybeSingle();
      return {
        status: 200,
        body: { sucesso: true, dados: jaExiste?.dados ?? dadosFinais, servico, codigo: jaExiste?.codigo ?? codigo },
      };
    }
    console.error("[entrega] erro ao salvar pedido final:", erroInsertFinal);
  }

  if (emailCliente) {
    await enviarEmailAcesso({
      destinatario: emailCliente,
      servico: nomeServico,
      linkConsulta: montarLinkConsulta(codigo),
      manual: false,
    });
  }

  return { status: 200, body: { sucesso: true, dados: dadosFinais, servico, codigo } };
}
