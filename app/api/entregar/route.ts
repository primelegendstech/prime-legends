import { NextRequest, NextResponse } from "next/server";
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

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ erro: "paymentId ausente" }, { status: 400 });
    }

    // 1. Verifica se já existe um pedido salvo pra esse pagamento (evita duplicar)
    const { data: pedidoExistente } = await supabase
      .from("pedidos")
      .select("*")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (pedidoExistente) {
      if (!pedidoExistente.reference_id) {
        return NextResponse.json({
          erro: "gsmcheap_falhou",
          manual: true,
          mensagem: pedidoExistente.dados?.mensagem ?? "Pedido pendente de liberação manual",
        });
      }
      const resultado = await chamarGsmCheap("getimeiorderbulk", {
        "1": { ID: pedidoExistente.reference_id },
      });
      return NextResponse.json({ sucesso: true, dados: resultado?.["1"] ?? resultado });
    }

    // 2. Confirma no Mercado Pago que o pagamento foi realmente aprovado,
    // e pega o external_reference que o PRÓPRIO Mercado Pago guardou
    // (nunca confiamos em ferramenta/duracao vindos do navegador aqui)
    const pagamentoResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    });
    const pagamento = await pagamentoResp.json();

    if (pagamento.status !== "approved") {
      return NextResponse.json({ erro: "Pagamento ainda não confirmado" }, { status: 400 });
    }

    const externalReference = pagamento.external_reference;
    if (!externalReference) {
      console.error("[entregar] pagamento sem external_reference:", paymentId);
      return NextResponse.json({ erro: "Pedido não identificado" }, { status: 400 });
    }

    // 3. Busca o que foi REALMENTE contratado, gravado no momento do checkout
    const { data: checkout } = await supabase
      .from("checkouts")
      .select("*")
      .eq("external_reference", externalReference)
      .maybeSingle();

    if (!checkout) {
      console.error("[entregar] checkout não encontrado para external_reference:", externalReference);
      return NextResponse.json({ erro: "Pedido não identificado" }, { status: 400 });
    }

    // Proteção extra: confere se o valor pago bate com o valor do plano
    if (Number(pagamento.transaction_amount) < Number(checkout.preco)) {
      console.error(
        "[entregar] valor pago menor que o esperado:",
        pagamento.transaction_amount,
        checkout.preco
      );
      return NextResponse.json({ erro: "Valor pago não confere" }, { status: 400 });
    }

    const { ferramenta, duracao } = checkout;

    // 4. Verifica se temos o serviço mapeado como automático
    const chave = `${ferramenta}|${duracao}`;
    const servico = mapaServicos[chave];
    if (!servico) {
      return NextResponse.json({ manual: true });
    }

    // 5. Faz o pedido na GSM Cheap
    const pedido = await chamarGsmCheap("placebulkorder", {
      "1": { ID: servico.serviceId, QNT: 1 },
    });

    // A GSM Cheap responde erros (ex: saldo insuficiente) DENTRO do bloco SUCCESS
    const itemResposta = pedido?.SUCCESS?.["1"];
    const deuErro = itemResposta?.status === "error";
    const mensagemGsm = itemResposta?.message;
    const referenceId = !deuErro ? itemResposta?.referenceid : undefined;

    if (!referenceId) {
      const mensagemErro = mensagemGsm ?? "Falha ao gerar acesso na GSM Cheap";
      console.error("[entregar] GSM Cheap não retornou referenceId. Resposta completa:", JSON.stringify(pedido));

      const { error: erroInsert } = await supabase.from("pedidos").insert({
        payment_id: paymentId,
        reference_id: null,
        dados: { status: "erro_gsmcheap", mensagem: mensagemErro, respostaCompleta: pedido },
      });
      if (erroInsert && erroInsert.code !== "23505") {
        console.error("[entregar] erro ao salvar pedido pendente:", erroInsert);
      }

      return NextResponse.json({ erro: "gsmcheap_falhou", manual: true, mensagem: mensagemErro });
    }

    // 6. Consulta o resultado (instantâneo)
    const resultado = await chamarGsmCheap("getimeiorderbulk", {
      "1": { ID: referenceId },
    });
    const dadosFinais = resultado?.["1"] ?? resultado;

    // 7. Salva no banco pra não duplicar depois — a constraint UNIQUE protege contra corrida
    const { error: erroInsertFinal } = await supabase.from("pedidos").insert({
      payment_id: paymentId,
      reference_id: referenceId,
      dados: dadosFinais,
    });

    if (erroInsertFinal) {
      if (erroInsertFinal.code === "23505") {
        // Outra requisição já processou esse mesmo pagamento entre a checagem e agora
        const { data: jaExiste } = await supabase
          .from("pedidos")
          .select("*")
          .eq("payment_id", paymentId)
          .maybeSingle();
        return NextResponse.json({ sucesso: true, dados: jaExiste?.dados ?? dadosFinais });
      }
      console.error("[entregar] erro ao salvar pedido final:", erroInsertFinal);
    }

    return NextResponse.json({ sucesso: true, dados: dadosFinais });
  } catch (erro: any) {
    console.error("[entregar] Erro inesperado:", erro?.message, erro?.stack);
    return NextResponse.json(
      { erro: "Erro ao processar entrega", detalhes: erro?.message ?? String(erro) },
      { status: 500 }
    );
  }
}
