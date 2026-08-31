import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { buscarPedidosUsuario } from "@/lib/buscar-pedidos-usuario";
import HistoricoPedidos from "../HistoricoPedidos";

export default async function MeusPedidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/entrar");
  }

  const pedidos = await buscarPedidosUsuario(user.email!);

  return (
    <div>
      <h2 className="text-white font-bold mb-1">Meus pedidos</h2>
      <p className="text-gray-500 text-sm mb-4">
        Todos os aluguéis e licenças que você já contratou no site.
      </p>
      <HistoricoPedidos pedidos={pedidos} />
    </div>
  );
}
