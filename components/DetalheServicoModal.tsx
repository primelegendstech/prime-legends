"use client";

import type { Ferramenta, Plano } from "@/data/ferramentas";

type Props = {
  ferramenta: Ferramenta;
  plano: Plano;
  onFechar: () => void;
  onAlugar: () => void;
};

export default function DetalheServicoModal({ ferramenta, plano, onFechar, onAlugar }: Props) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onFechar}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0d0d0d] border border-yellow-500/25 rounded-2xl p-6 md:p-7 animate-hero-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 text-xl leading-none"
          aria-label="Fechar"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-1 pr-8">
          {ferramenta.imagens[0] && (
            <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10">
              <img
                src={ferramenta.imagens[0]}
                alt={ferramenta.nome}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            {ferramenta.nome}
            {ferramenta.badge && (
              <span className="text-xs font-semibold text-yellow-400 border border-yellow-400 px-2 py-0.5 rounded">
                {ferramenta.badge}
              </span>
            )}
          </h3>
        </div>
        <p className="text-gray-400 text-sm mb-5">Aluguel {plano.nome}</p>

        {/* Vídeo, só aparece se tiver link cadastrado */}
        {ferramenta.video && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-5 border border-white/10">
            <iframe
              src={ferramenta.video}
              title={`Vídeo demonstrativo — ${ferramenta.nome}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-5 text-sm">
          <a
            href={ferramenta.links.modelos}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300 transition"
          >
            📋 Ver modelos suportados ➤
          </a>
          <a
            href={ferramenta.links.download}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300 transition"
          >
            ⬇️ Baixar {ferramenta.nome} ➤
          </a>
        </div>

        {ferramenta.obs && (
          <div className="bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4 mb-6">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">
              📌 Observação
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">{ferramenta.obs}</p>
          </div>
        )}

        <div className="flex items-center justify-between bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4">
          <div>
            <p className="text-xs text-gray-500">Valor do aluguel</p>
            <p className="text-xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              R$ {plano.preco.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <button
            onClick={onAlugar}
            className="px-6 py-3 rounded-full font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 transition text-sm"
          >
            Alugar Agora
          </button>
        </div>
      </div>
    </div>
  );
}
