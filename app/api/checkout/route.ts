import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { planosValidos } from "@/lib/planos";
import { supabase } from "@/lib/supabase";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { ferramenta, duracao } = await request.json();

    if (!ferramenta || !duracao) {
      return NextResponse.json({ error: "Dados do plano ausentes" }, { status: 400 });
    }

    // O preço NUNCA vem do navegador — só da nossa lista confiável no servidor
    const chave = `${ferramenta}|${duracao}`;
    const preco = planosValidos[chave];

    if (!preco) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const titulo = `${ferramenta} - Aluguel ${duracao}`;
    const externalReference = randomUUID();

    // Grava o que foi REALMENTE contratado antes de mandar pro Mercado Pago,
    // pra depois o /api/entregar confiar nisso e não no que vier do navegador
    const { error: erroSupabase } = await supabase.from("checkouts").insert({
      external_reference: externalReference,
      ferramenta,
      duracao,
      preco,
    });

    if (erroSupabase) {
      console.error("[checkout] erro ao salvar checkout:", erroSupabase);
      return NextResponse.json({ error: "Erro ao criar pagamento" }, { status: 500 });
    }

    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: [
          {
            id: titulo,
            title: titulo,
            quantity: 1,
            unit_price: preco,
            currency_id: "BRL",
          },
        ],
        external_reference: externalReference,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/sucesso`,
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
