import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { metodos } from "@/data/metodos";
import { supabase } from "@/lib/supabase";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metodoId, emailCliente, ...formData } = body;

    if (!metodoId) {
      return NextResponse.json({ erro: "Item inválido" }, { status: 400 });
    }

    const emailValido =
      typeof emailCliente === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCliente);

    if (!emailValido) {
      return NextResponse.json({ erro: "E-mail inválido" }, { status: 400 });
    }

    // O preço e o nome NUNCA vêm do navegador — só do catálogo confiável no servidor
    const metodo = metodos.find((m) => m.id === metodoId);
    if (!metodo) {
      return NextResponse.json({ erro: "Item não encontrado" }, { status: 400 });
    }

    const externalReference = randomUUID();

    const { error: erroSupabase } = await supabase.from("checkouts_metodos").insert({
      external_reference: externalReference,
      metodo_id: metodo.id,
      nome: metodo.nome,
      preco: metodo.preco,
      email_cliente: emailCliente,
    });

    if (erroSupabase) {
      console.error("[pagamento-metodo] erro ao salvar checkout:", erroSupabase);
      return NextResponse.json({ erro: "Erro ao criar pagamento" }, { status: 500 });
    }

    const payment = new Payment(client);

    const resultado = await payment.create({
      body: {
        transaction_amount: metodo.preco,
        description: metodo.nome,
        payment_method_id: formData.payment_method_id,
        token: formData.token,
        installments: formData.installments ?? 1,
        payer: { ...formData.payer, email: emailCliente || formData.payer?.email },
        external_reference: externalReference,
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/mercadopago`,
      },
    });

    return NextResponse.json({
      id: resultado.id,
      status: resultado.status,
      point_of_interaction: resultado.point_of_interaction,
    });
  } catch (erro: any) {
    console.error("[pagamento-metodo] erro:", erro?.message, erro?.stack);
    return NextResponse.json({ erro: "Erro ao criar pagamento" }, { status: 500 });
  }
}
