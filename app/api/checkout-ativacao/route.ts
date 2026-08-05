import { MercadoPagoConfig, Preference } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { planosAtivacaoValidos } from "@/lib/planosAtivacao";
import { supabase } from "@/lib/supabase";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const { ferramenta, duracao, nome, username, email } = await request.json();

    if (!ferramenta || !duracao || !nome || !username || !email) {
      return NextResponse.json({ error: "Dados do plano ou do cliente ausentes" }, { status: 400 });
    }

    // O preço NUNCA vem do navegador — só da nossa lista confiável no servidor
    const chave = `${ferramenta}|${duracao}`;
    const preco = planosAtivacaoValidos[chave];

    if (!preco) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const titulo = `${ferramenta} - Ativação ${duracao}`;
    const externalReference = randomUUID();

    // Grava o que foi REALMENTE contratado + dados do cliente pra ativação manual
    // na GSM Africa depois que o pagamento for confirmado
    const { error: erroSupabase } = await supabase.from("checkouts_ativacao").insert({
      external_reference: externalReference,
      ferramenta,
      duracao,
      preco,
      nome,
      username,
      email,
    });

    if (erroSupabase) {
      console.error("[checkout-ativacao] erro ao salvar checkout:", erroSupabase);
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
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/ativacao?status=falha`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/ativacao?status=pendente`,
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
