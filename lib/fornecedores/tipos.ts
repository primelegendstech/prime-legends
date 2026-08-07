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
  criarPedido(serviceId: string): Promise<ResultadoCriacao>;

  // Consulta o status/dados de um pedido já criado, usando o referenceId.
  consultarPedido(referenceId: string): Promise<any>;
}
