export const mapaServicos: Record<
  string,
  { serviceId: number; creditos: number; fornecedor: string }
> = {
  "UnlockTool|6 horas": { serviceId: 571, creditos: 0.45, fornecedor: "gsmcheap" },
  "UnlockTool|12 horas": { serviceId: 1120, creditos: 0.78, fornecedor: "gsmcheap" },
  "TSM Tool|3 horas": { serviceId: 257, creditos: 0.48, fornecedor: "gsmcheap" },
  "TSM Tool|12 horas": { serviceId: 1271, creditos: 0.68, fornecedor: "gsmcheap" },
  "AMT Tool|2 horas": { serviceId: 256, creditos: 0.38, fornecedor: "gsmcheap" },
  "AMT Tool|12 horas": { serviceId: 1121, creditos: 0.78, fornecedor: "gsmcheap" },
  "Samsung Tool|12 horas": { serviceId: 1061, creditos: 2.5, fornecedor: "gsmcheap" },
  "Griffin-Unlocker|6 horas": { serviceId: 271, creditos: 1.2, fornecedor: "gsmcheap" },
  "Chimera Tool (Basic)|1 ano": { serviceId: 29, creditos: 96, fornecedor: "gsmcheap" },
  "Chimera Tool (Professional)|1 ano": { serviceId: 31, creditos: 144, fornecedor: "gsmcheap" },
  // "Chimera Tool (Premium)|1 ano": { serviceId: 30, creditos: 181, fornecedor: "gsmcheap" }, // indisponível no fornecedor (MAXQNT 0) — deixei comentado, ativar quando voltar estoque
};