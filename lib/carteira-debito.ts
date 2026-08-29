import { supabase } from "@/lib/supabase";

// Débito atômico — chama a função do banco (carteira_debitar) que só
// desconta se o saldo for suficiente, numa única operação. Nunca deixa
// saldo negativo, mesmo com dois cliques ou duas abas ao mesmo tempo.
export async function debitarCarteira(usuarioId: string, valorCentavos: number, descricao: string) {
  const { data, error } = await supabase.rpc("carteira_debitar", {
    p_usuario_id: usuarioId,
    p_valor_centavos: valorCentavos,
    p_descricao: descricao,
  });

  if (error) {
    console.error("[carteira] erro ao debitar:", error);
    return { sucesso: false as const };
  }

  const linha = Array.isArray(data) ? data[0] : data;
  if (!linha?.sucesso) {
    return { sucesso: false as const };
  }

  return { sucesso: true as const, novoSaldoCentavos: linha.novo_saldo_centavos as number };
}

// Estorno — só usado quando o débito já aconteceu mas a entrega falhou
// depois (ex: fornecedor fora do ar). Devolve o valor automaticamente.
// Se isso falhar, loga BEM alto: é o único caso em que dinheiro do cliente
// pode ficar "preso" sem ele saber, então precisa de atenção manual.
export async function estornarCarteira(usuarioId: string, valorCentavos: number, descricao: string) {
  const { error } = await supabase.rpc("carteira_estornar", {
    p_usuario_id: usuarioId,
    p_valor_centavos: valorCentavos,
    p_descricao: descricao,
  });

  if (error) {
    console.error(
      "[carteira] ⚠️ FALHA AO ESTORNAR — ação manual necessária:",
      error,
      { usuarioId, valorCentavos, descricao }
    );
    return { sucesso: false as const, erro: error.message as string };
  }

  return { sucesso: true as const };
}
