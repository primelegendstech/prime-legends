"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/admin", label: "Dashboard", emoji: "📊" },
  { href: "/admin/pedidos", label: "Pedidos", emoji: "🧾" },
  { href: "/admin/carteira", label: "Carteira", emoji: "💰" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full md:w-56 shrink-0 rounded-xl border border-yellow-500/20 bg-white/[0.03] p-2 flex md:flex-col gap-1 overflow-x-auto">
      {ITENS.map((item) => {
        const ativo = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition ${
              ativo
                ? "bg-gradient-to-r from-yellow-400/15 to-amber-500/10 text-yellow-400 border border-yellow-500/30"
                : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04] border border-transparent"
            }`}
          >
            <span>{item.emoji}</span> {item.label}
          </Link>
        );
      })}
      <Link
        href="/minha-conta"
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] border border-transparent mt-0 md:mt-4"
      >
        <span>↩️</span> Sair do admin
      </Link>
    </nav>
  );
}
