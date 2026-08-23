import { NextRequest, NextResponse } from "next/server";
import { processarEntrega } from "@/lib/processar-entrega";
import { processarEntregaAtivacao } from "@/lib/processar-entrega-ativacao";
import { processarEntregaCarteira } from "@/lib/processar-entrega-carteira";

// Mesmo motivo do /api/entregar: dá folga suficiente pro fluxo completo
// (Mercado Pago + GSM Cheap) rodar sem ser cortado no meio do caminho.
export const maxDuration = 30;

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

    // Primeiro checa se é um depósito de saldo na carteira
    const resultadoCarteira = await processarEntregaCarteira(String(paymentId));

    if (resultadoCarteira.encontrado) {
      return NextResponse.json({ recebido: true }, { status: 200 });
    }

    // Depois checa se é um pagamento de Ativação de Licença — se for, já dispara
    // o e-mail automático pra você e para por aqui, sem tentar o fluxo de aluguel.
    const resultadoAtivacao = await processarEntregaAtivacao(String(paymentId));

    if (!resultadoAtivacao.encontrado) {
      // Não é ativação — processa a entrega usando a mesma lógica da tela de sucesso (aluguel).
      // Não repassamos o resultado pro Mercado Pago em detalhe — só confirmamos que recebemos,
      // pra ele não ficar tentando reenviar a notificação várias vezes.
      await processarEntrega(String(paymentId));
    }

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
