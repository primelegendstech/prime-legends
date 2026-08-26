import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { pagarAluguelComSaldo, pagarAtivacaoComSaldo, pagarMetodoComSaldo } from "@/lib/processar-pagamento-saldo";

// Rota única pra pagar QUALQUER serviço do site usando o saldo da Carteira.
// Só funciona pra quem está logado — é assim que garantimos de quem estamos
// debitando. Todo o resto da segurança (preço confiável, débito atômico,
// estorno automático em caso de falha) já está dentro de cada função em
// lib/processar-pagamento-saldo.ts.
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Você precisa estar logado pra pagar com saldo" }, { status: 401 });
    }

    const body = await request.json();
    const { tipo } = body ?? {};

    if (tipo === "aluguel") {
      const { ferramenta, duracao } = body;
      const resultado = await pagarAluguelComSaldo({
        usuarioId: user.id,
        ferramenta,
        duracao,
        emailCliente: user.email ?? null,
      });
      return NextResponse.json(resultado.body, { status: resultado.status });
    }

    if (tipo === "ativacao") {
      const { ferramenta, duracao, nome, username, senha, email } = body;
      const resultado = await pagarAtivacaoComSaldo({
        usuarioId: user.id,
        ferramenta,
        duracao,
        nome,
        username,
        senha,
        email: email || user.email || null,
      });
      return NextResponse.json(resultado.body, { status: resultado.status });
    }

    if (tipo === "metodo") {
      const { metodoId, emailCliente } = body;
      const resultado = await pagarMetodoComSaldo({
        usuarioId: user.id,
        metodoId,
        emailCliente: emailCliente || user.email || null,
      });
      return NextResponse.json(resultado.body, { status: resultado.status });
    }

    return NextResponse.json({ erro: "Tipo de pagamento inválido" }, { status: 400 });
  } catch (erro: any) {
    console.error("[carteira/pagar] erro:", erro?.message, erro?.stack);
    return NextResponse.json({ erro: "Erro ao processar pagamento" }, { status: 500 });
  }
}
