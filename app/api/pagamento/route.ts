import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { planosValidos } from "@/lib/planos";
import { supabase } from "@/lib/supabase";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ferramenta, duracao, emailCliente, ...formData } = body;

    if (!ferramenta || !duracao) {
      return NextResponse.json({ erro: "Dados do plano ausentes" }, { status: 400 });
    }

    // O e-mail agora vem digitado pelo próprio cliente ANTES do pagamento —
    // não depende mais do que o Brick/Mercado Pago retorna (que às vezes vem
    // vazio). Validação simples de formato, defensiva.
    const emailValido =
      typeof emailCliente === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCliente);

    if (!emailValido) {
      return NextResponse.json({ erro: "E-mail inválido" }, { status: 400 });
    }

    // O preço NUNCA vem do navegador — só da nossa lista confiável no servidor
    const chave = `${ferramenta}|${duracao}`;
    const preco = planosValidos[chave];

    if (!preco) {
      return NextResponse.json({ erro: "Plano inválido" }, { status: 400 });
    }

    const externalReference = randomUUID();

    // Grava o que foi REALMENTE contratado antes de criar o pagamento,
    // pra depois o /api/entregar e o webhook confiarem nisso — agora
    // incluindo o e-mail que o cliente digitou, como fonte confiável.
    const { error: erroSupabase } = await supabase.from("checkouts").insert({
      external_reference: externalReference,
      ferramenta,
      duracao,
      preco,
      email_cliente: emailCliente,
    });

    if (erroSupabase) {
      console.error("[pagamento] erro ao salvar checkout:", erroSupabase);
      return NextResponse.json({ erro: "Erro ao criar pagamento" }, { status: 500 });
    }

    const payment = new Payment(client);

    const resultado = await payment.create({
      body: {
        transaction_amount: preco,
        description: `${ferramenta} - Aluguel ${duracao}`,
        payment_method_id: formData.payment_method_id,
        token: formData.token,
        installments: formData.installments ?? 1,
        // Usa o e-mail digitado pelo cliente como principal — só cai pro que
        // o Brick devolveu se por algum motivo o nosso não tiver passado
        // (não deveria acontecer, já validamos acima).
        payer: { ...formData.payer, email: emailCliente || formData.payer?.email },
        external_reference: externalReference,
        // Mesmo webhook que já usamos no Checkout Pro — cuida da entrega automática
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/mercadopago`,
      },
    });

    return NextResponse.json({
      id: resultado.id,
      status: resultado.status,
      point_of_interaction: resultado.point_of_interaction,
    });
  } catch (erro: any) {
    console.error("[pagamento] erro:", erro?.message, erro?.stack);
    return NextResponse.json({ erro: "Erro ao criar pagamento" }, { status: 500 });
  }
}
