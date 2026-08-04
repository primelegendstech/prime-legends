import { mapaServicos } from "@/lib/gsmcheap-servicos";
import { supabase } from "@/lib/supabase";

async function chamarGsmCheap(action: string, parametros?: any) {
  const url = `${process.env.GSMCHEAP_URL}/public/api/index.php`;
  const body = new URLSearchParams({
    username: process.env.GSMCHEAP_USERNAME!,
    apiaccesskey: process.env.GSMCHEAP_API_KEY!,
    action,
    requestformat: "JSON",
    ...(parametros ? { parameters: Buffer.from(JSON.stringify(parametros)).toString("base64") } : {}),
  });
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await resposta.json();
  console.log(`[GSM Cheap] action=${action} resposta:`, JSON.stringify(json));
  return json;
}

// Função central de entrega — chamada tanto pela tela /sucesso quanto pelo webhook do Mercado Pago.
// Assim os dois caminhos usam exatamente a mesma lógica e não podem ficar inconsistentes.
export async function processarEntrega(paymentId: string) {
  if (!paymentId) {
    return { status: 400, body: { erro: "paymentId ausente" } };
  }

  // 1. Verifica se já existe um pedido salvo pra esse pagamento (evita duplicar)
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
        },
      };
    }
    const resultado = await chamarGsmCheap("getimeiorderbulk", {
      "1": { ID: pedidoExistente.reference_id },
    });
    return { status: 200, body: { sucesso: true, dados: resultado?.["1"] ?? resultado, servico } };
  }

  // 2. Confirma no Mercado Pago que o pagamento foi realmente aprovado
  const pagamentoResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  });
  const pagamento = await pagamentoResp.json();

  if (pagamento.status !== "approved") {
    return { status: 200, body: { erro: "Pagamento ainda não confirmado" } };
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
    console.error(
      "[entrega] valor pago menor que o esperado:",
      pagamento.transaction_amount,
      checkout.preco
    );
    return { status: 400, body: { erro: "Valor pago não confere" } };
  }

  const { ferramenta, duracao, preco } = checkout;
  const servico = { ferramenta, duracao, preco };

  // 4. Verifica se temos o serviço mapeado como automático
  const chave = `${ferramenta}|${duracao}`;
  const mapeado = mapaServicos[chave];
  if (!mapeado) {
    return { status: 200, body: { manual: true, servico } };
  }

  // 5. Faz o pedido na GSM Cheap
  const pedido = await chamarGsmCheap("placebulkorder", {
    "1": { ID: mapeado.serviceId, QNT: 1 },
  });

  const itemResposta = pedido?.SUCCESS?.["1"];
  const deuErro = itemResposta?.status === "error";
  const mensagemGsm = itemResposta?.message;
  const referenceId = !deuErro ? itemResposta?.referenceid : undefined;

  if (!referenceId) {
    const mensagemErro = mensagemGsm ?? "Falha ao gerar acesso na GSM Cheap";
    console.error("[entrega] GSM Cheap não retornou referenceId. Resposta completa:", JSON.stringify(pedido));

    const { error: erroInsert } = await supabase.from("pedidos").insert({
      payment_id: paymentId,
      reference_id: null,
      ferramenta,
      duracao,
      preco,
      dados: { status: "erro_gsmcheap", mensagem: mensagemErro, respostaCompleta: pedido },
    });
    if (erroInsert && erroInsert.code !== "23505") {
      console.error("[entrega] erro ao salvar pedido pendente:", erroInsert);
    }

    return { status: 200, body: { erro: "gsmcheap_falhou", manual: true, mensagem: mensagemErro, servico } };
  }

  // 6. Consulta o resultado (instantâneo)
  const resultado = await chamarGsmCheap("getimeiorderbulk", {
    "1": { ID: referenceId },
  });
  const dadosFinais = resultado?.["1"] ?? resultado;

  // 7. Salva no banco pra não duplicar depois
  const { error: erroInsertFinal } = await supabase.from("pedidos").insert({
    payment_id: paymentId,
    reference_id: referenceId,
    ferramenta,
    duracao,
    preco,
    dados: dadosFinais,
  });

  if (erroInsertFinal) {
    if (erroInsertFinal.code === "23505") {
      const { data: jaExiste } = await supabase
        .from("pedidos")
        .select("*")
        .eq("payment_id", paymentId)
        .maybeSingle();
      return { status: 200, body: { sucesso: true, dados: jaExiste?.dados ?? dadosFinais, servico } };
    }
    console.error("[entrega] erro ao salvar pedido final:", erroInsertFinal);
  }

  return { status: 200, body: { sucesso: true, dados: dadosFinais, servico } };
}
