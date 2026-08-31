export const planosAtivacaoValidos: Record<string, number> = {
  "UnlockTool|3 meses": 109.9,
  "UnlockTool|6 meses": 149.9,
  "UnlockTool|12 meses": 234.9,
  "TSM Tool|3 meses": 149.9,
  "TSM Tool|6 meses": 199.9,
  "TSM Tool|12 meses": 254.9,
  "Chimera Tool|1 ano (Basic)": 509.9,
  "Chimera Tool|1 ano (Professional)": 768.9,
  // "Chimera Tool|1 ano (Premium)": 964.9, // sem estoque no fornecedor por enquanto
  "Moto M Tool|Ativação 1 ano - (Novos Usuários)": 109.9,
  "Moto M Tool|Renovação 1 ano (Usuário Existente)": 109.9,
  // "Moto M Tool|Créditos (usuário existente)" NÃO fica aqui — esse plano é
  // liberado automático e usa a tabela lib/planos.ts em vez desta (ver
  // app/api/pagamento-ativacao/route.ts)
};
