// lib/fornecedores/gsmcheap.ts
//
// Mesma lógica que já existia dentro de processar-entrega.ts,
// só organizada como um "adaptador" com duas funções padronizadas:
// criarPedido() e consultarPedido(). Nenhum comportamento mudou.

import type { FornecedorAdapter } from "./tipos";

async function chamarGsmCheap(action: string, parametros?: any) {
  const url = `${process.env.GSMCHEAP_URL}/public/api/index.php`;
  const body = new URLSearchParams({
    username: process.env.GSMCHEAP_USERNAME!,
    apiaccesskey: process.env.GSMCHEAP_API_KEY!,
    action,
    requestformat: "JSON",
    ...(parametros ? { parameters: Buffer.from(JSON.stringify(parametros)).toString("base64") } : {}),
  });
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = await resposta.json();
  console.log(`[GSM Cheap] action=${action} resposta:`, JSON.stringify(json));
  return json;
}

export const gsmCheapAdapter: FornecedorAdapter = {
  async criarPedido(serviceId: string) {
    const pedido = await chamarGsmCheap("placebulkorder", { "1": { ID: serviceId, QNT: 1 } });
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
    return resultado?.["1"] ?? resultado;
  },
};
