import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { titulo, preco } = await request.json();

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: titulo,
            title: titulo,
            quantity: 1,
            unit_price: Number(preco),
            currency_id: "BRL",
          },
        ],
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/sucesso?servico=${encodeURIComponent(titulo)}&valor=${preco}`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/alugueis?status=falha`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/alugueis?status=pendente`,
        },
        auto_return: "approved",
      },
    });

    return NextResponse.json({ url: result.init_point });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao criar pagamento" }, { status: 500 });
  }
}