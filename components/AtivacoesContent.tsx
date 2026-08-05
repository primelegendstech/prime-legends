"use client";

import { useState } from "react";

const ferramentas = ["UnlockTool", "TSM Tool"];

const imagensPorFerramenta: Record<string, string[]> = {
  UnlockTool: ["/laptops/unlocktool-1.png", "/laptops/unlocktool-2.png"],
  "TSM Tool": ["/laptops/tsm-1.png", "/laptops/tsm-2.png"],
};

const planosPorFerramenta: Record<
  string,
  { nome: string; preco: number; destaque: boolean }[]
> = {
  UnlockTool: [
    { nome: "3 meses", preco: 109.9, destaque: false },
    { nome: "6 meses", preco: 149.9, destaque: true },
    { nome: "12 meses", preco: 234.9, destaque: true },
  ],
  "TSM Tool": [
    { nome: "3 meses", preco: 149.9, destaque: false },
    { nome: "6 meses", preco: 199.9, destaque: true },
    { nome: "12 meses", preco: 254.9, destaque: true },
  ],
};

const linksPorFerramenta: Record<string, { modelos: string; download: string; registro: string }> = {
  UnlockTool: {
    modelos: "https://unlocktool.net/models/",
    download: "https://file.unlocktool.net/",
    registro: "https://unlocktool.net/register/",
  },
  "TSM Tool": {
    modelos: "URL_MODELOS_TSM",
    download: "URL_DOWNLOAD_TSM",
    registro: "URL_REGISTRO_TSM",
  },
};

export default function AtivacoesContent() {
  const [ativo, setAtivo] = useState(ferramentas[0]);
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const planos = planosPorFerramenta[ativo];
  const imagens = imagensPorFerramenta[ativo];
  const links = linksPorFerramenta[ativo];

  const dadosCompletos = nome.trim() !== "" && username.trim() !== "" && email.trim() !== "";

  async function pagar(nomePlano: string, preco: number) {
    if (!dadosCompletos) {
      setErro("Preencha nome, username e e-mail cadastrados na ferramenta antes de continuar.");
      return;
    }
    setErro(null);
    setCarregando(nomePlano);
    try {
      const resposta = await fetch("/api/checkout-ativacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ferramenta: ativo,
          duracao: nomePlano,
          nome,
          username,
          email,
        }),
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
            ATIVAÇÃO <span className="text-yellow-400 italic">DE LICENÇA</span>
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {ferramentas.map((nomeFerramenta) => (
            <button
              key={nomeFerramenta}
              onClick={() => setAtivo(nomeFerramenta)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                ativo === nomeFerramenta
                  ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
            >
              {nomeFerramenta}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-start mb-12">
        <div className="flex justify-start">
          <img
            src={imagens[0]}
            alt={`Tela do ${ativo}`}
            className="w-full max-w-md rounded-xl"
          />
        </div>

        <div className="bg-white/[0.03] border border-yellow-500/20 rounded-2xl p-6">
          <h3 className="text-2xl font-black text-white mb-3">{ativo}</h3>

          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <a
              href={links.modelos}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              Ver modelos suportados ➤
            </a>
            <a
              href={links.download}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              Baixar {ativo} ➤
            </a>
          </div>

          <div className="bg-black/30 border border-yellow-500/10 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-300 mb-3">
              Antes de ativar, você precisa ter uma conta criada no site oficial do{" "}
              {ativo}.{" "}
              <a
                href={links.registro}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 underline"
              >
                Registre-se aqui ➤
              </a>
            </p>

            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              />
              <input
                type="text"
                placeholder={`Username cadastrado no ${ativo}`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              />
              <input
                type="email"
                placeholder="E-mail cadastrado na ferramenta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              />
            </div>

            {erro && <p className="text-red-400 text-xs mt-2">{erro}</p>}
          </div>

          <div className="divide-y divide-white/10">
            {planos.map((plano) => (
              <div key={plano.nome} className="flex items-center justify-between py-4">
                <div>
                  <p className="text-white font-semibold">
                    {plano.nome}
                    {plano.destaque && (
                      <span className="ml-2 text-xs font-bold text-black bg-yellow-400 rounded-full px-2 py-0.5">
                        POPULAR
                      </span>
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">Licença completa</p>
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
