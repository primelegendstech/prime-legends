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
