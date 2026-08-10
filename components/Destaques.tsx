"use client";

import Link from "next/link";

type Destaque = {
  ferramenta: string;
  precoDesde: number;
  imagem: string;
};

const destaques: Destaque[] = [
  { ferramenta: "UnlockTool", precoDesde: 5, imagem: "/laptops/unlocktool-1.png" },
  { ferramenta: "TSM Tool", precoDesde: 5.5, imagem: "/laptops/tsm-1.png" },
  { ferramenta: "AMT Tool", precoDesde: 5, imagem: "/laptops/amt-1.png" },
  { ferramenta: "Samsung Tool", precoDesde: 15, imagem: "/laptops/samsung-1.png" },
  { ferramenta: "Griffin-Unlocker", precoDesde: 9, imagem: "/laptops/griffin-1.png" },
];

const loop = [...destaques, ...destaques, ...destaques];

export default function Destaques() {
  return (
    <section className="relative w-full overflow-hidden border-y border-amber-500/10 bg-gradient-to-b from-black via-[#0B0B0B] to-black py-6 md:py-8">
      {/* linha de brilho no topo, remete aos circuitos dourados da identidade */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="px-6 md:px-16 mb-4 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-[11px] md:text-xs font-bold tracking-widest text-amber-400 uppercase">
          Entrega Instantânea
        </span>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-28 bg-gradient-to-r from-[#0B0B0B] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-28 bg-gradient-to-l from-[#0B0B0B] to-transparent z-10" />

      <div className="group flex overflow-hidden">
        <div className="flex gap-5 md:gap-6 animate-marquee group-hover:[animation-play-state:paused] pl-6 md:pl-16">
          {loop.map((item, i) => (
            <Link
              key={`${item.ferramenta}-${i}`}
              href="/alugueis"
              className="relative flex-shrink-0 w-[220px] md:w-[260px] rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden transition duration-300 hover:border-amber-500/50 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(245,158,11,0.15)]"
            >
              <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-zinc-900 to-black">
                <img
                  src={item.imagem}
                  alt={item.ferramenta}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 rounded-full bg-black/70 backdrop-blur px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-400/30">
                  ⚡ Instantâneo
                </span>
              </div>

              <div className="flex items-center justify-between px-3.5 py-3">
                <span className="text-sm font-bold text-zinc-100 truncate">
                  {item.ferramenta}
                </span>
                <span className="flex flex-col items-end leading-none">
                  <span className="text-[9px] text-zinc-500">a partir de</span>
                  <span className="text-sm font-extrabold bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                    R$ {item.precoDesde.toFixed(2).replace(".", ",")}
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
