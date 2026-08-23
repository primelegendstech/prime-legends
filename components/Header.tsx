"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useIdioma } from "@/context/LanguageContext";

const textos = {
  pt: {
    inicio: "Início",
    alugueis: "Aluguéis",
    ativacao: "Licenças • Créditos",
    servico: "Serviço Remoto",
    sobre: "Sobre",
    consultar: "Consultar Pedido",
    menuServicos: "Menu de Serviços",
    arquivosMdm: "Arquivos MDM/PayJoy",
    mais: "Mais",
    mensagemServico:
      "Olá! Tenho interesse no serviço remoto. Podem me passar mais informações?",
    mensagemMdm:
      "Olá! Tenho interesse nos arquivos MDM/PayJoy. Podem me passar mais informações?",
    entrar: "Entrar",
  },
  en: {
    inicio: "Home",
    alugueis: "Rentals",
    ativacao: "Licenses • Credits",
    servico: "Remote Service",
    sobre: "About",
    consultar: "Track Order",
    menuServicos: "Services Menu",
    arquivosMdm: "MDM/PayJoy Files",
    mais: "More",
    mensagemServico:
      "Hi! I'm interested in the remote service. Could you send me more information?",
    mensagemMdm:
      "Hi! I'm interested in the MDM/PayJoy files. Could you send me more information?",
    entrar: "Sign in",
  },
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicosOpen, setServicosOpen] = useState(false);
  const [maisOpen, setMaisOpen] = useState(false);
  const { idioma, trocarIdioma } = useIdioma();
  const t = textos[idioma];
  const servicosRef = useRef<HTMLDivElement>(null);
  const maisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fecharAoClicarFora(e: MouseEvent) {
      if (servicosRef.current && !servicosRef.current.contains(e.target as Node)) {
        setServicosOpen(false);
      }
      if (maisRef.current && !maisRef.current.contains(e.target as Node)) {
        setMaisOpen(false);
      }
    }
    document.addEventListener("mousedown", fecharAoClicarFora);
    return () => document.removeEventListener("mousedown", fecharAoClicarFora);
  }, []);

  const arquivosMdmHref = `https://wa.me/5581995716227?text=${encodeURIComponent(t.mensagemMdm)}`;

  const servicos = [
    { emoji: "🔓", label: "Serviços de IMEI", href: "https://wa.me/5581995716227?text=Ol%C3%A1!%20Tenho%20interesse%20em%20servi%C3%A7os%20de%20IMEI.", externo: true },
    { emoji: "🔑", label: "Licenças • Créditos", href: "/ativacao" },
    { emoji: "🕐", label: "Aluguel de Ferramentas", href: "/alugueis" },
  ];

  const mais = [
    {
      emoji: "👨‍💻",
      label: t.servico,
      href: `https://wa.me/5581995716227?text=${encodeURIComponent(t.mensagemServico)}`,
      externo: true,
    },
    { emoji: "ℹ️", label: t.sobre, href: "/#sobre" },
    { emoji: "📦", label: t.consultar, href: "/consultar" },
  ];

  const linkClass =
    "relative uppercase text-gray-300 hover:text-yellow-400 text-[13px] lg:text-sm font-semibold transition py-1.5 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-yellow-300 after:to-amber-500 after:transition-all after:duration-300 hover:after:w-full";

  return (
    <header className="w-full bg-black/95 backdrop-blur-sm border-b border-yellow-500/30 shadow-[0_2px_20px_rgba(251,191,36,0.08)] fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-10 md:gap-14 px-6 py-2 md:py-2.5">
        <Link
          href="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2 md:gap-2.5 font-black tracking-widest text-sm group"
        >
          <img
            src="/logo.png"
            alt="Prime Legends Tech"
            className="w-9 h-9 md:w-11 md:h-11 object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex items-center gap-1.5 leading-none">
            <span className="bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent text-xs md:text-base font-extrabold tracking-wide">
              PRIME LEGENDS
            </span>
            <span className="text-sm md:text-lg font-black tracking-wide text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] border-l-2 border-amber-500/50 pl-1.5">
              GSM
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-3 lg:gap-5 text-[13px] lg:text-sm shrink-0">
          <a href="/" className={linkClass}>
            {t.inicio}
          </a>

          <a href="/alugueis" className={linkClass}>
            🕐 {t.alugueis}
          </a>

          {/* Menu de Serviços com dropdown */}
          <div className="relative" ref={servicosRef}>
            <button
              onClick={() => setServicosOpen((v) => !v)}
              className={`flex items-center gap-1.5 uppercase text-[13px] lg:text-sm font-semibold transition py-1.5 ${
                servicosOpen ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"
              }`}
            >
              🛠️ {t.menuServicos}
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
                    className="flex items-center gap-3 px-4 py-3 uppercase text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400 transition border-b border-white/5 last:border-b-0"
                  >
                    <span className="text-base">{s.emoji}</span>
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <a
            href={arquivosMdmHref}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            📁 {t.arquivosMdm}
          </a>

          {/* Serviço Remoto + Sobre + Consultar Pedido agrupados em "Mais" */}
          <div className="relative" ref={maisRef}>
            <button
              onClick={() => setMaisOpen((v) => !v)}
              className={`flex items-center gap-1.5 uppercase text-[13px] lg:text-sm font-semibold transition py-1.5 ${
                maisOpen ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"
              }`}
            >
              {t.mais}
              <span
                className={`text-[10px] transition-transform duration-200 ${
                  maisOpen ? "rotate-180" : ""
                }`}
              >
                ▼
              </span>
            </button>

            {maisOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 rounded-xl border border-yellow-500/25 bg-[#0d0d0d] shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-hero-in">
                {mais.map((m) => (
                  <a
                    key={m.label}
                    href={m.href}
                    target={m.externo ? "_blank" : undefined}
                    rel={m.externo ? "noopener noreferrer" : undefined}
                    onClick={() => setMaisOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 uppercase text-sm text-gray-300 hover:bg-yellow-500/10 hover:text-yellow-400 transition border-b border-white/5 last:border-b-0"
                  >
                    <span className="text-base">{m.emoji}</span>
                    {m.label}
                  </a>
                ))}
              </div>
            )}
          </div>

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

          <Link
            href="/entrar"
            className="flex items-center gap-1.5 uppercase text-gray-300 hover:text-yellow-400 text-sm font-semibold transition whitespace-nowrap"
          >
            👤 <span className="hidden lg:inline">{t.entrar}</span>
          </Link>
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
            href="/"
            className="uppercase text-gray-300 hover:text-yellow-400 text-sm"
            onClick={() => setMenuOpen(false)}
          >
            {t.inicio}
          </a>

          <a
            href="/alugueis"
            className="uppercase text-gray-300 hover:text-yellow-400 text-sm"
            onClick={() => setMenuOpen(false)}
          >
            🕐 {t.alugueis}
          </a>

          <div className="flex flex-col gap-2 pl-2 border-l border-yellow-500/20">
            <span className="text-xs uppercase tracking-wide text-amber-500/70 font-bold mb-1">
              🛠️ {t.menuServicos}
            </span>
            {servicos.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target={s.externo ? "_blank" : undefined}
                rel={s.externo ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 uppercase text-gray-300 hover:text-yellow-400 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                <span>{s.emoji}</span> {s.label}
              </a>
            ))}
          </div>

          <a
            href={arquivosMdmHref}
            target="_blank"
            rel="noopener noreferrer"
            className="uppercase text-gray-300 hover:text-yellow-400 text-sm"
            onClick={() => setMenuOpen(false)}
          >
            📁 {t.arquivosMdm}
          </a>

          <div className="flex flex-col gap-2 pl-2 border-l border-yellow-500/20">
            <span className="text-xs uppercase tracking-wide text-amber-500/70 font-bold mb-1">
              {t.mais}
            </span>
            {mais.map((m) => (
              <a
                key={m.label}
                href={m.href}
                target={m.externo ? "_blank" : undefined}
                rel={m.externo ? "noopener noreferrer" : undefined}
                className="flex items-center gap-2 uppercase text-gray-300 hover:text-yellow-400 text-sm"
                onClick={() => setMenuOpen(false)}
              >
                <span>{m.emoji}</span> {m.label}
              </a>
            ))}
          </div>

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

          <a
            href="/entrar"
            className="flex items-center gap-2 uppercase text-gray-300 hover:text-yellow-400 text-sm"
            onClick={() => setMenuOpen(false)}
          >
            👤 {t.entrar}
          </a>
        </nav>
      )}
    </header>
  );
}
