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

export default function Destaques() {
  return (
    <div className="mt-5 md:mt-6">
      <p className="text-[11px] font-bold text-amber-400 mb-2 uppercase tracking-wide">Em destaque</p>
      <div className="flex flex-wrap gap-2">
        {destaques.map((item) => (
          <Link
            key={item.ferramenta}
            href="/alugueis"
            className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-white/[0.04] pl-1.5 pr-3 py-1.5 hover:border-amber-500/50 hover:bg-white/[0.08] transition"
          >
            <img src={item.imagem} alt={item.ferramenta} className="w-7 h-7 object-contain" />
            <div>
              <p className="text-white text-[11px] font-bold leading-none">{item.ferramenta}</p>
              <p className="text-amber-400 text-[11px] font-extrabold leading-none mt-0.5">
                R$ {item.precoDesde.toFixed(2).replace(".", ",")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}