import { NextRequest, NextResponse } from "next/server";
import { processarEntrega } from "@/lib/processar-entrega";

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
