// lib/fornecedores/tipos.ts
//
// Todo fornecedor novo precisa implementar essas duas funções.
// Isso garante que processar-entrega.ts nunca precisa saber
// os detalhes de como cada fornecedor funciona por dentro.

export interface ResultadoCriacao {
  referenceId?: string;
  mensagemErro?: string;
  respostaCompleta?: any;
}

export interface FornecedorAdapter {
  // Faz o pedido no fornecedor. Se der certo, retorna referenceId.
  // Se der erro, retorna mensagemErro (e opcionalmente a resposta crua pra log).
  // dadoExtra: usado só pelos serviços que precisam identificar a conta do
  // cliente (ex: e-mail cadastrado, pra creditar a conta certa) — a maioria
  // dos serviços não usa isso.
  criarPedido(serviceId: string, dadoExtra?: string): Promise<ResultadoCriacao>;

  // Consulta o status/dados de um pedido já criado, usando o referenceId.
  consultarPedido(referenceId: string): Promise<any>;
}
