"use client";

import { useState } from "react";
import CheckoutMetodo from "@/components/CheckoutMetodo";
import DetalheMetodoModal from "@/components/DetalheMetodoModal";
import { metodos, type Metodo } from "@/data/metodos";

export default function MetodosContent() {
  const [detalheAberto, setDetalheAberto] = useState<Metodo | null>(null);
  const [comprando, setComprando] = useState<Metodo | null>(null);

  function confirmarCompraDoModal() {
    if (!detalheAberto) return;
    setComprando(detalheAberto);
    setDetalheAberto(null);
  }

  return (
    <>
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1.5 h-6 bg-yellow-400 rounded-full" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white">
              ARQUIVOS <span className="text-yellow-400 italic">⋮ MÉTODOS</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">Início › Arquivos ⋮ Métodos</p>
          </div>
        </div>

        {metodos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metodos.map((m) => (
              <button
                key={m.id}
                onClick={() => setDetalheAberto(m)}
                className="flex items-center gap-4 bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4 hover:border-yellow-400/50 transition text-left"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-white/10">
                  <img src={m.imagem} alt={m.nome} className="w-full h-full object-cover" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-white font-bold text-sm md:text-base leading-tight"># {m.nome}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-sm font-extrabold bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                      R$ {m.preco.toFixed(2).replace(".", ",")}
                    </span>
                    {m.destaque && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-black">
                        POPULAR
                      </span>
                    )}
                  </div>
                </div>

                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    setDetalheAberto(m);
                  }}
                  className="flex-shrink-0 px-4 py-2 rounded-full font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 transition text-xs md:text-sm whitespace-nowrap"
                >
                  Ver mais
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-8 text-center">
            Nenhum item cadastrado ainda. Adicione itens em{" "}
            <code className="text-yellow-400">data/metodos.ts</code>.
          </p>
        )}
      </div>

      {detalheAberto && (
        <DetalheMetodoModal
          metodo={detalheAberto}
          onFechar={() => setDetalheAberto(null)}
          onComprar={confirmarCompraDoModal}
        />
      )}

      {comprando && <CheckoutMetodo metodo={comprando} onFechar={() => setComprando(null)} />}
    </>
  );
}
