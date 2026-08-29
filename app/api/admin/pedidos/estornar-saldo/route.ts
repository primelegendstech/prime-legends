import { NextRequest, NextResponse } from "next/server";
import { verificarAdminApi } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { estornarCarteira } from "@/lib/carteira-debito";
import { buscarUsuarioIdPorEmail } from "@/lib/admin-carteira";

// Estorna um pedido dando o valor de volta como saldo na carteira do
// cliente. Funciona pra QUALQUER forma de pagamento original — se o pedido
// foi pago com saldo interno, é literalmente devolver o que foi debitado;
// se foi pago no Mercado Pago, é dar o valor como crédito no site em vez de
// estornar o pagamento em si (isso é uma escolha do admin, não estorna o MP).
// Cria a carteira do cliente automaticamente se ele nunca teve uma.
export async function POST(request: NextRequest) {
  const admin = await verificarAdminApi();
  if (!admin) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  try {
    const { paymentId, tipo } = await request.json();

    if (!paymentId) {
      return NextResponse.json({ erro: "paymentId é obrigatório" }, { status: 400 });
    }

    const tabela = tipo === "licenca" ? "checkouts_ativacao" : tipo === "metodo" ? "pedidos_metodos" : "pedidos";
    const colunaEmail = tabela === "checkouts_ativacao" ? "email" : "email_cliente";

    const { data: pedido, error: erroBusca } = await supabase
      .from(tabela)
      .select(`payment_id, preco, ${colunaEmail}, estornado`)
      .eq("payment_id", paymentId)
      .maybeSingle<any>();

    if (erroBusca || !pedido) {
      return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 });
    }

    if (pedido.estornado) {
      return NextResponse.json({ erro: "Esse pedido já foi estornado antes" }, { status: 409 });
    }

    const email = pedido[colunaEmail] as string | null;
    if (!email) {
      return NextResponse.json(
        { erro: "Pedido sem e-mail de cliente registrado — não dá pra saber de quem é a carteira." },
        { status: 400 }
      );
    }

    const usuarioId = await buscarUsuarioIdPorEmail(email);
    if (!usuarioId) {
      return NextResponse.json(
        { erro: `Não encontrei nenhuma conta cadastrada com o e-mail ${email}.` },
        { status: 404 }
      );
    }

    const valorCentavos = Math.round(Number(pedido.preco) * 100);

    const resultadoEstorno = await estornarCarteira(usuarioId, valorCentavos, `Estorno manual (admin) — pedido ${paymentId}`);
    if (!resultadoEstorno.sucesso) {
      return NextResponse.json(
        { erro: "Não foi possível creditar o saldo do cliente. Nada foi alterado — tente novamente ou avise o suporte técnico." },
        { status: 500 }
      );
    }

    const { error: erroMarcar } = await supabase
      .from(tabela)
      .update({ estornado: true, estornado_em: new Date().toISOString() })
      .eq("payment_id", paymentId);

    let aviso: string | null = null;
    if (erroMarcar) {
      console.error("[admin/estornar-saldo] saldo creditado, mas falhou ao marcar localmente:", erroMarcar);
      aviso = "Saldo creditado, mas não foi possível marcar o pedido como estornado localmente.";
    }

    return NextResponse.json({ sucesso: true, aviso });
  } catch (erro: any) {
    console.error("[admin/estornar-saldo] erro inesperado:", erro?.message);
    return NextResponse.json({ erro: "Erro inesperado ao estornar" }, { status: 500 });
  }
}
