"use client";

import Link from "next/link";

type Item = {
  nome: string;
  descricao: string;
  imagem: string;
  tag: "Instantâneo" | "Minutos";
  href: string;
};

const itens: Item[] = [
  {
    nome: "UnlockTool",
    descricao: "Aluguel de 6 horas — login + senha",
    imagem: "/laptops/unlocktool-1-thumb.webp",
    tag: "Instantâneo",
    href: "/alugueis",
  },
  {
    nome: "Samsung Tool",
    descricao: "Aluguel de 12 horas — CellTool",
    imagem: "/laptops/samsung-1-thumb.webp",
    tag: "Instantâneo",
    href: "/alugueis",
  },
  {
    nome: "TSM Tool",
    descricao: "Aluguel de 3 horas — acesso rápido",
    imagem: "/laptops/tsm-1-thumb.webp",
    tag: "Instantâneo",
    href: "/alugueis",
  },
  {
    nome: "AMT Tool",
    descricao: "Aluguel de 2 horas — entrega automática",
    imagem: "/laptops/amt-1-thumb.webp",
    tag: "Instantâneo",
    href: "/alugueis",
  },
  {
    nome: "Griffin-Unlocker",
    descricao: "Aluguel de 6 horas — login + senha",
    imagem: "/laptops/griffin-1-thumb.webp",
    tag: "Instantâneo",
    href: "/alugueis",
  },
  {
    nome: "Ativação de Licença",
    descricao: "Licenças de 3, 6 ou 12 meses",
    imagem: "/laptops/unlocktool-1-thumb.webp",
    tag: "Minutos",
    href: "/ativacao",
  },
];

export default function MaisVendidos() {
  return (
    <section className="bg-[#0B0B0B] px-6 py-16 md:py-20 border-t border-yellow-500/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <span className="w-1.5 h-6 bg-yellow-400 rounded-full" />
          <h2 className="text-2xl md:text-3xl font-extrabold text-white uppercase">
            Mais Vendidos
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {itens.map((item) => (
            <Link
              key={item.nome}
              href={item.href}
              className="flex items-center gap-4 bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4 hover:border-yellow-400/60 hover:bg-white/[0.06] transition"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10">
                <img
                  src={item.imagem}
                  alt={item.nome}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="text-white font-bold text-sm md:text-base truncate">
                  🔥 {item.nome}
                </p>
                <p className="text-zinc-400 text-xs md:text-sm mb-2 truncate">
                  {item.descricao}
                </p>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    item.tag === "Instantâneo"
                      ? "text-emerald-400 border-emerald-400/40 bg-emerald-400/10"
                      : "text-amber-400 border-amber-400/40 bg-amber-400/10"
                  }`}
                >
                  {item.tag === "Instantâneo" ? "⚡ INSTANTÂNEO" : "🕐 MINUTOS"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
