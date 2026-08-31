import { supabase } from "@/lib/supabase";
import { metodos } from "@/data/metodos";
import { enviarEmailAcessoMetodo } from "@/lib/enviar-email";
import { gerarLinkDownloadB2 } from "@/lib/b2";

function pareceEmailValido(email: string | null): email is string {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Mesma lógica de confirmação usada em Ativação/Aluguel/Carteira: confirma
// no Mercado Pago que o pagamento é real e aprovado antes de liberar
// qualquer coisa. Chamada tanto pela tela de checkout (polling) quanto pelo
// webhook — assim a entrega acontece mesmo se o cliente fechar a aba antes
// da confirmação aparecer na tela.
//
// Retorna { encontrado: false } quando o paymentId não é de um Método —
// nesse caso quem chamou (o webhook) segue pro próximo fluxo, sem erro.
export async function processarEntregaMetodo(paymentId: string) {
  if (!paymentId) return { encontrado: false };

  // 1. Já processado antes? Reaproveita o link salvo — evita gerar de novo
  // (o link expira em 72h, gerar de novo sem necessidade é desperdício) e
  // evita reenviar e-mail duplicado se o Mercado Pago reenviar o webhook.
  const { data: pedidoExistente } = await supabase
    .from("pedidos_metodos")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();

  if (pedidoExistente) {
    return {
      encontrado: true,
      sucesso: true,
      jaProcessado: true,
      nome: pedidoExistente.nome,
      descricao: undefined as string | undefined,
      video: undefined as string | null | undefined,
      linkDownload: pedidoExistente.link_download,
    };
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

  // 3. Busca o checkout de Método pelo external_reference — se não achar,
  // não é um Método, deixa quem chamou seguir pro próximo fluxo.
  const { data: checkout } = await supabase
    .from("checkouts_metodos")
    .select("*")
    .eq("external_reference", externalReference)
    .maybeSingle();

  if (!checkout) {
    return { encontrado: false };
  }

  if (Number(pagamento.transaction_amount) < Number(checkout.preco)) {
    console.error(
      "[processar-entrega-metodo] valor pago menor que o esperado:",
      pagamento.transaction_amount,
      checkout.preco
    );
    return { encontrado: true, sucesso: false, erro: "valor_nao_confere" };
  }

  const metodo = metodos.find((m) => m.id === checkout.metodo_id);
  if (!metodo) {
    return { encontrado: true, sucesso: false, erro: "item_nao_encontrado" };
  }

  // Gera o link de download assinado (temporário) — só existe DEPOIS do
  // pagamento confirmado. Se der erro (credenciais erradas, arquivo não
  // encontrado, etc), não quebra o fluxo — o pedido fica registrado do
  // mesmo jeito pra liberação manual via WhatsApp/e-mail.
  let linkDownload: string | null = null;
  if (metodo.arquivoPath) {
    try {
      linkDownload = await gerarLinkDownloadB2(metodo.arquivoPath);
    } catch (erroAssinatura) {
      console.error("[processar-entrega-metodo] erro ao gerar link assinado no B2:", erroAssinatura);
    }
  }

  const emailFinal = pareceEmailValido(checkout.email_cliente) ? checkout.email_cliente : null;

  // TRAVA DE SEGURANÇA (idempotência real): grava o payment_id ANTES de
  // qualquer coisa mais poder duplicar — se dois webhooks chegarem quase
  // juntos, o segundo esbarra na constraint UNIQUE(payment_id) da tabela.
  const { error: erroInsercao } = await supabase.from("pedidos_metodos").insert({
    payment_id: paymentId,
    metodo_id: metodo.id,
    nome: metodo.nome,
    preco: metodo.preco,
    email_cliente: emailFinal,
    link_download: linkDownload,
  });

  if (erroInsercao) {
    // Provavelmente é a UNIQUE constraint barrando uma segunda tentativa
    // simultânea — não é erro real, só significa que já foi processado.
    console.warn("[processar-entrega-metodo] insert bloqueado (provável duplicata):", erroInsercao.message);
    return { encontrado: true, sucesso: true, jaProcessado: true, nome: metodo.nome, linkDownload };
  }

  if (emailFinal) {
    await enviarEmailAcessoMetodo({
      destinatario: emailFinal,
      nome: metodo.nome,
      descricao: metodo.descricao,
      video: metodo.video,
      linkDownload,
    });
  }

  return {
    encontrado: true,
    sucesso: true,
    nome: metodo.nome,
    descricao: metodo.descricao,
    video: metodo.video || null,
    linkDownload,
  };
}
