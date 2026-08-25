import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import GoldNetworkBackground from "@/components/GoldNetworkBackground";
import ContaSidebar from "@/components/ContaSidebar";
import LogoutButton from "./logout-button";

export default async function MinhaContaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const nome = (user.user_metadata?.nome as string) || user.email;

  return (
    <main className="relative min-h-screen bg-black px-4 pt-24 pb-10 overflow-hidden">
      <GoldNetworkBackground />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Olá, {nome}!</h1>
            <p className="text-gray-400 text-sm">{user.email}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <ContaSidebar />
          <div className="flex-1 w-full min-w-0">
            <Suspense fallback={null}>{children}</Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
