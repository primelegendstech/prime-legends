import { supabase } from "@/lib/supabase";
import { enviarEmailNotificacaoAtivacao } from "@/lib/enviar-email";

// Mesma lógica de confirmação do fluxo de Aluguel, mas pra Ativação:
// confirma no Mercado Pago que o pagamento foi aprovado e AVISA VOCÊ por e-mail,
// sem depender do cliente clicar em nada no WhatsApp.
//
// Retorna { encontrado: false } quando o paymentId não é de uma ativação —
// nesse caso o webhook segue o fluxo normal de aluguel, sem erro.
export async function processarEntregaAtivacao(paymentId: string) {
  if (!paymentId) return { encontrado: false };

  // 1. Já processamos esse pagamento antes? Evita mandar e-mail duplicado
  // se o Mercado Pago reenviar o webhook (ele faz isso às vezes).
  const { data: checkoutExistente } = await supabase
    .from("checkouts_ativacao")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();

  if (checkoutExistente) {
    // Já notificado antes — não faz nada de novo.
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

  // 3. Busca o checkout de ativação pelo external_reference (é aqui que sabemos
  // se esse pagamento é de uma ativação, ou se é de outro fluxo — aluguel, etc.)
  const { data: checkout } = await supabase
    .from("checkouts_ativacao")
    .select("*")
    .eq("external_reference", externalReference)
    .maybeSingle();

  if (!checkout) {
    // Não é uma ativação — deixa o webhook seguir pro fluxo de aluguel normalmente.
    return { encontrado: false };
  }

  if (Number(pagamento.transaction_amount) < Number(checkout.preco)) {
    console.error(
      "[entrega-ativacao] valor pago menor que o esperado:",
      pagamento.transaction_amount,
      checkout.preco
    );
    return { encontrado: true, erro: "valor_nao_confere" };
  }

  // 4. TRAVA DE SEGURANÇA (idempotência): grava o payment_id nessa linha ANTES de
  // enviar o e-mail. Se o webhook chegar duplicado ao mesmo tempo, a segunda
  // chamada não vai encontrar checkoutExistente ainda — então usamos uma
  // constraint UNIQUE em payment_id pra garantir que só um envio realmente aconteça.
  const { error: erroReserva } = await supabase
    .from("checkouts_ativacao")
    .update({ payment_id: paymentId })
    .eq("external_reference", externalReference)
    .is("payment_id", null);

  if (erroReserva) {
    console.error("[entrega-ativacao] erro ao reservar payment_id:", erroReserva);
    return { encontrado: true, erro: "falha_ao_reservar" };
  }

  // 5. Avisa você por e-mail — com todos os dados que o cliente preencheu no modal
  await enviarEmailNotificacaoAtivacao({
    ferramenta: checkout.ferramenta,
    duracao: checkout.duracao,
    preco: checkout.preco,
    nome: checkout.nome,
    username: checkout.username,
    senha: checkout.senha ?? undefined,
    email: checkout.email,
  });

  return { encontrado: true, notificado: true };
}
