import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
  };

  if (!pedido.reference_id) {
    return NextResponse.json({
      manual: true,
      mensagem: pedido.dados?.mensagem ?? "Pedido pendente de liberação manual",
      servico,
    });
  }

  return NextResponse.json({ sucesso: true, dados: pedido.dados, servico });
}
