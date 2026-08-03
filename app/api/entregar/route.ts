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
    const { paymentId, ferramenta, duracao } = await request.json();

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
      // Se já deu erro antes (sem reference_id), não tenta de novo na GSM Cheap —
      // só avisa que está pendente de resolução manual
      if (!pedidoExistente.reference_id) {
        return NextResponse.json({
          erro: "gsmcheap_falhou",
          manual: true,
          mensagem: pedidoExistente.dados?.mensagem ?? "Pedido pendente de liberação manual",
        });
      }

      // Já foi processado antes — só consulta o status atual e retorna
      const resultado = await chamarGsmCheap("getimeiorderbulk", {
        "1": { ID: pedidoExistente.reference_id },
      });
      return NextResponse.json({ sucesso: true, dados: resultado?.["1"] ?? resultado });
    }

    // 2. Confirma no Mercado Pago que o pagamento foi realmente aprovado
    const pagamentoResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    });
    const pagamento = await pagamentoResp.json();

    if (pagamento.status !== "approved") {
      return NextResponse.json({ erro: "Pagamento ainda não confirmado" }, { status: 400 });
    }

    // 3. Verifica se temos o serviço mapeado
    const chave = `${ferramenta}|${duracao}`;
    const servico = mapaServicos[chave];
    if (!servico) {
      return NextResponse.json({ manual: true });
    }

    // 4. Faz o pedido na GSM Cheap
    const pedido = await chamarGsmCheap("placebulkorder", {
      "1": { ID: servico.serviceId, QNT: 1 },
    });

    // A GSM Cheap responde erros (ex: saldo insuficiente) DENTRO do bloco SUCCESS,
    // com status: "error" — confirmado nos logs em 03/08.
    // Exemplo real: {"SUCCESS":{"1":{"status":"error","message":"Not enough balance"}}}
    const itemResposta = pedido?.SUCCESS?.["1"];
    const deuErro = itemResposta?.status === "error";
    const mensagemGsm = itemResposta?.message;

    const referenceId = !deuErro ? itemResposta?.referenceid : undefined;

    if (!referenceId) {
      const mensagemErro = mensagemGsm ?? "Falha ao gerar acesso na GSM Cheap";

      console.error("[entregar] GSM Cheap não retornou referenceId. Resposta completa:", JSON.stringify(pedido));

      // Salva como pendente pra você resolver manualmente (ex: colocar saldo e reprocessar)
      await supabase.from("pedidos").insert({
        payment_id: paymentId,
        reference_id: null,
        dados: { status: "erro_gsmcheap", mensagem: mensagemErro, respostaCompleta: pedido },
      });

      return NextResponse.json({
        erro: "gsmcheap_falhou",
        manual: true,
        mensagem: mensagemErro,
      });
    }

    // 5. Consulta o resultado (instantâneo)
    const resultado = await chamarGsmCheap("getimeiorderbulk", {
      "1": { ID: referenceId },
    });

    const dadosFinais = resultado?.["1"] ?? resultado;

    // 6. Salva no banco pra não duplicar depois
    await supabase.from("pedidos").insert({
      payment_id: paymentId,
      reference_id: referenceId,
      dados: dadosFinais,
    });

    return NextResponse.json({ sucesso: true, dados: dadosFinais });
  } catch (erro: any) {
    console.error("[entregar] Erro inesperado:", erro?.message, erro?.stack);
    return NextResponse.json(
      { erro: "Erro ao processar entrega", detalhes: erro?.message ?? String(erro) },
      { status: 500 }
    );
  }
}