// Fonte da verdade dos preços — NUNCA confiar em preço vindo do navegador.
// Precisa ficar sempre igual à tabela `planosPorFerramenta` em app/alugueis/page.tsx
// (essa aqui é a que manda; a do front é só pra exibir).
export const planosValidos: Record<string, number> = {
  "UnlockTool|6 horas": 5,
  "UnlockTool|12 horas": 9,
  "UnlockTool|48 horas": 18,
  "UnlockTool|120 horas": 30,

  "TSM Tool|3 horas": 5,
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
};
