"use client";

import Link from "next/link";

type Destaque = {
  ferramenta: string;
  plano: string;
  precoDesde: number;
  automatico: boolean;
  imagem: string;
};

const destaques: Destaque[] = [
  { ferramenta: "UnlockTool", plano: "6 horas", precoDesde: 5, automatico: true, imagem: "/laptops/unlocktool-1.png" },
  { ferramenta: "TSM Tool", plano: "3 horas", precoDesde: 5.5, automatico: true, imagem: "/laptops/tsm-1.png" },
  { ferramenta: "AMT Tool", plano: "2 horas", precoDesde: 5, automatico: true, imagem: "/laptops/amt-1.png" },
  { ferramenta: "Samsung Tool", plano: "12 horas", precoDesde: 15, automatico: true, imagem: "/laptops/samsung-1.png" },
  { ferramenta: "Griffin-Unlocker", plano: "6 horas", precoDesde: 9, automatico: true, imagem: "/laptops/griffin-1.png" },
];

const loop = [...destaques, ...destaques];

export default function Destaques() {
  return (
    <section className="relative py-3 overflow-hidden border-b border-white/5">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-20 bg-gradient-to-r from-[#0B0B0B] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-20 bg-gradient-to-l from-[#0B0B0B] to-transparent z-10" />

      <div className="group flex overflow-hidden">
        <div className="flex gap-2 animate-marquee group-hover:[animation-play-state:paused] pl-6">
          {loop.map((item, i) => (
            <Link
              key={`${item.ferramenta}-${i}`}
              href="/alugueis"
              className="flex-shrink-0 w-32 rounded-lg border border-amber-500/20 bg-white/[0.03] p-2 hover:border-amber-500/50 hover:bg-white/[0.06] transition flex items-center gap-2"
            >
              <img src={item.imagem} alt={item.ferramenta} className="w-10 h-10 object-contain flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-white font-bold text-[11px] leading-tight truncate">{item.ferramenta}</p>
                <p className="text-amber-400 font-extrabold text-xs">
                  R$ {item.precoDesde.toFixed(2).replace(".", ",")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}