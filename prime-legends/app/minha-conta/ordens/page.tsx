import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { buscarPedidosUsuario } from "@/lib/buscar-pedidos-usuario";
import OrdensServico from "./OrdensServico";

export default async function OrdemDeServicoPage() {
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
      <h2 className="text-white font-bold mb-1">Ordem de serviço</h2>
      <p className="text-gray-500 text-sm mb-4">
        Clique em um pedido pra ver os detalhes e o login/senha recebidos.
      </p>
      <OrdensServico pedidos={pedidos} />
    </div>
  );
}
