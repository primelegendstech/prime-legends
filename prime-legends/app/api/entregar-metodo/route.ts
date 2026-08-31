import { NextRequest, NextResponse } from "next/server";
import { processarEntregaMetodo } from "@/lib/processar-entrega-metodo";

export async function POST(request: NextRequest) {
  try {
    const { paymentId } = await request.json();
    if (!paymentId) {
      return NextResponse.json({ erro: "paymentId ausente" }, { status: 400 });
    }

    const resultado = await processarEntregaMetodo(String(paymentId));

    if (!resultado.encontrado) {
      return NextResponse.json({ erro: "Pedido não identificado" }, { status: 400 });
    }

    if (!resultado.sucesso) {
      if (resultado.erro === "valor_nao_confere") {
        return NextResponse.json({ erro: "Valor pago não confere" }, { status: 400 });
      }
      if (resultado.erro === "item_nao_encontrado") {
        return NextResponse.json({ erro: "Item não encontrado" }, { status: 400 });
      }
      return NextResponse.json({ erro: "Pagamento ainda não confirmado" });
    }

    return NextResponse.json({
      sucesso: true,
      nome: resultado.nome,
      descricao: resultado.descricao,
      video: resultado.video ?? null,
      linkDownload: resultado.linkDownload,
    });
  } catch (erro: any) {
    console.error("[entregar-metodo] erro:", erro?.message, erro?.stack);
    return NextResponse.json({ erro: "Erro ao processar entrega" }, { status: 500 });
  }
}
