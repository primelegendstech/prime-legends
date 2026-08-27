import { NextRequest, NextResponse } from "next/server";
import { verificarAdminApi } from "@/lib/admin";
import { buscarExtratoCliente } from "@/lib/admin-carteira";

export async function GET(request: NextRequest) {
  const admin = await verificarAdminApi();
  if (!admin) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const usuarioId = request.nextUrl.searchParams.get("usuarioId");
  if (!usuarioId) {
    return NextResponse.json({ erro: "usuarioId é obrigatório" }, { status: 400 });
  }

  const movimentacoes = await buscarExtratoCliente(usuarioId);
  return NextResponse.json({ movimentacoes });
}
