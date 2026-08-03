"use client";

import { useState, useEffect } from "react";

const ferramentas = ["UnlockTool", "TSM Tool", "AMT Tool", "Samsung Tool", "Griffin-Unlocker"];

const imagensPorFerramenta: Record<string, string[]> = {
  UnlockTool: ["/laptops/unlocktool-1.png", "/laptops/unlocktool-2.png"],
  "TSM Tool": ["/laptops/tsm-1.png", "/laptops/tsm-2.png"],
  "AMT Tool": ["/laptops/amt-1.png", "/laptops/amt-2.png"],
  "Samsung Tool": ["/laptops/samsung-1.png", "/laptops/samsung-2.png"],
 "Griffin-Unlocker": ["/laptops/griffin-1.png", "/laptops/griffin-2.png"],
};

const planosPorFerramenta: Record<
  string,
  { nome: string; preco: number; destaque: boolean }[]
> = {
  UnlockTool: [
    { nome: "6 horas", preco: 5, destaque: true },
    { nome: "12 horas", preco: 9, destaque: false },
    { nome: "48 horas", preco: 18, destaque: true },
    { nome: "120 horas", preco: 30, destaque: false },
  ],
  "TSM Tool": [
    { nome: "3 horas", preco: 5, destaque: false },
    { nome: "12 horas", preco: 9, destaque: true },
    { nome: "48 horas", preco: 18, destaque: true },
    { nome: "168 horas", preco: 35, destaque: false },
  ],
  "AMT Tool": [
    { nome: "2 horas", preco: 5, destaque: false },
    { nome: "3 horas", preco: 6, destaque: true },
    { nome: "5 horas", preco: 8, destaque: false },
    { nome: "12 horas", preco: 10, destaque: true },
  ],
  "Samsung Tool": [
    { nome: "12 horas", preco: 15, destaque: true },
    { nome: "24 horas", preco: 20, destaque: true },
    { nome: "48 horas", preco: 30, destaque: false },
    { nome: "72 horas", preco: 35, destaque: false },
  ],
  "Griffin-Unlocker": [
    { nome: "6 horas", preco: 9, destaque: true },
    { nome: "12 horas", preco: 14, destaque: true },
    { nome: "24 horas", preco: 18, destaque: false },
  ],
};

export default function AlugueisContent() {
  const [ativo, setAtivo] = useState(ferramentas[0]);
  const [indiceImagem, setIndiceImagem] = useState(0);
  const [carregando, setCarregando] = useState<string | null>(null);
  const planos = planosPorFerramenta[ativo];
  const imagens = imagensPorFerramenta[ativo];

  useEffect(() => {
    setIndiceImagem(0);
    const intervalo = setInterval(() => {
      setIndiceImagem((prev) => (prev + 1) % imagens.length);
    }, 3000);
    return () => clearInterval(intervalo);
  }, [ativo, imagens.length]);

  async function pagar(nomePlano: string, preco: number) {
    setCarregando(nomePlano);
    try {
      const resposta = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ferramenta: ativo, duracao: nomePlano }),
      });
      const dados = await resposta.json();
      if (dados.url) {
        window.location.href = dados.url;
      } else {
        alert("Erro ao gerar pagamento. Tente novamente.");
        setCarregando(null);
      }
    } catch (erro) {
      alert("Erro ao gerar pagamento. Tente novamente.");
      setCarregando(null);
    }
  }

  return (
    <>
      <div className="max-w-5xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1.5 h-6 bg-yellow-400 rounded-full" />
          <h2 className="text-xl md:text-2xl font-bold text-white">
            ALUGUÉIS <span className="text-yellow-400 italic">TEMPORÁRIOS</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {ferramentas.map((nome) => (
            <button
              key={nome}
              onClick={() => setAtivo(nome)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                ativo === nome
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
            >
              {nome}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center mb-12">
        <div className="flex justify-start">
          <img
            key={`${ativo}-${indiceImagem}`}
            src={imagens[indiceImagem]}
            alt={`Tela do ${ativo}`}
            className="fade-in w-full max-w-md rounded-xl"
          />
        </div>

        <div className="bg-white/[0.03] border border-yellow-500/20 rounded-2xl p-6">
          <h3 className="text-2xl font-black text-white mb-3 flex items-center gap-2">
  {ativo}
  {ativo === "Samsung Tool" && (
    <span className="text-sm font-semibold text-yellow-400 border border-yellow-400 px-2 py-0.5 rounded">
      CellTool
    </span>
  )}
</h3>
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <a href="#" className="text-yellow-400 hover:text-yellow-300 transition">
              Ver modelos suportados ➤
            </a>
            <a href="#" className="text-yellow-400 hover:text-yellow-300 transition">
              Baixar {ativo} ➤
            </a>
          </div>

          <div className="divide-y divide-white/10">
            {planos.map((plano) => (
              <div key={plano.nome} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-white font-semibold">
                    Alugar {plano.nome}
                    {plano.destaque && (
                      <span className="ml-2 text-xs font-bold text-black bg-yellow-400 rounded-full px-2 py-0.5">
                        POPULAR
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">Login e senha</p>
                </div>
                <button
                  onClick={() => pagar(plano.nome, plano.preco)}
                  disabled={carregando === plano.nome}
                  className="px-5 py-2 rounded-full font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 transition text-sm whitespace-nowrap disabled:opacity-50"
                >
                  {carregando === plano.nome
                    ? "Aguarde..."
                    : `R$ ${plano.preco.toFixed(2).replace(".", ",")}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}