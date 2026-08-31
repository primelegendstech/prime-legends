import { NextRequest, NextResponse } from "next/server";
import { verificarAdminApi } from "@/lib/admin";
import { supabase } from "@/lib/supabase";
import { metodos } from "@/data/metodos";
import { gerarLinkDownloadB2 } from "@/lib/b2";
import {
  enviarEmailAcesso,
  enviarEmailAcessoMetodo,
  enviarEmailLicencaLiberada,
} from "@/lib/enviar-email";

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
      const { data: pedido } = await supabase
        .from("pedidos")
        .select("*")
        .eq("payment_id", paymentId)
        .maybeSingle();

      if (!pedido) return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 });
      if (!pedido.email_cliente) return NextResponse.json({ erro: "Pedido sem e-mail cadastrado" }, { status: 400 });

      const estado = pedido.dados?.estado;
      await enviarEmailAcesso({
        destinatario: pedido.email_cliente,
        servico: `${pedido.ferramenta} - Aluguel ${pedido.duracao}`,
        linkConsulta: `${process.env.NEXT_PUBLIC_SITE_URL}/consultar?codigo=${pedido.codigo}`,
        manual: estado !== "concluido",
      });

      return NextResponse.json({ sucesso: true, enviadoPara: pedido.email_cliente });
    }

    if (tipo === "licenca") {
      const { data: checkout } = await supabase
        .from("checkouts_ativacao")
        .select("*")
        .eq("payment_id", paymentId)
        .maybeSingle();

      if (!checkout) return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 });
      if (!checkout.email) return NextResponse.json({ erro: "Pedido sem e-mail cadastrado" }, { status: 400 });

      await enviarEmailLicencaLiberada({
        destinatario: checkout.email,
        ferramenta: checkout.ferramenta,
        duracao: checkout.duracao,
      });

      return NextResponse.json({ sucesso: true, enviadoPara: checkout.email });
    }

    if (tipo === "metodo") {
      const { data: pedido } = await supabase
        .from("pedidos_metodos")
        .select("*")
        .eq("payment_id", paymentId)
        .maybeSingle();

      if (!pedido) return NextResponse.json({ erro: "Pedido não encontrado" }, { status: 404 });
      if (!pedido.email_cliente) return NextResponse.json({ erro: "Pedido sem e-mail cadastrado" }, { status: 400 });

      const catalogo = metodos.find((m) => m.id === pedido.metodo_id);
      let linkDownload: string | null = null;
      if (catalogo?.arquivoPath) {
        try {
          linkDownload = await gerarLinkDownloadB2(catalogo.arquivoPath);
        } catch (e) {
          console.error("[admin/reenviar-email] erro ao gerar link B2:", e);
        }
      }

      await enviarEmailAcessoMetodo({
        destinatario: pedido.email_cliente,
        nome: pedido.nome,
        descricao: catalogo?.descricao ?? "",
        video: catalogo?.video || undefined,
        linkDownload,
      });

      return NextResponse.json({ sucesso: true, enviadoPara: pedido.email_cliente });
    }

    return NextResponse.json({ erro: "tipo inválido" }, { status: 400 });
  } catch (erro: any) {
    console.error("[admin/reenviar-email] erro inesperado:", erro?.message);
    return NextResponse.json({ erro: "Erro inesperado" }, { status: 500 });
  }
}
