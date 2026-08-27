import { NextRequest, NextResponse } from "next/server";
import { verificarAdminApi } from "@/lib/admin";
import { debitarCarteira, estornarCarteira } from "@/lib/carteira-debito";

// Ajuste manual de saldo — reaproveita as MESMAS funções/RPCs do banco que
// o site já usa (carteira_debitar / carteira_estornar), então o ajuste
// aparece no extrato do cliente exatamente como qualquer outra movimentação.
// "credito" usa a RPC de estorno por baixo (ela só credita, sem checar
// motivo) — é o jeito mais seguro de somar saldo sem duplicar lógica.
export async function POST(request: NextRequest) {
  const admin = await verificarAdminApi();
  if (!admin) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  try {
    const { usuarioId, tipoAjuste, valorReais, descricao } = await request.json();

    if (!usuarioId || !tipoAjuste || !valorReais || Number(valorReais) <= 0) {
      return NextResponse.json({ erro: "Dados inválidos" }, { status: 400 });
    }

    const valorCentavos = Math.round(Number(valorReais) * 100);
    const descricaoFinal = descricao?.trim() || `Ajuste manual (admin: ${admin.email})`;

    if (tipoAjuste === "credito") {
      await estornarCarteira(usuarioId, valorCentavos, descricaoFinal);
      return NextResponse.json({ sucesso: true });
    }

    if (tipoAjuste === "debito") {
      const resultado = await debitarCarteira(usuarioId, valorCentavos, descricaoFinal);
      if (!resultado.sucesso) {
        return NextResponse.json({ erro: "Saldo insuficiente pro débito" }, { status: 400 });
      }
      return NextResponse.json({ sucesso: true, novoSaldoCentavos: resultado.novoSaldoCentavos });
    }

    return NextResponse.json({ erro: "tipoAjuste inválido" }, { status: 400 });
  } catch (erro: any) {
    console.error("[admin/carteira/ajustar] erro inesperado:", erro?.message);
    return NextResponse.json({ erro: "Erro inesperado" }, { status: 500 });
  }
}
