"use client";

import Link from "next/link";

type Destaque = {
  ferramenta: string;
  precoDesde: number;
  imagem: string;
};

const destaques: Destaque[] = [
  { ferramenta: "UnlockTool", precoDesde: 5, imagem: "/laptops/unlocktool-1-thumb.webp" },
  { ferramenta: "TSM Tool", precoDesde: 5.5, imagem: "/laptops/tsm-1-thumb.webp" },
  { ferramenta: "AMT Tool", precoDesde: 5, imagem: "/laptops/amt-1-thumb.webp" },
  { ferramenta: "Samsung Tool", precoDesde: 15, imagem: "/laptops/samsung-1-thumb.webp" },
  { ferramenta: "Griffin-Unlocker", precoDesde: 9, imagem: "/laptops/griffin-1-thumb.webp" },
];
const loop = Array(6).fill(destaques).flat();

export default function Destaques() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-10 md:w-20 bg-gradient-to-r from-black/90 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 md:w-20 bg-gradient-to-l from-black/90 to-transparent z-10" />

      <div className="group flex overflow-hidden">
        <div className="flex gap-2.5 md:gap-3 animate-marquee group-hover:[animation-play-state:paused] pl-4 md:pl-16">
          {loop.map((item, i) => (
            <Link
              key={`${item.ferramenta}-${i}`}
              href="/alugueis"
              className="relative flex-shrink-0 w-[96px] md:w-[112px] rounded-lg border border-white/10 bg-black/70 backdrop-blur-sm overflow-hidden transition duration-300 hover:border-amber-500/50 hover:-translate-y-1"
            >
              <div className="relative w-full aspect-[3/2] bg-gradient-to-br from-zinc-900 to-black">
                <img
                  src={item.imagem}
                  alt={item.ferramenta}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 rounded-full bg-black/70 backdrop-blur px-1.5 py-0.5 text-[7px] font-bold text-emerald-400 border border-emerald-400/30">
                  ⚡ Instantâneo
                </span>
              </div>

              <div className="flex items-center justify-between px-1.5 py-1">
                <span className="text-[9px] font-bold text-zinc-100 truncate">
                  {item.ferramenta}
                </span>
                <span className="text-[9px] font-extrabold bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                  R$ {item.precoDesde.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
