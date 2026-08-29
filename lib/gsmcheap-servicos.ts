export const mapaServicos: Record<
  string,
  { serviceId: number; creditos: number; fornecedor: string; precisaDadoExtra?: boolean }
> = {
  "UnlockTool|6 horas": { serviceId: 571, creditos: 0.45, fornecedor: "gsmcheap" },
  "UnlockTool|12 horas": { serviceId: 1120, creditos: 0.78, fornecedor: "gsmcheap" },
  "TSM Tool|3 horas": { serviceId: 257, creditos: 0.48, fornecedor: "gsmcheap" },
  "TSM Tool|12 horas": { serviceId: 1271, creditos: 0.68, fornecedor: "gsmcheap" },
  "AMT Tool|2 horas": { serviceId: 256, creditos: 0.38, fornecedor: "gsmcheap" },
  "AMT Tool|3 horas": { serviceId: 256, creditos: 0.2, fornecedor: "gsmcheap" },
  "AMT Tool|12 horas": { serviceId: 1121, creditos: 0.78, fornecedor: "gsmcheap" },
  "Samsung Tool|12 horas": { serviceId: 1061, creditos: 2.5, fornecedor: "gsmcheap" },
  "Griffin-Unlocker|6 horas": { serviceId: 271, creditos: 1.2, fornecedor: "gsmcheap" },
  "Chimera Tool (Basic)|1 ano": { serviceId: 29, creditos: 96, fornecedor: "gsmcheap" },
  "Chimera Tool (Professional)|1 ano": { serviceId: 31, creditos: 144, fornecedor: "gsmcheap" },
  // "Chimera Tool (Premium)|1 ano": { serviceId: 30, creditos: 181, fornecedor: "gsmcheap" }, // indisponível no fornecedor (MAXQNT 0) — deixei comentado, ativar quando voltar estoque
  // Chimera Tool (Basic)|1 ano" e "Chimera Tool (Professional)|1 ano" acima
  // são só referência de custo — a página de Licenças • Créditos ainda é
  // liberada manualmente (não chama a API automaticamente).
  "Moto M Tool|Ativação 1 ano - (Novos Usuários)": { serviceId: 1288, creditos: 15.85, fornecedor: "gsmcheap" },
  "Moto M Tool|Renovação 1 ano (Usuário Existente)": { serviceId: 1289, creditos: 15.85, fornecedor: "gsmcheap" },
  // precisaDadoExtra: true -> manda o e-mail do cliente pra GSM Cheap saber
  // em qual conta creditar (é o único serviço automatizado que precisa disso hoje).
  "Moto M Tool|Créditos (usuário existente)": {
    serviceId: 1290,
    creditos: 1.05,
    fornecedor: "gsmcheap",
    precisaDadoExtra: true,
  },
  "Alien Tool|3 meses": { serviceId: 1322, creditos: 20.59, fornecedor: "gsmcheap" },
  "Alien Tool|6 meses": { serviceId: 1323, creditos: 29.1, fornecedor: "gsmcheap" },
  "Alien Tool|12 meses": { serviceId: 1321, creditos: 39.1, fornecedor: "gsmcheap" },

  // 👇 Aluguéis novos (data/ferramentas.ts) — adicionados em 29/08/2026.
  // "Alien Tool|6 horas" (o de ALUGUEL, diferente do "Alien Tool" de ativação
  // acima) ainda NÃO está aqui de propósito: o usuário não passou o service ID
  // dele, então cai como entrega manual até ele mandar o ID.
  "TFM Tool|6 horas": { serviceId: 270, creditos: 0.3, fornecedor: "gsmcheap" },
  "MDM Fix Tool|6 horas": { serviceId: 264, creditos: 0.9, fornecedor: "gsmcheap" },
  "DFT Pro|48 horas": { serviceId: 255, creditos: 1.55, fornecedor: "gsmcheap" },
  "AndroidWinTool (AWT)|48 horas": { serviceId: 470, creditos: 1.1, fornecedor: "gsmcheap" },
  "AnonySHU Tool|12 horas": { serviceId: 370, creditos: 2, fornecedor: "gsmcheap" },
  "KG Killer Tool|4 horas": { serviceId: 427, creditos: 0.5, fornecedor: "gsmcheap" },
  "MST (MobileSea Service Tool)|6 horas": { serviceId: 553, creditos: 0.2, fornecedor: "gsmcheap" },
  "CF-Tools|12 horas": { serviceId: 262, creditos: 0.39, fornecedor: "gsmcheap" },
  // Confirmado com o usuário: o service ID 265 da GSM Cheap é o plano de
  // 24 horas (ele tinha rotulado como "3 horas" por engano) — rótulo corrigido.
  "Hydra Tool (Sem Dongle)|24 horas": { serviceId: 265, creditos: 0.5, fornecedor: "gsmcheap" },
  // Pandora Tool NÃO entra aqui — é manual por decisão do usuário (ver obs no catálogo).
};