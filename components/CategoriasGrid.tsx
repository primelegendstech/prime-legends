"use client";

import Link from "next/link";

type Categoria = {
  nome: string;
  descricao: string;
  emoji: string;
  href: string;
  externo?: boolean;
};

const categorias: Categoria[] = [
  {
    nome: "Aluguéis",
    descricao: "UnlockTool, TSM, AMT, Samsung Tool e mais",
    emoji: "🕐",
    href: "/alugueis",
  },
  {
    nome: "Licenças • Créditos",
    descricao: "Licenças de ferramentas profissionais",
    emoji: "🛒",
    href: "/ativacao",
  },
  {
    nome: "Serviço Remoto",
    descricao: "Suporte técnico especializado à distância",
    emoji: "👨‍💻",
    href: "https://wa.me/5581995716227?text=Ol%C3%A1!%20Tenho%20interesse%20no%20servi%C3%A7o%20remoto.%20Podem%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F",
    externo: true,
  },
  {
    nome: "Serviço IMEI",
    descricao: "Desbloqueios e liberações por IMEI",
    emoji: "🔓",
    href: "https://wa.me/5581995716227?text=Ol%C3%A1!%20Tenho%20interesse%20em%20servi%C3%A7os%20de%20IMEI.%20Podem%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F",
    externo: true,
  },
  {
    nome: "Consulta IMEI",
    descricao: "Verificação de status e informações do aparelho",
    emoji: "📱",
    href: "https://wa.me/5581995716227?text=Ol%C3%A1!%20Tenho%20interesse%20em%20consulta%20de%20IMEI.%20Podem%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F",
    externo: true,
  },
];

export default function CategoriasGrid() {
  return (
    <section className="bg-[#0B0B0B] px-6 py-16 border-t border-yellow-500/10">
      <div className="max-w-6xl mx-auto text-center mb-10">
        <p className="text-yellow-400 font-semibold uppercase tracking-[0.3em] mb-3">
          Categorias
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Todos os nossos serviços
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {categorias.map((cat) =>
          cat.externo ? (
            <a
              key={cat.nome}
              href={cat.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/[0.03] border border-yellow-500/20 rounded-2xl p-5 md:p-6 hover:border-yellow-400 hover:bg-white/[0.06] transition flex flex-col items-start"
            >
              <span className="text-3xl mb-3">{cat.emoji}</span>
              <h3 className="text-white font-bold text-base md:text-lg mb-1 group-hover:text-yellow-400 transition">
                {cat.nome}
              </h3>
              <p className="text-gray-400 text-xs md:text-sm">{cat.descricao}</p>
            </a>
          ) : (
            <Link
              key={cat.nome}
              href={cat.href}
              className="group bg-white/[0.03] border border-yellow-500/20 rounded-2xl p-5 md:p-6 hover:border-yellow-400 hover:bg-white/[0.06] transition flex flex-col items-start"
            >
              <span className="text-3xl mb-3">{cat.emoji}</span>
              <h3 className="text-white font-bold text-base md:text-lg mb-1 group-hover:text-yellow-400 transition">
                {cat.nome}
              </h3>
              <p className="text-gray-400 text-xs md:text-sm">{cat.descricao}</p>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
