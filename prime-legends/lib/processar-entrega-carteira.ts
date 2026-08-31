import { supabase } from "@/lib/supabase";

// Mesmo padrão do processar-entrega-ativacao.ts: confirma no Mercado Pago
// que o pagamento foi aprovado e credita o saldo do cliente via RPC atômica
// (carteira_creditar), sem depender do cliente estar com o site aberto.
//
// Retorna { encontrado: false } quando o paymentId não é de um depósito de
// carteira — nesse caso o webhook segue tentando os outros fluxos (ativação,
// aluguel) normalmente.
export async function processarEntregaCarteira(paymentId: string) {
  if (!paymentId) return { encontrado: false };

  // 1. Já processamos esse pagamento antes? Evita creditar em dobro se o
  // Mercado Pago reenviar o webhook (ele faz isso às vezes).
  const { data: checkoutExistente } = await supabase
    .from("checkouts_carteira")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();

  if (checkoutExistente) {
    return { encontrado: true, jaProcessado: true };
  }

  // 2. Confirma no Mercado Pago que esse pagamento é real e foi aprovado
  const pagamentoResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
  });
  const pagamento = await pagamentoResp.json();

  if (pagamento.status !== "approved") {
    return { encontrado: false };
  }

  const externalReference = pagamento.external_reference;
  if (!externalReference) return { encontrado: false };

  // 3. Busca o checkout de carteira pelo external_reference — se não achar,
  // não é um depósito de carteira, deixa o webhook seguir pros outros fluxos.
  const { data: checkout } = await supabase
    .from("checkouts_carteira")
    .select("*")
    .eq("external_reference", externalReference)
    .maybeSingle();

  if (!checkout) {
    return { encontrado: false };
  }

  if (Number(pagamento.transaction_amount) * 100 < Number(checkout.valor_centavos)) {
    console.error(
      "[entrega-carteira] valor pago menor que o esperado:",
      pagamento.transaction_amount,
      checkout.valor_centavos
    );
    return { encontrado: true, erro: "valor_nao_confere" };
  }

  // 4. TRAVA DE SEGURANÇA (idempotência): grava o payment_id ANTES de creditar.
  // Se o webhook chegar duplicado ao mesmo tempo, a segunda chamada não vai
  // encontrar checkoutExistente ainda — a constraint UNIQUE em payment_id
  // garante que só uma dessas chamadas realmente credita o saldo.
  const { error: erroReserva } = await supabase
    .from("checkouts_carteira")
    .update({ payment_id: paymentId })
    .eq("external_reference", externalReference)
    .is("payment_id", null);

  if (erroReserva) {
    console.error("[entrega-carteira] erro ao reservar payment_id:", erroReserva);
    return { encontrado: true, erro: "falha_ao_reservar" };
  }

  // 5. Credita o saldo via função atômica no Postgres
  const { error: erroCredito } = await supabase.rpc("carteira_creditar", {
    p_usuario_id: checkout.usuario_id,
    p_valor_centavos: checkout.valor_centavos,
    p_payment_id: paymentId,
    p_descricao: "Depósito via Pix",
  });

  if (erroCredito) {
    console.error("[entrega-carteira] erro ao creditar saldo:", erroCredito);
    return { encontrado: true, erro: "falha_ao_creditar" };
  }

  return { encontrado: true, creditado: true };
}
