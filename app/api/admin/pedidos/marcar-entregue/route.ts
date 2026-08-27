import { NextRequest, NextResponse } from "next/server";
import { verificarAdminApi } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { enviarEmailAcesso, enviarEmailLicencaLiberada } from "@/lib/enviar-email";

// Marca manualmente como concluído um pedido de ALUGUEL (que ficou em
// "manual"/"erro"/"processando") ou uma LICENÇA de ativação. Dispara o
// e-mail de confirmação pro cliente na hora.
export async function POST(request: NextRequest) {
  const admin = await verificarAdminApi();
  if (!admin) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  try {
    const { tipo, paymentId } = await request.json();

    if (!tipo || !paymentId) {
      return NextResponse.json({ erro: "tipo e paymentId são obrigatórios" }, { status: 400 });
    }

    if (tipo === "aluguel") {
      const { data: pedido, error: erroBusca } = await supabase
        .from("pedidos")
        .select("*")
        .eq("payment_id", paymentId)
        .maybeSingle();

      if (erroBusca || !pedido) {
        return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 });
      }

      const dadosAtualizados = { ...(pedido.dados ?? {}), estado: "concluido", marcadoManualPorAdmin: true };

      const { error: erroUpdate } = await supabase
        .from("pedidos")
        .update({ dados: dadosAtualizados })
        .eq("payment_id", paymentId);

      if (erroUpdate) {
        console.error("[admin/marcar-entregue] erro ao atualizar pedido:", erroUpdate);
        return NextResponse.json({ erro: "Falha ao atualizar pedido" }, { status: 500 });
      }

      if (pedido.email_cliente) {
        await enviarEmailAcesso({
          destinatario: pedido.email_cliente,
          servico: `${pedido.ferramenta} - Aluguel ${pedido.duracao}`,
          linkConsulta: `${process.env.NEXT_PUBLIC_SITE_URL}/consultar?codigo=${pedido.codigo}`,
          manual: false,
        });
      }

      return NextResponse.json({ sucesso: true });
    }

    if (tipo === "licenca") {
      const { data: checkout, error: erroBusca } = await supabase
        .from("checkouts_ativacao")
        .select("*")
        .eq("payment_id", paymentId)
        .maybeSingle();

      if (erroBusca || !checkout) {
        return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 });
      }

      // A coluna "entregue" precisa existir em checkouts_ativacao — ver
      // supabase-admin-migration.sql. Se ainda não rodou a migração, essa
      // atualização falha; devolvemos um erro claro em vez de mascarar.
      const { error: erroUpdate } = await supabase
        .from("checkouts_ativacao")
        .update({ entregue: true, entregue_em: new Date().toISOString() })
        .eq("payment_id", paymentId);

      if (erroUpdate) {
        console.error("[admin/marcar-entregue] erro ao atualizar licença:", erroUpdate);
        return NextResponse.json(
          {
            erro:
              "Falha ao marcar como entregue. Rodou o supabase-admin-migration.sql? (coluna 'entregue' em checkouts_ativacao)",
          },
          { status: 500 }
        );
      }

      if (checkout.email) {
        await enviarEmailLicencaLiberada({
          destinatario: checkout.email,
          ferramenta: checkout.ferramenta,
          duracao: checkout.duracao,
        });
      }

      return NextResponse.json({ sucesso: true });
    }

    return NextResponse.json({ erro: "tipo inválido" }, { status: 400 });
  } catch (erro: any) {
    console.error("[admin/marcar-entregue] erro inesperado:", erro?.message);
    return NextResponse.json({ erro: "Erro inesperado" }, { status: 500 });
  }
}
