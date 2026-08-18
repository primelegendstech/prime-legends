// lib/avaliar-resultado.ts
//
// A GSM Cheap (e fornecedores parecidos) pode responder de 3 formas quando
// consultamos um pedido: já concluído (tem o código pronto), ainda
// processando (pedido existe, mas o código não saiu ainda) ou erro real.
// Antes, o código tratava qualquer resposta como final — isso fazia pedidos
// "processando" serem exibidos como se tivessem falhado ou como se
// estivessem prontos (vazios). Essa função centraliza essa decisão.

export type EstadoPedido = "concluido" | "processando" | "erro";

export function avaliarResultadoFornecedor(dados: any): EstadoPedido {
  // Erro de transporte (timeout, HTTP com falha, etc — já normalizado pelo adapter)
  if (dados?.erro) return "erro";
  if (!dados) return "processando";

  // Formato mais comum da GSM Cheap: { SUCCESS: [{ CODE: "...", STATUS: n }] }
  const item = dados?.SUCCESS?.[0] ?? dados?.SUCCESS?.["1"] ?? null;

  if (item) {
    const code = item?.CODE;
    if (typeof code === "string" && code.trim().length > 0) {
      return "concluido";
    }
    // Pedido existe do lado da GSM Cheap mas o código ainda não foi gerado —
    // isso é normal levar alguns segundos, não é uma falha.
    const textoStatus = String(item?.STATUS ?? item?.status ?? "").toLowerCase();
    if (textoStatus.includes("error") || textoStatus.includes("fail") || textoStatus.includes("cancel")) {
      return "erro";
    }
    return "processando";
  }

  // Resposta com ERROR explícito da API (sem SUCCESS)
  if (dados?.ERROR) return "erro";

  // Formato desconhecido / vazio — trata como processando, nunca como erro
  // definitivo, pra nunca desistir de um pedido que já foi aceito.
  return "processando";
}
