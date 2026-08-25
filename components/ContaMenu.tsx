"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";

function formatarReais(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const textos = {
  pt: {
    entrar: "Entrar",
    dashboard: "Painel",
    pedidos: "Meus Pedidos",
    extrato: "Extrato",
    depositos: "Consultar Depósitos",
    adicionar: "Adicionar saldo",
    sair: "Sair da conta",
  },
  en: {
    entrar: "Sign in",
    dashboard: "Dashboard",
    pedidos: "My Orders",
    extrato: "Statement",
    depositos: "Deposits",
    adicionar: "Add balance",
    sair: "Sign out",
  },
};

export default function ContaMenu({ idioma }: { idioma: "pt" | "en" }) {
  const t = textos[idioma];
  const router = useRouter();
  const supabase = createClient();

  const [usuario, setUsuario] = useState<User | null>(null);
  const [saldoCentavos, setSaldoCentavos] = useState<number | null>(null);
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  async function carregarSaldo(userId: string) {
    const { data } = await supabase
      .from("carteira_saldo")
      .select("saldo_centavos")
      .eq("usuario_id", userId)
      .maybeSingle();
    setSaldoCentavos(data?.saldo_centavos ?? 0);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUsuario(data.user);
      if (data.user) carregarSaldo(data.user.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
      if (session?.user) {
        carregarSaldo(session.user.id);
      } else {
        setSaldoCentavos(null);
      }
    });

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function fecharAoClicarFora(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownAberto(false);
      }
    }
    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, []);

  async function sair() {
    setDropdownAberto(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!usuario) {
    return (
      <Link
        href="/entrar"
        className="flex items-center gap-1.5 uppercase text-gray-300 hover:text-yellow-400 text-sm font-semibold transition whitespace-nowrap"
      >
        👤 <span className="hidden lg:inline">{t.entrar}</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setDropdownAberto((v) => !v)}
        className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
          dropdownAberto
            ? "border-yellow-400 text-yellow-400"
            : "border-yellow-500/30 text-gray-300 hover:border-yellow-500/60 hover:text-yellow-400"
        }`}
      >
        <span>👤</span>
        <span className="hidden lg:inline text-yellow-400 font-bold">
          {saldoCentavos === null ? "..." : formatarReais(saldoCentavos)}
        </span>
        <span className={`text-[10px] transition-transform duration-200 ${dropdownAberto ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {dropdownAberto && (
        <div className="absolute top-full right-0 mt-3 w-64 rounded-xl border border-yellow-500/25 bg-[#0d0d0d] shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-hero-in">
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-gray-400 text-xs">Saldo</p>
            <p className="text-yellow-400 font-black text-xl">
              {saldoCentavos === null ? "..." : formatarReais(saldoCentavos)}
            </p>
            <Link
              href="/minha-conta/adicionar-saldo"
              onClick={() => setDropdownAberto(false)}
              className="mt-2 block w-full text-center rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-bold py-2 hover:brightness-110 transition"
            >
              + {t.adicionar}
            </Link>
          </div>

          <Link
            href="/minha-conta"
            onClick={() => setDropdownAberto(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400 transition border-b border-white/5"
          >
            <span className="text-base">📊</span> {t.dashboard}
          </Link>

          <Link
            href="/minha-conta?tab=pedidos"
            onClick={() => setDropdownAberto(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400 transition border-b border-white/5"
          >
            <span className="text-base">📦</span> {t.pedidos}
          </Link>

          <Link
            href="/minha-conta?tab=extrato"
            onClick={() => setDropdownAberto(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400 transition border-b border-white/5"
          >
            <span className="text-base">📋</span> {t.extrato}
          </Link>

          <Link
            href="/minha-conta?tab=depositos"
            onClick={() => setDropdownAberto(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400 transition border-b border-white/5"
          >
            <span className="text-base">💰</span> {t.depositos}
          </Link>

          <button
            onClick={sair}
            className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition w-full text-left"
          >
            <span className="text-base">🚪</span> {t.sair}
          </button>
        </div>
      )}
    </div>
  );
}
