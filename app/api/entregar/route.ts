// app/api/entregar/route.ts
//
// Estrutura preparada para múltiplos fornecedores.
// Pra adicionar um fornecedor novo:
//   1. Escreva a função entregarVia<Fornecedor>() no bloco de baixo
//   2. Adicione o "case" correspondente no switch
//   3. Cadastre os serviços dele na tabela `servicos` com fornecedor = '<nome>'
// Nenhuma outra parte do site precisa mudar.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ========================================================
// Tipos
// ========================================================

interface Servico {
  id: string;
  nome: string;
  plano: string;
  fornecedor: string;
  fornecedor_service_id: string | null;
  tipo_entrega: "automatica" | "manual";
  preco_centavos: number;
}

interface ResultadoEntrega {
  sucesso: boolean;
  automatica: boolean;
  credenciais?: { login: string; senha: string } | null;
  mensagem: string;
}

// ========================================================
// Adaptadores por fornecedor
// Cada um sabe traduzir o formato específico daquela API
// pro formato interno (ResultadoEntrega).
// ========================================================

async function entregarViaGsmCheap(
  servico: Servico,
  dadosPedido: Record<string, unknown>
): Promise<ResultadoEntrega> {
  const res = await fetch(`${process.env.GSMCHEAP_URL}/placebulkorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: process.env.GSMCHEAP_USERNAME,
      apiaccesskey: process.env.GSMCHEAP_API_KEY,
      serviceid: servico.fornecedor_service_id,
      imei: dadosPedido.imei,
      // demais campos exigidos pela GSM Cheap
    }),
  });

  const data = await res.json();

  // Lembrete: o erro da GSM Cheap vem DENTRO de SUCCESS, não em bloco ERROR separado
  const item = data?.SUCCESS?.["1"];
  if (!item || item.status === "error") {
    return {
      sucesso: false,
      automatica: true,
      mensagem: item?.message ?? "Erro desconhecido na GSM Cheap",
    };
  }

  return {
    sucesso: true,
    automatica: true,
    credenciais: { login: item.login, senha: item.password },
    mensagem: "Entregue automaticamente via GSM Cheap",
  };
}

async function entregarViaGsmAfrica(
  servico: Servico,
  _dadosPedido: Record<string, unknown>
): Promise<ResultadoEntrega> {
  // GSM Africa hoje é manual — só registra o pedido pra você processar
  return {
    sucesso: true,
    automatica: false,
    credenciais: null,
    mensagem: "Pedido registrado. Ativação manual via GSM Africa em até 2h.",
  };
}

// Exemplo de "molde" pronto pra quando você integrar o próximo fornecedor:
//
// async function entregarViaNovoFornecedor(servico: Servico, dadosPedido: Record<string, unknown>): Promise<ResultadoEntrega> {
//   const res = await fetch(`${process.env.NOVOFORNECEDOR_URL}/...`, { ... });
//   const data = await res.json();
//   // traduza a resposta específica desse fornecedor pro formato ResultadoEntrega
//   return { sucesso: true, automatica: true, credenciais: { login: "...", senha: "..." }, mensagem: "..." };
// }

// ========================================================
// Roteador central — decide qual adaptador chamar
// ========================================================

async function entregar(
  servico: Servico,
  dadosPedido: Record<string, unknown>
): Promise<ResultadoEntrega> {
  switch (servico.fornecedor) {
    case "gsmcheap":
      return entregarViaGsmCheap(servico, dadosPedido);
    case "gsmafrica":
      return entregarViaGsmAfrica(servico, dadosPedido);
    // case "novo_fornecedor":
    //   return entregarViaNovoFornecedor(servico, dadosPedido);
    default:
      return {
        sucesso: false,
        automatica: false,
        mensagem: `Fornecedor "${servico.fornecedor}" ainda não tem adaptador configurado.`,
      };
  }
}

// ========================================================
// Handler da rota
// ========================================================

export async function POST(req: NextRequest) {
  const { paymentId, referenceId, servicoId, dadosPedido } = await req.json();

  // Evita pedido duplicado (constraint UNIQUE em payment_id já garante isso no banco)
  const { data: existente } = await supabase
    .from("pedidos")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();

  if (existente) {
    return NextResponse.json({ ok: true, pedido: existente, jaProcessado: true });
  }

  const { data: servico, error: erroServico } = await supabase
    .from("servicos")
    .select("*")
    .eq("id", servicoId)
    .single();

  if (erroServico || !servico) {
    return NextResponse.json({ ok: false, mensagem: "Serviço não encontrado" }, { status: 404 });
  }

  const resultado = await entregar(servico as Servico, dadosPedido);

  const { data: pedidoSalvo } = await supabase
    .from("pedidos")
    .insert({
      payment_id: paymentId,
      reference_id: referenceId,
      servico_id: servicoId,
      fornecedor: servico.fornecedor,
      sucesso: resultado.sucesso,
      automatica: resultado.automatica,
      login: resultado.credenciais?.login ?? null,
      senha: resultado.credenciais?.senha ?? null,
      mensagem: resultado.mensagem,
    })
    .select()
    .single();

  return NextResponse.json({ ok: resultado.sucesso, pedido: pedidoSalvo, resultado });
}
