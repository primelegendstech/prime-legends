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

// 6s — no plano gratuito da Vercel a função inteira (Mercado Pago + GSM Cheap
// criar + GSM Cheap consultar) tem só 10s de orçamento total. Com 15s aqui,
// uma única chamada já estourava o limite sozinha, e a Vercel matava a função
// no meio do caminho — mesmo quando o pedido já tinha sido criado com sucesso
// do lado da GSM Cheap. 6s deixa espaço pra todas as outras etapas rodarem.
const TIMEOUT_MS = 6000;

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
  async criarPedido(serviceId: string) {
    const pedido = await chamarGsmCheap("placebulkorder", { "1": { ID: Number(serviceId), QNT: 1 } });

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
