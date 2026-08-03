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
  return resposta.json();
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

    const referenceId = pedido?.SUCCESS?.["1"]?.referenceid;
    if (!referenceId) {
      return NextResponse.json({ erro: "Falha ao gerar acesso" }, { status: 500 });
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
  } catch (erro) {
    return NextResponse.json({ erro: "Erro ao processar entrega" }, { status: 500 });
  }
}
