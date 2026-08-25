import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

const VALOR_MINIMO_CENTAVOS = 100; // R$1,00

export async function POST(request: NextRequest) {
  try {
    // Depósito só pra cliente logado — é a conta dele que recebe o saldo.
    const supabaseAuth = await createClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "É preciso estar logado para adicionar saldo" }, { status: 401 });
    }

    const body = await request.json();
    const { valorCentavos, ...formData } = body;

    if (!Number.isInteger(valorCentavos) || valorCentavos < VALOR_MINIMO_CENTAVOS) {
      return NextResponse.json(
        { erro: `Valor mínimo de depósito: R$ ${(VALOR_MINIMO_CENTAVOS / 100).toFixed(2)}` },
        { status: 400 }
      );
    }

    const externalReference = randomUUID();

    const { error: erroSupabase } = await supabase.from("checkouts_carteira").insert({
      external_reference: externalReference,
      usuario_id: user.id,
      valor_centavos: valorCentavos,
    });

    if (erroSupabase) {
      console.error("[carteira/depositar] erro ao salvar checkout:", erroSupabase);
      return NextResponse.json({ erro: "Erro ao criar pagamento" }, { status: 500 });
    }

    const payment = new Payment(client);

    const resultado = await payment.create({
      body: {
        transaction_amount: valorCentavos / 100,
        description: "Depósito de saldo - Prime Legends GSM",
        payment_method_id: formData.payment_method_id,
        token: formData.token,
        installments: formData.installments ?? 1,
        payer: { ...formData.payer, email: user.email ?? formData.payer?.email },
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
    console.error("[carteira/depositar] erro:", erro?.message, erro?.stack);
    return NextResponse.json({ erro: "Erro ao criar pagamento" }, { status: 500 });
  }
}
