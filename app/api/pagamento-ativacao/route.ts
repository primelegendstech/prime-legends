import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { planosAtivacaoValidos } from "@/lib/planosAtivacao";
import { supabase } from "@/lib/supabase";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ferramenta, duracao, nome, username, senha, email, ...formData } = body;

    if (!ferramenta || !duracao || !nome || (!username && !email)) {
      return NextResponse.json({ erro: "Dados do plano ou do cliente ausentes" }, { status: 400 });
    }

    // O preço NUNCA vem do navegador — só da nossa lista confiável no servidor
    const chave = `${ferramenta}|${duracao}`;
    const preco = planosAtivacaoValidos[chave];

    if (!preco) {
      return NextResponse.json({ erro: "Plano inválido" }, { status: 400 });
    }

    const externalReference = randomUUID();

    // Grava o que foi contratado + dados do cliente pra ativação manual na GSM Africa
    // depois que o pagamento for confirmado
    const { error: erroSupabase } = await supabase.from("checkouts_ativacao").insert({
      external_reference: externalReference,
      ferramenta,
      duracao,
      preco,
      nome,
      username,
      senha: senha || null,
      email,
    });

    if (erroSupabase) {
      console.error("[pagamento-ativacao] erro ao salvar checkout:", erroSupabase);
      return NextResponse.json({ erro: "Erro ao criar pagamento" }, { status: 500 });
    }

    const payment = new Payment(client);

    const resultado = await payment.create({
      body: {
        transaction_amount: preco,
        description: `${ferramenta} - Ativação ${duracao}`,
        payment_method_id: formData.payment_method_id,
        token: formData.token,
        installments: formData.installments ?? 1,
        payer: formData.payer,
        external_reference: externalReference,
        // Mesmo webhook que já usamos nos outros fluxos — cuida de marcar como pago,
        // a ativação em si continua manual (GSM Africa)
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/mercadopago`,
      },
    });

    return NextResponse.json({
      id: resultado.id,
      status: resultado.status,
      point_of_interaction: resultado.point_of_interaction,
    });
  } catch (erro: any) {
    console.error("[pagamento-ativacao] erro:", erro?.message, erro?.stack);
    return NextResponse.json({ erro: "Erro ao criar pagamento" }, { status: 500 });
  }
}
