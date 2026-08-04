import { NextRequest, NextResponse } from "next/server";
import { processarEntrega } from "@/lib/processar-entrega";

// O Mercado Pago chama essa rota automaticamente quando o status de um pagamento muda —
// independente do cliente ter chegado ou não na tela /sucesso.
export async function POST(request: NextRequest) {
  try {
    const corpo = await request.json().catch(() => ({}));

    // O Mercado Pago manda o ID do pagamento em data.id (formato mais comum hoje)
    const paymentId = corpo?.data?.id;

    if (!paymentId) {
      // Notificação de outro tipo (ex: teste do painel) — só confirma recebimento
      return NextResponse.json({ recebido: true }, { status: 200 });
    }

    // Processa a entrega usando a mesma lógica da tela de sucesso.
    // Não repassamos o resultado pro Mercado Pago em detalhe — só confirmamos que recebemos,
    // pra ele não ficar tentando reenviar a notificação várias vezes.
    await processarEntrega(String(paymentId));

    return NextResponse.json({ recebido: true }, { status: 200 });
  } catch (erro: any) {
    console.error("[webhook mercadopago] Erro:", erro?.message, erro?.stack);
    // Mesmo com erro interno, respondemos 200 pra evitar reenvios em loop do Mercado Pago;
    // o erro já fica registrado no log pra você investigar.
    return NextResponse.json({ recebido: true }, { status: 200 });
  }
}

// O Mercado Pago pode testar a URL com GET no painel — respondemos OK só pra validar que existe
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
