import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import SaldoCarteira from "./SaldoCarteira";
import PerfilConteudo from "./PerfilConteudo";

export default async function PainelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  // Saldo: consultado com a sessão do próprio cliente — o RLS já garante
  // que ele só vê a própria carteira.
  const { data: saldoRow } = await supabase
    .from("carteira_saldo")
    .select("saldo_centavos")
    .eq("usuario_id", user.id)
    .maybeSingle();

  const saldoCentavos = saldoRow?.saldo_centavos ?? 0;

  return (
    <div className="space-y-8">
      <SaldoCarteira saldoInicialCentavos={saldoCentavos} />

      <PerfilConteudo
        email={user.email ?? ""}
        metadataInicial={{
          nome: (user.user_metadata?.nome as string) || "",
          celular: (user.user_metadata?.celular as string) || "",
          cidade: (user.user_metadata?.cidade as string) || "",
          pais: (user.user_metadata?.pais as string) || "",
          endereco: (user.user_metadata?.endereco as string) || "",
          moeda: (user.user_metadata?.moeda as "BRL" | "USDT") || "BRL",
        }}
      />
    </div>
  );
}
