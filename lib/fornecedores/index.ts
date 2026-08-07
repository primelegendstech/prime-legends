// lib/fornecedores/index.ts
//
// Registro central: aqui você soma um fornecedor novo quando ele estiver pronto.
// Cada fornecedor é um arquivo próprio nessa pasta, seguindo o tipo FornecedorAdapter.

import { gsmCheapAdapter } from "./gsmcheap";
import type { FornecedorAdapter } from "./tipos";

export const fornecedores: Record<string, FornecedorAdapter> = {
  gsmcheap: gsmCheapAdapter,

  // Quando integrar um fornecedor novo com API automática, é só:
  // 1. Criar lib/fornecedores/novo-fornecedor.ts com criarPedido() e consultarPedido()
  // 2. Importar aqui e adicionar a linha abaixo:
  // novofornecedor: novoFornecedorAdapter,
};

export type { FornecedorAdapter, ResultadoCriacao } from "./tipos";
