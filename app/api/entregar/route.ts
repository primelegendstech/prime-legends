import { NextRequest, NextResponse } from "next/server";
import { processarEntrega } from "@/lib/processar-entrega";

// Declara explicitamente o orçamento de tempo dessa função — não depende do
// padrão da conta. 30s é bastante folga pra Mercado Pago + GSM Cheap (criar +
// consultar) rodarem com segurança, mesmo em dias de instabilidade do fornecedor.
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();
    const resultado = await processarEntrega(paymentId);
    return NextResponse.json(resultado.body, { status: resultado.status });
  } catch (erro: any) {
    console.error("[entregar] Erro inesperado:", erro?.message, erro?.stack);
    return NextResponse.json(
      { erro: "Erro ao processar entrega", detalhes: erro?.message ?? String(erro) },
      { status: 500 }
    );
  }
}