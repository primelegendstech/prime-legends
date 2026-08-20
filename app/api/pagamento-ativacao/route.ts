import { MercadoPagoConfig, Payment } from "mercadopago";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { planosAtivacaoValidos } from "@/lib/planosAtivacao";
import { planosValidos } from "@/lib/planos";
import { supabase } from "@/lib/supabase";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

// Único plano de Licenças que hoje é liberado automático (GSM Cheap) em vez
// de manual — os outros planos de ativação (inclusive o Moto M Ativação 1
// ano e Renovação) continuam manuais, sem mexer em nada.
const FERRAMENTA_CREDITO_AUTOMATICO = "Moto M Tool";
const DURACAO_CREDITO_AUTOMATICO = "Créditos (usuário existente)";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ferramenta, duracao, nome, username, senha, email, ...formData } = body;

    if (!ferramenta || !duracao || !nome || (!username && !email)) {
      return NextResponse.json({ erro: "Dados do plano ou do cliente ausentes" }, { status: 400 });
    }

    const ehCreditoAutomatico =
      ferramenta === FERRAMENTA_CREDITO_AUTOMATICO && duracao === DURACAO_CREDITO_AUTOMATICO;

    // O preço NUNCA vem do navegador — só da nossa lista confiável no servidor.
    // O plano automático usa a mesma tabela de preços dos aluguéis (lib/planos.ts),
    // porque ele é entregue pelo mesmo pipeline automático — os demais planos de
    // ativação usam planosAtivacaoValidos normalmente.
    const chave = `${ferramenta}|${duracao}`;
    const preco = ehCreditoAutomatico ? planosValidos[chave] : planosAtivacaoValidos[chave];

    if (!preco) {
      return NextResponse.json({ erro: "Plano inválido" }, { status: 400 });
    }

    if (ehCreditoAutomatico && !email) {
      return NextResponse.json({ erro: "E-mail cadastrado na ferramenta é obrigatório" }, { status: 400 });
    }

    const externalReference = randomUUID();

    if (ehCreditoAutomatico) {
      // Grava na MESMA tabela "checkouts" usada pelos aluguéis — assim o
      // webhook cai direto no pipeline automático já existente (processarEntrega
      // + GSM Cheap), sem precisar de nenhuma lógica nova. O e-mail salvo aqui
      // é o que a GSM Cheap vai usar pra saber em qual conta creditar.
      const { error: erroSupabase } = await supabase.from("checkouts").insert({
        external_reference: externalReference,
        ferramenta,
        duracao,
        preco,
        email_cliente: email,
      });

      if (erroSupabase) {
        console.error("[pagamento-ativacao] erro ao salvar checkout automático:", erroSupabase);
        return NextResponse.json({ erro: "Erro ao criar pagamento" }, { status: 500 });
      }
    } else {
      // Grava o que foi contratado + dados do cliente pra ativação manual
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
    }

    const payment = new Payment(client);

    const resultado = await payment.create({
      body: {
        transaction_amount: preco,
        description: `${ferramenta} - Ativação ${duracao}`,
        payment_method_id: formData.payment_method_id,
        token: formData.token,
        installments: formData.installments ?? 1,
        payer: ehCreditoAutomatico
          ? { ...formData.payer, email: email || formData.payer?.email }
          : formData.payer,
        external_reference: externalReference,
        // Mesmo webhook que já usamos nos outros fluxos. Pra Créditos do Moto M
        // Tool, esse webhook aciona a entrega automática (GSM Cheap); pros
        // demais planos de ativação, a liberação continua manual.
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/mercadopago`,
      },
    });

    return NextResponse.json({
      id: resultado.id,
      status: resultado.status,
      point_of_interaction: resultado.point_of_interaction,
      automatico: ehCreditoAutomatico,
    });
  } catch (erro: any) {
    console.error("[pagamento-ativacao] erro:", erro?.message, erro?.stack);
    return NextResponse.json({ erro: "Erro ao criar pagamento" }, { status: 500 });
  }
}
