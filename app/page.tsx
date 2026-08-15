"use client";

import Header from "@/components/Header";
import Destaques from "@/components/Destaques";
import HeroBanner from "@/components/HeroBanner";
import CircuitGlow from "@/components/CircuitGlow";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import WhatsAppButton from "@/components/WhatsAppButton";
import TrustBadges from "@/components/TrustBadges";
import About from "@/components/About";
import CategoriasGrid from "@/components/CategoriasGrid";
import Link from "next/link";
import { useIdioma } from "@/context/LanguageContext";

const textos = {
  pt: {
    comprarLicenca: "COMPRAR LICENÇA",
    aluguelFerramentas: "ALUGUEL DE FERRAMENTAS",
    mensagemWhatsApp:
      "Olá! Tenho interesse em comprar uma licença (3, 6 ou 12 meses). Podem me passar mais informações?",
  },
  en: {
    comprarLicenca: "BUY LICENSE",
    aluguelFerramentas: "TOOL RENTAL",
    mensagemWhatsApp:
      "Hi! I'm interested in buying a license (3, 6 or 12 months). Could you send me more information?",
  },
};

export default function Home() {
  const { idioma } = useIdioma();
  const t = textos[idioma];

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white relative overflow-hidden">
      <div
        className="fixed inset-0 opacity-40 pointer-events-none animate-drift"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3Cfilter id='glow' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur stdDeviation='3' result='blur'/%3E%3CfeMerge%3E%3CfeMergeNode in='blur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg filter='url(%23glow)'%3E%3Cg stroke='%23ffb800' stroke-width='1.4' fill='none' stroke-linecap='round'%3E%3Cpath d='M-30 60L90 60L150 -10'/%3E%3Cpath d='M20 400L90 320L90 200L200 90L320 90'/%3E%3Cpath d='M-30 250L60 250L140 170'/%3E%3Cpath d='M250 -20L250 70L360 180L430 180'/%3E%3Cpath d='M400 340L300 340L220 260L220 180'/%3E%3Cpath d='M-30 150L40 150L100 90L100 30'/%3E%3Cpath d='M180 400L180 330L260 250'/%3E%3C/g%3E%3Cg fill='%23ffdd66'%3E%3Ccircle cx='90' cy='60' r='3'/%3E%3Ccircle cx='90' cy='200' r='2.5'/%3E%3Ccircle cx='200' cy='90' r='3'/%3E%3Ccircle cx='140' cy='170' r='2'/%3E%3Ccircle cx='250' cy='70' r='2.5'/%3E%3Ccircle cx='360' cy='180' r='3'/%3E%3Ccircle cx='220' cy='260' r='2.5'/%3E%3Ccircle cx='100' cy='90' r='2'/%3E%3Ccircle cx='260' cy='250' r='2.5'/%3E%3Ccircle cx='150' cy='-10' r='1.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="relative z-10">
        <Header />

        {/* Carrossel de produtos em destaque, logo abaixo do menu */}
        <div className="pt-4 md:pt-6">
          <Destaques />
        </div>

        {/* HERO = banner rotativo com suas artes, emoldurado pelas trilhas douradas */}
        <section className="relative px-6 md:px-16 pt-6 md:pt-8 pb-10 md:pb-14">
          <div className="max-w-6xl mx-auto relative">
            <CircuitGlow lado="esquerda" />
            <CircuitGlow lado="direita" />
            <HeroBanner />

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3">
              <Link
                href="/ativacao"
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 px-5 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-bold text-black transition hover:scale-105"
              >
                🛒 {t.comprarLicenca}
              </Link>
              <Link
                href="/alugueis"
                className="flex items-center justify-center gap-2 rounded-full border border-amber-500 px-5 py-2.5 md:px-6 md:py-3 text-xs md:text-sm font-bold text-amber-400 transition hover:bg-gradient-to-r hover:from-yellow-300 hover:via-amber-500 hover:to-yellow-600 hover:text-black"
              >
                🕐 {t.aluguelFerramentas}
              </Link>
            </div>
          </div>
        </section>

        {/* Ticker com as ferramentas reais que a Prime Legends trabalha */}
        <div className="relative z-10 border-y border-yellow-500/10 bg-black/40 overflow-hidden py-3">
          <div className="flex animate-marquee whitespace-nowrap font-mono text-xs md:text-sm text-zinc-500 tracking-wide">
            {Array(2)
              .fill([
                "UnlockTool",
                "TSM Tool",
                "AMT Tool",
                "Samsung Tool",
                "Griffin-Unlocker",
              ])
              .flat()
              .map((nome, i) => (
                <span key={i} className="flex items-center">
                  <span className="text-white/70">{nome}</span>
                  <span className="mx-6 text-amber-500/50">◆</span>
                </span>
              ))}
          </div>
        </div>

        <TrustBadges />
        <CategoriasGrid />
        <About />
        <Services />
        <Contact />
        <WhatsAppButton />
      </div>
    </main>
  );
}
