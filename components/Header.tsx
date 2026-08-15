"use client";

import { useState } from "react";
import Link from "next/link";
import { useIdioma } from "@/context/LanguageContext";

const textos = {
  pt: {
    inicio: "Início",
    alugueis: "Aluguéis",
    ativacao: "Ativação de Licença",
    servico: "Serviço Remoto",
    sobre: "Sobre",
    consultar: "Consultar Pedido",
    mensagemServico:
      "Olá! Tenho interesse no serviço remoto. Podem me passar mais informações?",
  },
  en: {
    inicio: "Home",
    alugueis: "Rentals",
    ativacao: "License Activation",
    servico: "Remote Service",
    sobre: "About",
    consultar: "Track Order",
    mensagemServico:
      "Hi! I'm interested in the remote service. Could you send me more information?",
  },
};
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { idioma, trocarIdioma } = useIdioma();
  const t = textos[idioma];

  const links = [
    { label: t.inicio, href: "/" },
    { label: t.alugueis, href: "/alugueis" },
    { label: t.ativacao, href: "/ativacao" },
    {
      label: t.servico,
      href: `https://wa.me/5581995716227?text=${encodeURIComponent(t.mensagemServico)}`,
      externo: true,
    },
    { label: t.sobre, href: "/#sobre" },
    { label: t.consultar, href: "/consultar" },
  ];

  return (
    <header className="w-full bg-black/95 backdrop-blur-sm border-b border-yellow-500/30 shadow-[0_2px_20px_rgba(251,191,36,0.08)] fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3 md:py-4">
        <Link
          href="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 md:gap-3 font-black tracking-widest text-sm group"
        >
          <img
            src="/logo.png"
            alt="Prime Legends Tech"
            className="w-11 h-11 md:w-14 md:h-14 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col leading-none">
            <span className="bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent text-sm md:text-lg font-extrabold tracking-wide">
              PRIME LEGENDS
            </span>
            <span className="text-[9px] md:text-[10px] font-semibold tracking-[0.35em] text-amber-500/70 mt-0.5">
              GSM
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.externo ? "_blank" : undefined}
              rel={link.externo ? "noopener noreferrer" : undefined}
              className="relative text-gray-300 hover:text-yellow-400 text-sm font-semibold transition py-1.5 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-yellow-300 after:to-amber-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}

          <div className="flex items-center gap-1 bg-white/[0.03] border border-yellow-500/30 rounded-full p-1">
            <button
              onClick={() => trocarIdioma("pt")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                idioma === "pt"
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
            >
              BR
            </button>
            <button
              onClick={() => trocarIdioma("en")}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                idioma === "en"
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
            >
              EN
            </button>
          </div>
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
              target={link.externo ? "_blank" : undefined}
              rel={link.externo ? "noopener noreferrer" : undefined}
              className="text-gray-300 hover:text-yellow-400 text-sm"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}

          <div className="flex items-center gap-1 border border-yellow-500/30 rounded-full p-1 w-fit">
