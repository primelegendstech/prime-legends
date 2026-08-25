"use client";

import type { Metodo } from "@/data/metodos";

type Props = {
  metodo: Metodo;
  onFechar: () => void;
  onComprar: () => void;
};

export default function DetalheMetodoModal({ metodo, onFechar, onComprar }: Props) {
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

        <div className="flex items-center gap-3 mb-4 pr-8">
          <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10">
            <img src={metodo.imagem} alt={metodo.nome} className="w-full h-full object-cover" />
          </div>
          <h3 className="text-2xl font-black text-white">{metodo.nome}</h3>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-5">{metodo.descricao}</p>

        <div className="bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">📌 Observação</p>
          <p className="text-sm text-gray-300 leading-relaxed">
            Não fazemos reembolso após a liberação do arquivo/método. Confira a descrição acima antes de comprar.
          </p>
        </div>

        <div className="flex items-center justify-between bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4">
          <div>
            <p className="text-xs text-gray-500">Valor</p>
            <p className="text-xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              R$ {metodo.preco.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <button
            onClick={onComprar}
            className="px-6 py-3 rounded-full font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 transition text-sm"
          >
            Comprar Agora
          </button>
        </div>
      </div>
    </div>
  );
}
