"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";

function ConteudoConsultar() {
  const params = useSearchParams();
  const router = useRouter();
  const codigoUrl = params.get("codigo") || "";

  const [codigoDigitado, setCodigoDigitado] = useState(codigoUrl);
  const [status, setStatus] = useState<"vazio" | "carregando" | "sucesso" | "manual" | "erro">(
    codigoUrl ? "carregando" : "vazio"
  );
  const [credenciais, setCredenciais] = useState<any>(null);
  const [servico, setServico] = useState<{ ferramenta?: string; duracao?: string } | null>(null);
  const [mensagem, setMensagem] = useState("");

  async function buscar(codigo: string) {
    if (!codigo) return;
    setStatus("carregando");
    try {
      const resposta = await fetch(`/api/consultar?codigo=${encodeURIComponent(codigo)}`);
      const dados = await resposta.json();

      if (dados.servico) setServico(dados.servico);

      if (dados.sucesso) {
        setCredenciais(dados.dados);
        setStatus("sucesso");
      } else if (dados.manual) {
        setMensagem(dados.mensagem || "");
        setStatus("manual");
      } else {
        setStatus("erro");
      }
    } catch {
      setStatus("erro");
    }
  }

  useEffect(() => {
    if (codigoUrl) buscar(codigoUrl);
  }, [codigoUrl]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const codigoLimpo = codigoDigitado.trim();
    if (!codigoLimpo) return;
    // Atualiza a URL também, assim o cliente pode salvar/compartilhar o link direto
    router.push(`/consultar?codigo=${encodeURIComponent(codigoLimpo)}`);
    buscar(codigoLimpo);
  }

  const numeroWhatsApp = "5581995716227";
  const nomeServico = servico?.ferramenta ? `${servico.ferramenta} - Aluguel ${servico.duracao}` : "meu pedido";
  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(
    `Olá! Estou consultando meu pedido de ${nomeServico}${
      codigoDigitado ? ` (código ${codigoDigitado})` : ""
    } e preciso de ajuda.`
  )}`;

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/[0.03] border border-yellow-500/20 rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/logo.png" alt="Prime Legends GSM" className="w-8 h-8 object-contain" />
          <span className="bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent font-black tracking-wide text-sm">
            PRIME LEGENDS GSM
          </span>
        </div>

        <h1 className="text-xl font-bold mb-4">Consulta do seu pedido</h1>

        {/* Campo pra digitar o código manualmente, sempre visível */}
        <form onSubmit={handleSubmit} className="mb-6">
          <label className="block text-left text-sm text-gray-400 mb-2">
            Cole aqui o código do seu pedido (você recebeu ele por e-mail):
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={codigoDigitado}
              onChange={(e) => setCodigoDigitado(e.target.value)}
              placeholder="ex: a8f3k29x-xxxx-xxxx"
              className="flex-1 rounded-xl bg-black/40 border border-yellow-500/30 px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
            />
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 font-bold text-black text-sm hover:opacity-90 transition"
            >
              Buscar
            </button>
          </div>
        </form>

        {status === "vazio" && (
          <p className="text-gray-500 text-sm mb-6">
            Digite o código do seu pedido acima pra ver seu acesso.
          </p>
        )}

        {status === "carregando" && <p className="text-amber-400 text-sm mb-6 animate-pulse">Buscando...</p>}

        {status === "sucesso" && (
          <>
            <p className="text-gray-400 mb-2">
              <span className="text-white font-semibold">{nomeServico}</span>
            </p>
            <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-4 mb-6 text-left text-sm">
              <p className="text-yellow-400 font-bold mb-2">✅ Seu acesso:</p>
              <pre className="text-gray-200 whitespace-pre-wrap break-words">
                {JSON.stringify(credenciais, null, 2)}
              </pre>
            </div>
          </>
        )}

        {status === "manual" && (
          <p className="text-gray-400 mb-6">
            {mensagem || "Seu pedido ainda está em processo de liberação manual."} Fale com nosso suporte
            pelo botão abaixo.
          </p>
        )}

        {status === "erro" && (
          <p className="text-gray-400 mb-6">Não encontramos esse pedido. Confere se o código está certo, ou fale com nosso suporte.</p>
        )}

        {status !== "vazio" && (
          <a
            href={linkWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 font-bold text-black transition hover:opacity-90"
          >
            💬 Falar no WhatsApp
          </a>
        )}

        <Link
          href="/"
          className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-xl border border-yellow-500/30 px-6 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400/10"
        >
          🏠 Voltar ao início
        </Link>
      </div>
    </main>
  );
}

export default function Consultar() {
  return (
    <Suspense fallback={null}>
      <ConteudoConsultar />
    </Suspense>
  );
}
