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

// duplicamos a lista pra criar o loop infinito do scroll
const loop = [...destaques, ...destaques];

export default function Destaques() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 mb-8 flex items-center gap-3">
        <span className="w-1.5 h-6 bg-gradient-to-b from-yellow-300 to-amber-600 rounded-full" />
        <h2 className="text-xl md:text-2xl font-extrabold text-white">
          EM <span className="bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">DESTAQUE</span>
        </h2>
      </div>

      {/* fade nas bordas pra esconder o corte do loop */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-[#0B0B0B] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-[#0B0B0B] to-transparent z-10" />

      <div className="group flex overflow-hidden">
        <div className="flex gap-5 animate-marquee group-hover:[animation-play-state:paused] pl-6">
          {loop.map((item, i) => (
            <Link
              key={`${item.ferramenta}-${i}`}
              href="/alugueis"
              className="flex-shrink-0 w-64 rounded-2xl border border-amber-500/20 bg-white/[0.03] p-4 hover:border-amber-500/50 hover:bg-white/[0.06] transition"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    item.automatico
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-400"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.automatico ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  {item.automatico ? "Automático" : "Entrega manual"}
                </span>
              </div>

              <img
                src={item.imagem}
                alt={item.ferramenta}
                className="w-full h-28 object-contain mb-3"
              />

              <p className="text-white font-bold text-sm">{item.ferramenta}</p>
              <p className="text-zinc-500 text-xs mb-2">Aluguel {item.plano}</p>

              <p className="text-amber-400 font-extrabold text-lg">
                a partir de R$ {item.precoDesde.toFixed(2).replace(".", ",")}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}