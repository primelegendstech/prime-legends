import { NextRequest, NextResponse } from "next/server";
import { verificarAdminApi } from "@/lib/admin";

// Consulta um pagamento direto no Mercado Pago pra mostrar no painel: status,
// método de pagamento, valor, e-mail de quem pagou, se já foi estornado, etc.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verificarAdminApi();
  if (!admin) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;

  if (id.startsWith("saldo_")) {
    return NextResponse.json({ erro: "Esse pedido foi pago com saldo interno, não existe no Mercado Pago" }, { status: 400 });
  }

  try {
    const resp = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    });

    if (!resp.ok) {
      return NextResponse.json({ erro: "Pagamento não encontrado no Mercado Pago" }, { status: 404 });
    }

    const pagamento = await resp.json();

    return NextResponse.json({
      id: pagamento.id,
      status: pagamento.status,
      status_detail: pagamento.status_detail,
      valor: pagamento.transaction_amount,
      metodo: pagamento.payment_method_id,
      emailPagador: pagamento.payer?.email ?? null,
      dataCriacao: pagamento.date_created,
      dataAprovacao: pagamento.date_approved,
      valorEstornado: pagamento.transaction_amount_refunded ?? 0,
      linkPainelMp: `https://www.mercadopago.com.br/activities/detail/${pagamento.id}`,
    });
  } catch (erro: any) {
    console.error("[admin/pagamento] erro ao consultar Mercado Pago:", erro?.message);
    return NextResponse.json({ erro: "Erro ao consultar Mercado Pago" }, { status: 500 });
  }
}
