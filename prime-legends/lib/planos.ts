// Fonte da verdade dos preços — NUNCA confiar em preço vindo do navegador.
// Precisa ficar sempre igual à tabela `planosPorFerramenta` em app/alugueis/page.tsx
// (essa aqui é a que manda; a do front é só pra exibir).
export const planosValidos: Record<string, number> = {
  "UnlockTool|6 horas": 5,
  "UnlockTool|12 horas": 9,
  "UnlockTool|48 horas": 18,
  "UnlockTool|120 horas": 30,

  "TSM Tool|3 horas": 5.5,
  "TSM Tool|12 horas": 9,
  "TSM Tool|48 horas": 18,
  "TSM Tool|168 horas": 35,

  "AMT Tool|2 horas": 5,
  "AMT Tool|3 horas": 6,
  "AMT Tool|5 horas": 8,
  "AMT Tool|12 horas": 10,

  "Samsung Tool|12 horas": 15,
  "Samsung Tool|24 horas": 20,
  "Samsung Tool|48 horas": 30,
  "Samsung Tool|72 horas": 35,

  "Griffin-Unlocker|6 horas": 9,
  "Griffin-Unlocker|12 horas": 14,
  "Griffin-Unlocker|24 horas": 18,

  // Plano de Licenças • Créditos que é liberado automático via GSM Cheap
  // (rota /api/pagamento-ativacao usa essa tabela só pra esse plano específico —
  // os outros planos de ativação usam lib/planosAtivacao.ts, que é manual)
  "Moto M Tool|Créditos (usuário existente)": 7.48,

  // 👇 Aluguéis novos adicionados em 29/08/2026 (ver data/ferramentas.ts).
  // Faltou colocar essa mesma lista aqui na primeira vez — é por isso que
  // deu "Plano inválido" ao gerar o PIX. Preços têm que ficar IDÊNTICOS
  // aos de data/ferramentas.ts, senão o pagamento é recusado como inválido.
  "Alien Tool|6 horas": 15,
  "TFM Tool|6 horas": 5.5,
  "MDM Fix Tool|6 horas": 8.7,
  "DFT Pro|48 horas": 12,
  "AndroidWinTool (AWT)|48 horas": 12,
  "AnonySHU Tool|12 horas": 16.5,
  "KG Killer Tool|4 horas": 7.2,
  "MST (MobileSea Service Tool)|6 horas": 5,
  "CF-Tools|12 horas": 5.5,
  "Hydra Tool (Sem Dongle)|24 horas": 5.9,
  "Pandora Tool|48 horas": 47.5,
};
