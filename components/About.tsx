"use client";

export default function About() {
  return (
    <section
      id="sobre"
      className="max-w-3xl mx-auto px-6 py-20"
    >
      <div className="bg-white/[0.03] border border-yellow-500/20 rounded-2xl p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 text-black font-bold text-sm">
            i
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white">
            SOBRE O <span className="text-yellow-400">SERVIÇO</span>
          </h2>
        </div>

        <p className="text-gray-300 text-sm md:text-base leading-relaxed mb-6">
          Na <span className="font-bold text-yellow-400">Prime Legends GSM</span>,
          especializamo-nos exclusivamente em{" "}
          <span className="font-bold text-white">ativação e gestão de licenças</span>.
          Este foco permite-nos garantir os tempos de resposta mais rápidos e eficazes
          no setor técnico.
        </p>

        <div className="border-l-2 border-yellow-400 bg-black/30 rounded-r-lg px-4 py-3 mb-6">
          <p className="text-gray-300 text-sm leading-relaxed">
            Ao adquirir uma licença ou ativação, o cliente assume que possui o
            conhecimento técnico necessário para usar a ferramenta. Nosso suporte
            se limita estritamente a problemas com a ativação da conta.
          </p>
        </div>

        <p className="text-gray-400 text-sm mb-8">
          Operamos globalmente, garantindo o seu fluxo de trabalho técnico.
        </p>

        <a
          href="#home"
          className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 px-6 py-2.5 text-sm font-bold text-black transition hover:scale-105"
        >
          ENTENDIDO
        </a>
      </div>
    </section>
  );
}
