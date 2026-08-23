import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import LogoutButton from "./logout-button";

export default async function MinhaContaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const nome = (user.user_metadata?.nome as string) || user.email;

  return (
    <main className="min-h-screen bg-black px-4 pt-24 pb-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-black text-white mb-1">Olá, {nome}!</h1>
        <p className="text-gray-400 mb-8">{user.email}</p>

        {/* TODO: quando a carteira/saldo estiver pronta, mostrar aqui:
            - saldo atual (tabela carteira_saldo)
            - botão "adicionar saldo"
            - histórico de pedidos (tabela pedidos filtrada por e-mail/usuario_id) */}

        <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4 mb-6">
          <p className="text-sm text-gray-400">Saldo</p>
          <p className="text-2xl font-black text-yellow-400">Em breve</p>
        </div>

        <LogoutButton />
      </div>
    </main>
  );
}
