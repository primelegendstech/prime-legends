"use client";

import { useState, useRef, useEffect } from "react";
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
    menuServicos: "Menu de Serviços",
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
    menuServicos: "Services Menu",
    mensagemServico:
      "Hi! I'm interested in the remote service. Could you send me more information?",
  },
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicosOpen, setServicosOpen] = useState(false);
  const { idioma, trocarIdioma } = useIdioma();
  const t = textos[idioma];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fecharAoClicarFora(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicosOpen(false);
      }
    }
    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, []);

  const servicos = [
    { emoji: "🔓", label: "Serviços de IMEI", href: "https://wa.me/5581995716227?text=Ol%C3%A1!%20Tenho%20interesse%20em%20servi%C3%A7os%20de%20IMEI.", externo: true },
    { emoji: "🔑", label: "Ativação de Licença", href: "/ativacao" },
    { emoji: "🕐", label: "Aluguel de Ferramentas", href: "/alugueis" },
    { emoji: "💳", label: "Créditos de Servidor", href: "https://wa.me/5581995716227?text=Ol%C3%A1!%20Tenho%20interesse%20em%20cr%C3%A9ditos%20de%20servidor.", externo: true },
  ];

  const links = [
    { label: t.inicio, href: "/" },
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
          <a
            href={links[0].href}
            className="relative text-gray-300 hover:text-yellow-400 text-sm font-semibold transition py-1.5 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-yellow-300 after:to-amber-500 after:transition-all after:duration-300 hover:after:w-full"
          >
            {links[0].label}
          </a>

          {/* Menu de Serviços com dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setServicosOpen((v) => !v)}
              className={`flex items-center gap-1.5 text-sm font-semibold transition py-1.5 ${
                servicosOpen ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"
              }`}
            >
              {t.menuServicos}
              <span
                className={`text-[10px] transition-transform duration-200 ${
                  servicosOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {servicosOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-64 rounded-xl border border-yellow-500/25 bg-[#0d0d0d] shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-hero-in">
                {servicos.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.externo ? "_blank" : undefined}
                    rel={s.externo ? "noopener noreferrer" : undefined}
                    onClick={() => setServicosOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400 transition border-b border-white/5 last:border-b-0"
                  >
                    <span className="text-base">{s.emoji}</span>
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {links.slice(1).map((link) => (
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
          <a
            href={links[0].href}
            className="text-gray-300 hover:text-yellow-400 text-sm"
            onClick={() => setMenuOpen(false)}
          >
            {links[0].label}
          </a>

          <div className="flex flex-col gap-2 pl-2 border-l border-yellow-500/20">
            <span className="text-xs uppercase tracking-wide text-amber-500/70 font-bold mb-1">
              {t.menuServicos}
            </span>
            {servicos.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.externo ? "_blank" : undefined}
                rel={s.externo ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                <span>{s.emoji}</span> {s.label}
              </a>
            ))}
          </div>

          {links.slice(1).map((link) => (
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
      )}
    </header>
  );
}
