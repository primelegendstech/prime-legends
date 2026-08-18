import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { avaliarResultadoFornecedor } from "@/lib/avaliar-resultado";

export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("codigo");

  if (!codigo) {
    return NextResponse.json({ erro: "codigo ausente" }, { status: 400 });
  }

  const { data: pedido } = await supabase
    .from("pedidos")
    .select("*")
    .eq("codigo", codigo)
    .maybeSingle();

  if (!pedido) {
    return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 });
  }

  const servico = {
    ferramenta: pedido.ferramenta,
    duracao: pedido.duracao,
    preco: pedido.preco,
    codigo: pedido.codigo,
    criadoEm: pedido.created_at,
  };

  if (!pedido.reference_id) {
    return NextResponse.json({
      manual: true,
      mensagem: pedido.dados?.mensagem ?? "Pedido pendente de liberação manual",
      servico,
    });
  }

  // Mesma lógica de estados usada em processar-entrega: só considera
  // "sucesso" quando o código realmente já foi gerado — nunca mostra uma
  // tela de sucesso vazia enquanto o pedido ainda está processando.
  const estado = pedido.dados?.estado ?? avaliarResultadoFornecedor(pedido.dados);

  if (estado === "concluido") {
    return NextResponse.json({ sucesso: true, dados: pedido.dados, servico });
  }

  if (estado === "processando") {
    return NextResponse.json({
      processando: true,
      mensagem: "Seu acesso ainda está sendo gerado. Atualize essa página em alguns instantes.",
      servico,
    });
  }

  return NextResponse.json({
    manual: true,
    mensagem: pedido.dados?.mensagem ?? "Pedido pendente de liberação manual",
    servico,
  });
}
