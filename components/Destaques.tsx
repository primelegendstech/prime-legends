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
    <div className="relative w-full overflow-hidden rounded-xl border border-amber-500/20 bg-black/50 backdrop-blur-md">
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/50 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/50 to-transparent z-10" />

      <div className="group flex overflow-hidden py-2">
        <div className="flex gap-2.5 animate-marquee group-hover:[animation-play-state:paused] pl-3">
          {loop.map((item, i) => (
            <Link
              key={`${item.ferramenta}-${i}`}
              href="/alugueis"
              className="relative flex-shrink-0 flex items-center gap-2 w-[142px] rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden pr-2 transition duration-300 hover:border-amber-500/50"
            >
              <div className="relative w-[44px] h-[32px] flex-shrink-0 bg-gradient-to-br from-zinc-900 to-black">
                <img
                  src={item.imagem}
                  alt={item.ferramenta}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col leading-tight min-w-0 py-1">
                <span className="text-[10px] font-bold text-zinc-100 truncate">
                  {item.ferramenta}
                </span>
                <span className="text-[10px] font-extrabold bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
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
