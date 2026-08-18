import { Resend } from "resend";

// IMPORTANTE: a conexão com o Resend só é criada dentro da função,
// nunca fora dela — se criarmos no topo do arquivo, o Next.js tenta
// carregar isso durante o processo de BUILD da Vercel, antes de ter
// acesso às variáveis de ambiente, e quebra o build inteiro.

const REMETENTE = process.env.RESEND_FROM_EMAIL || "Prime Legends GSM <onboarding@resend.dev>";

export async function enviarEmailAcesso(params: {
  destinatario: string;
  servico: string;
  linkConsulta: string;
  manual: boolean;
}) {
  const { destinatario, servico, linkConsulta, manual } = params;

  if (!destinatario) {
    console.log("[email] sem e-mail do cliente, pulando envio");
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY não configurada, pulando envio");
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const assunto = manual
    ? `Pagamento confirmado - ${servico} (acesso em liberação)`
    : `Seu acesso está pronto - ${servico}`;

  const corpoHtml = manual
    ? `
      <p>Olá!</p>
      <p>Seu pagamento de <strong>${servico}</strong> foi confirmado.</p>
      <p>Seu acesso está sendo liberado manualmente pela nossa equipe — em breve entraremos em contato.</p>
      <p>Você também pode consultar o status do seu pedido a qualquer momento pelo link abaixo:</p>
      <p><a href="${linkConsulta}">${linkConsulta}</a></p>
      <p>Prime Legends GSM</p>
    `
    : `
      <p>Olá!</p>
      <p>Seu pagamento de <strong>${servico}</strong> foi confirmado e seu acesso já está liberado.</p>
      <p>Guarde este link — ele mostra seu login e senha sempre que você precisar consultar novamente, dentro do prazo contratado:</p>
      <p><a href="${linkConsulta}">${linkConsulta}</a></p>
      <p>Prime Legends GSM</p>
    `;

  try {
    await resend.emails.send({
      from: REMETENTE,
      to: destinatario,
      subject: assunto,
      html: corpoHtml,
    });
    console.log(`[email] enviado com sucesso para ${destinatario}`);
  } catch (erro) {
    console.error("[email] falha ao enviar:", erro);
  }
}

// Avisa VOCÊ (o admin) por e-mail quando um pedido de ALUGUEL precisa de
// atenção manual (falhou de verdade na GSM Cheap, ou ficou processando por
// tempo demais). Assim você fica sabendo ANTES do cliente reclamar, em vez
// de descobrir só quando ele manda mensagem irritado.
export async function enviarEmailAlertaPedido(params: {
  motivo: string;
  ferramenta: string;
  duracao: string;
  codigo: string;
  paymentId: string;
  detalhes?: string;
}) {
  const { motivo, ferramenta, duracao, codigo, paymentId, detalhes } = params;

  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY não configurada, pulando alerta de pedido");
    return;
  }

  const destinatario = process.env.ADMIN_NOTIFICATION_EMAIL || "primelegendsx@gmail.com";
  const resend = new Resend(process.env.RESEND_API_KEY);

  const corpoHtml = `
    <p><strong>⚠️ Pedido de aluguel precisa de atenção</strong></p>
    <table cellpadding="6" style="border-collapse: collapse;">
      <tr><td><strong>Motivo:</strong></td><td>${motivo}</td></tr>
      <tr><td><strong>Ferramenta:</strong></td><td>${ferramenta}</td></tr>
      <tr><td><strong>Plano:</strong></td><td>${duracao}</td></tr>
      <tr><td><strong>Código do pedido:</strong></td><td>${codigo}</td></tr>
      <tr><td><strong>Payment ID:</strong></td><td>${paymentId}</td></tr>
      ${detalhes ? `<tr><td><strong>Detalhes:</strong></td><td>${detalhes}</td></tr>` : ""}
    </table>
    <p>Confira o painel da GSM Cheap e finalize manualmente se necessário.</p>
  `;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Prime Legends GSM <onboarding@resend.dev>",
      to: destinatario,
      subject: `⚠️ Pedido precisa de atenção — ${ferramenta} ${duracao}`,
      html: corpoHtml,
    });
    console.log(`[email] alerta de pedido enviado para ${destinatario}`);
  } catch (erro) {
    console.error("[email] falha ao enviar alerta de pedido:", erro);
  }
}

// Avisa VOCÊ (o admin) por e-mail assim que uma ativação é paga — não depende
// do cliente clicar em nada. O destinatário é o seu e-mail, configurado em
// ADMIN_NOTIFICATION_EMAIL na Vercel (cai pro contato do site se não configurar).
export async function enviarEmailNotificacaoAtivacao(params: {
  ferramenta: string;
  duracao: string;
  preco: number;
  nome: string;
  username: string;
  email: string;
}) {
  const { ferramenta, duracao, preco, nome, username, email } = params;

  if (!process.env.RESEND_API_KEY) {
    console.error("[email] RESEND_API_KEY não configurada, pulando notificação de ativação");
    return;
  }

  const destinatario = process.env.ADMIN_NOTIFICATION_EMAIL || "primelegendsx@gmail.com";
  const resend = new Resend(process.env.RESEND_API_KEY);

  const corpoHtml = `
    <p><strong>💰 Nova ativação paga — precisa liberar</strong></p>
    <table cellpadding="6" style="border-collapse: collapse;">
      <tr><td><strong>Ferramenta:</strong></td><td>${ferramenta}</td></tr>
      <tr><td><strong>Plano:</strong></td><td>${duracao}</td></tr>
      <tr><td><strong>Valor:</strong></td><td>R$ ${preco.toFixed(2).replace(".", ",")}</td></tr>
      <tr><td><strong>Nome do cliente:</strong></td><td>${nome}</td></tr>
      <tr><td><strong>Username na ferramenta:</strong></td><td>${username}</td></tr>
      <tr><td><strong>E-mail do cliente:</strong></td><td>${email}</td></tr>
    </table>
    <p>Pagamento confirmado pelo Mercado Pago — pode ativar direto na ferramenta.</p>
  `;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Prime Legends GSM <onboarding@resend.dev>",
      to: destinatario,
      subject: `🔔 Ativação paga: ${ferramenta} ${duracao} — ${nome}`,
      html: corpoHtml,
    });
    console.log(`[email] notificação de ativação enviada para ${destinatario}`);
  } catch (erro) {
    console.error("[email] falha ao notificar ativação:", erro);
  }
}
