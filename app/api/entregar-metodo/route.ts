import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { metodos } from "@/data/metodos";
import { enviarEmailAcessoMetodo } from "@/lib/enviar-email";
import { gerarLinkDownloadB2 } from "@/lib/b2";

function pareceEmailValido(email: string | null): email is string {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();
    if (!paymentId) {
      return NextResponse.json({ erro: "paymentId ausente" }, { status: 400 });
    }

    // Já processado antes? Reaproveita o link salvo (evita gerar de novo e
    // reenviar e-mail toda vez que o front chama de novo).
    const { data: pedidoExistente } = await supabase
      .from("pedidos_metodos")
      .select("*")
      .eq("payment_id", paymentId)
      .maybeSingle();

    if (pedidoExistente) {
      return NextResponse.json({
        sucesso: true,
        nome: pedidoExistente.nome,
        linkDownload: pedidoExistente.link_download,
      });
    }

    // Confirma no Mercado Pago que o pagamento foi realmente aprovado
    const pagamentoResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    });
    const pagamento = await pagamentoResp.json();

    if (pagamento.status !== "approved") {
      return NextResponse.json({ erro: "Pagamento ainda não confirmado" });
    }

    const externalReference = pagamento.external_reference;
    if (!externalReference) {
      return NextResponse.json({ erro: "Pedido não identificado" }, { status: 400 });
    }

    const { data: checkout } = await supabase
      .from("checkouts_metodos")
      .select("*")
      .eq("external_reference", externalReference)
      .maybeSingle();

    if (!checkout) {
      return NextResponse.json({ erro: "Pedido não identificado" }, { status: 400 });
    }

    if (Number(pagamento.transaction_amount) < Number(checkout.preco)) {
      console.error("[entregar-metodo] valor pago menor que o esperado:", pagamento.transaction_amount, checkout.preco);
      return NextResponse.json({ erro: "Valor pago não confere" }, { status: 400 });
    }

    const metodo = metodos.find((m) => m.id === checkout.metodo_id);
    if (!metodo) {
      return NextResponse.json({ erro: "Item não encontrado" }, { status: 400 });
    }

    // Gera o link de download assinado (temporário) — só existe DEPOIS do
    // pagamento confirmado. O arquivo deve estar num bucket B2 privado.
    // Se der erro (credenciais erradas, arquivo não encontrado, etc), não
    // quebra a resposta — cai pro fallback manual (WhatsApp) que o
    // front-end já mostra quando linkDownload vem nulo e não tem vídeo/obs
    // suficiente, e o pedido fica registrado do mesmo jeito pra você
    // conferir e enviar manualmente.
    let linkDownload: string | null = null;
    if (metodo.arquivoPath) {
      try {
        linkDownload = await gerarLinkDownloadB2(metodo.arquivoPath);
      } catch (erroAssinatura) {
        console.error("[entregar-metodo] erro ao gerar link assinado no B2:", erroAssinatura);
      }
    }

    const emailFinal = pareceEmailValido(checkout.email_cliente) ? checkout.email_cliente : null;

    await supabase.from("pedidos_metodos").insert({
      payment_id: paymentId,
      metodo_id: metodo.id,
      nome: metodo.nome,
      preco: metodo.preco,
      email_cliente: emailFinal,
      link_download: linkDownload,
    });

    if (emailFinal) {
      await enviarEmailAcessoMetodo({
        destinatario: emailFinal,
        nome: metodo.nome,
        descricao: metodo.descricao,
        video: metodo.video,
        linkDownload,
      });
    }

    return NextResponse.json({
      sucesso: true,
      nome: metodo.nome,
      descricao: metodo.descricao,
      video: metodo.video || null,
      linkDownload,
    });
  } catch (erro: any) {
    console.error("[entregar-metodo] erro:", erro?.message, erro?.stack);
    return NextResponse.json({ erro: "Erro ao processar entrega" }, { status: 500 });
  }
}
