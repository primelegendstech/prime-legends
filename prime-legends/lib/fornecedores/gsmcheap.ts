// lib/fornecedores/gsmcheap.ts
//
// Mesma lógica que já existia dentro de processar-entrega.ts,
// organizada como um "adaptador" com duas funções padronizadas:
// criarPedido() e consultarPedido().
//
// AJUSTE: chamarGsmCheap agora tem timeout (AbortController) e nunca
// lança exceção sem controle — sempre devolve um objeto previsível,
// mesmo quando a chamada falha ou demora demais. Isso evita que um
// pedido fique travado em "reservando" pra sempre no banco.

import type { FornecedorAdapter } from "./tipos";

// 20s — a GSM Cheap pode demorar alguns segundos pra responder em momentos de
// mais carga. Como o plano Hobby da Vercel (com Fluid Compute, ativado por
// padrão) permite até 300s por função, não precisamos economizar tempo aqui —
// é melhor esperar um pouco mais do que desistir cedo demais e mostrar um
// erro pro cliente quando o pedido teria dado certo com mais alguns segundos.
const TIMEOUT_MS = 20000;

async function chamarGsmCheap(action: string, parametros?: any) {
  const url = `${process.env.GSMCHEAP_URL}/public/api/index.php`;
  const body = new URLSearchParams({
    username: process.env.GSMCHEAP_USERNAME!,
    apiaccesskey: process.env.GSMCHEAP_API_KEY!,
    action,
    requestformat: "JSON",
    ...(parametros ? { parameters: Buffer.from(JSON.stringify(parametros)).toString("base64") } : {}),
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });

    if (!resposta.ok) {
      console.error(`[GSM Cheap] action=${action} HTTP ${resposta.status}`);
      return { SUCCESS: null, ERROR: `HTTP ${resposta.status}` };
    }

    const json = await resposta.json();
    console.log(`[GSM Cheap] action=${action} resposta:`, JSON.stringify(json));
    return json;
  } catch (erro: any) {
    const motivo = erro?.name === "AbortError" ? "timeout" : erro?.message ?? "erro desconhecido";
    console.error(`[GSM Cheap] action=${action} falhou:`, motivo);
    // NUNCA relança a exceção — devolve um objeto de erro previsível,
    // pra quem chamou sempre conseguir tratar e finalizar o pedido.
    return { SUCCESS: null, ERROR: motivo };
  } finally {
    clearTimeout(timeoutId);
  }
}

export const gsmCheapAdapter: FornecedorAdapter = {
  async criarPedido(serviceId: string, dadoExtra?: string) {
    // Alguns serviços (ex: recarga de crédito em conta existente) precisam
    // saber a conta do cliente. Painéis nesse estilo (DHRU) usam o campo
    // "IMEI" como campo genérico pra isso, seja IMEI de verdade, HWID ou
    // e-mail — depende do que o serviço específico pede.
    const itemPedido: any = { ID: Number(serviceId), QNT: 1 };
    if (dadoExtra) itemPedido.IMEI = dadoExtra;

    const pedido = await chamarGsmCheap("placebulkorder", { "1": itemPedido });

    if (pedido?.ERROR) {
      return {
        mensagemErro: `Falha de comunicação com a GSM Cheap: ${pedido.ERROR}`,
        respostaCompleta: pedido,
      };
    }

    const item = pedido?.SUCCESS?.["1"];
    const deuErro = item?.status === "error";

    if (deuErro || !item?.referenceid) {
      return {
        mensagemErro: item?.message ?? "Falha ao gerar acesso na GSM Cheap",
        respostaCompleta: pedido,
      };
    }

    return { referenceId: item.referenceid };
  },

  async consultarPedido(referenceId: string) {
    const resultado = await chamarGsmCheap("getimeiorderbulk", { "1": { ID: referenceId } });
    if (resultado?.ERROR) {
      return { erro: resultado.ERROR };
    }
    return resultado?.["1"] ?? resultado;
  },
};
