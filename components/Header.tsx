"use client";

import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
  { label: "Início", href: "#home" },
  { label: "Aluguéis", href: "/alugueis" },
  { label: "Serviço Remoto", href: "#servicos" },
  { label: "Sobre", href: "#sobre" },
];

  return (
    <header className="w-full bg-black border-b border-yellow-500/20 fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 font-black tracking-widest text-sm"
        >
          <img src="/logo.png" alt="Prime Legends Tech" className="w-12 h-12 object-contain" />
          <span className="bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
            PRIME LEGENDS GSM
          </span>
        </Link>

        <nav className="hidden md:flex gap-8">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:text-yellow-400 text-sm font-medium transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          className="md:hidden text-yellow-400"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>

      {menuOpen && (
        <nav className="md:hidden flex flex-col bg-black border-t border-yellow-500/20 px-6 py-4 gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-gray-300 hover:text-yellow-400 text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}