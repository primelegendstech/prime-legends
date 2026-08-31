import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ erro: "id ausente" }, { status: 400 });
  }

  try {
    const resp = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    });
    const dados = await resp.json();
    return NextResponse.json({ status: dados.status });
  } catch (erro) {
    console.error("[pagamento/status] erro:", erro);
    return NextResponse.json({ erro: "Erro ao consultar status" }, { status: 500 });
  }
}
