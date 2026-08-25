import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ExtratoCarteira from "../ExtratoCarteira";

export default async function ExtratoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  // Consultado com a sessão do próprio cliente — RLS garante que ele só vê
  // as próprias movimentações.
  const { data: transacoesRow } = await supabase
    .from("carteira_transacoes")
    .select("tipo, valor_centavos, descricao, created_at")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const movimentacoes = transacoesRow ?? [];

  return (
    <div>
      <h2 className="text-white font-bold mb-1">Extrato da carteira</h2>
      <p className="text-gray-500 text-sm mb-4">
        Todo débito de serviço e crédito de depósito, na ordem que aconteceram.
      </p>
      <ExtratoCarteira movimentacoes={movimentacoes} />
    </div>
  );
}
