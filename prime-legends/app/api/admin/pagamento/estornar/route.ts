import { NextRequest, NextResponse } from "next/server";
import { verificarAdminApi } from "@/lib/admin";
import { supabase } from "@/lib/supabase";

// Estorna um pagamento diretamente no Mercado Pago (estorno total). O
// dinheiro volta pro cartão/Pix do cliente pelo próprio Mercado Pago — isso
// AQUI não mexe em saldo de carteira interna (é um pagamento real, não um
// débito de saldo).
export async function POST(request: NextRequest) {
  const admin = await verificarAdminApi();
  if (!admin) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  try {
    const { paymentId, tipo } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ erro: "paymentId é obrigatório" }, { status: 400 });
    }

    if (String(paymentId).startsWith("saldo_")) {
      return NextResponse.json(
        { erro: "Esse pedido foi pago com saldo interno — use o ajuste de carteira do cliente pra devolver o valor." },
        { status: 400 }
      );
    }

    const resp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}/refunds`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const resultado = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      console.error("[admin/estornar] Mercado Pago recusou o estorno:", resultado);
      return NextResponse.json(
        { erro: resultado?.message || "Mercado Pago recusou o estorno" },
        { status: 400 }
      );
    }

    // Melhor esforço: marca o pedido correspondente como estornado no nosso
    // banco (coluna "estornado", ver supabase-admin-migration.sql). Se a
    // coluna ainda não existir, o estorno no Mercado Pago já aconteceu de
    // qualquer forma — só avisamos que o registro local não pôde ser salvo.
    let avisoRegistro: string | null = null;
    const tabela = tipo === "licenca" ? "checkouts_ativacao" : tipo === "metodo" ? "pedidos_metodos" : "pedidos";
    const { error: erroMarcar } = await supabase
      .from(tabela)
      .update({ estornado: true, estornado_em: new Date().toISOString() })
      .eq("payment_id", paymentId);

    if (erroMarcar) {
      console.error("[admin/estornar] estorno feito no MP, mas falhou ao marcar localmente:", erroMarcar);
      avisoRegistro =
        "Estorno realizado no Mercado Pago, mas não foi possível marcar localmente (rodou o supabase-admin-migration.sql?).";
    }

    return NextResponse.json({ sucesso: true, resultado, aviso: avisoRegistro });
  } catch (erro: any) {
    console.error("[admin/estornar] erro inesperado:", erro?.message);
    return NextResponse.json({ erro: "Erro inesperado ao estornar" }, { status: 500 });
  }
}
