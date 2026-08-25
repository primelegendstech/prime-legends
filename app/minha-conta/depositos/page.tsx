import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import ExtratoCarteira from "../ExtratoCarteira";

export default async function DepositosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: transacoesRow } = await supabase
    .from("carteira_transacoes")
    .select("tipo, valor_centavos, descricao, created_at")
    .eq("usuario_id", user.id)
    .eq("tipo", "deposito")
    .order("created_at", { ascending: false })
    .limit(100);

  const depositos = transacoesRow ?? [];

  return (
    <div>
      <h2 className="text-white font-bold mb-1">Depósitos realizados</h2>
      <p className="text-gray-500 text-sm mb-4">Todo saldo que você já adicionou na carteira.</p>
      <ExtratoCarteira movimentacoes={depositos} />
    </div>
  );
}
