import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import AdicionarSaldoConteudo from "./AdicionarSaldoConteudo";
import GoldNetworkBackground from "@/components/GoldNetworkBackground";

export default async function AdicionarSaldoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  return (
    <main className="relative min-h-screen bg-black px-4 pt-24 pb-10 overflow-hidden">
      <GoldNetworkBackground />
      <div className="relative z-10 max-w-md mx-auto">
        <Link
          href="/minha-conta"
          className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-yellow-400 text-sm mb-6 transition"
        >
          ← Voltar pra minha conta
        </Link>

        <AdicionarSaldoConteudo />
      </div>
    </main>
  );
}
