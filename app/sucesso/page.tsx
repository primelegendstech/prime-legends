"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { formatarCredenciais } from "@/lib/formatar-credenciais";

function ConteudoSucesso() {
  const params = useSearchParams();
  const paymentId = params.get("payment_id") || params.get("collection_id") || "";

  const [status, setStatus] = useState<"carregando" | "automatico" | "manual" | "erro">("carregando");
  const [credenciais, setCredenciais] = useState<any>(null);
  const [codigo, setCodigo] = useState<string>("");
  const [copiado, setCopiado] = useState(false);
  const [servico, setServico] = useState<{ ferramenta?: string; duracao?: string; preco?: number } | null>(
    null
  );
  const [mensagemErro, setMensagemErro] = useState<string>("");

  useEffect(() => {
    if (!paymentId) {
      setStatus("erro");
      return;
    }

    let cancelado = false;
    const MAX_TENTATIVAS = 12; // ~12 x 3s = 36s de tolerância antes do fallback manual

    // /api/entregar é idempotente (nunca recria pedido já existente), então é
    // seguro chamar de novo — é assim que resolvemos o pedido enquanto ele
    // ainda está "reservando" (corrida com o webhook) ou "processando"
    // (fornecedor ainda gerando o código), sem mostrar erro cedo demais.
    async function entregar(tentativa: number) {
      try {
        const resposta = await fetch("/api/entregar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        const dados = await resposta.json();
        if (cancelado) return;

        if (dados.servico) setServico(dados.servico);
        if (dados.codigo) setCodigo(dados.codigo);

        if (dados.sucesso) {
          setCredenciais(dados.dados);
          setStatus("automatico");
          return;
        }

        if (dados.manual) {
          setMensagemErro(dados.mensagem || "");
          setStatus("manual");
          return;
        }

        if (dados.reservando || dados.processando) {
          if (tentativa < MAX_TENTATIVAS) {
            setTimeout(() => entregar(tentativa + 1), 3000);
          } else {
            setMensagemErro(
              "Seu acesso está sendo gerado e pode levar mais alguns instantes. Você também vai receber por e-mail assim que ficar pronto."
            );
            setStatus("manual");
          }
          return;
        }

        if (tentativa < MAX_TENTATIVAS) {
          setTimeout(() => entregar(tentativa + 1), 3000);
        } else {
          setStatus("erro");
        }
      } catch {
        if (cancelado) return;
        if (tentativa < MAX_TENTATIVAS) {
          setTimeout(() => entregar(tentativa + 1), 3000);
        } else {
          setStatus("erro");
        }
      }
    }
    entregar(1);

    return () => {
      cancelado = true;
    };
  }, [paymentId]);

  const numeroWhatsApp = "5581995716227";
  const nomeServico = servico?.ferramenta ? `${servico.ferramenta} - Aluguel ${servico.duracao}` : "meu pedido";
  const linkConsulta = codigo ? `${typeof window !== "undefined" ? window.location.origin : ""}/consultar?codigo=${codigo}` : "";

  const mensagem =
    status === "manual" && mensagemErro
      ? `Olá! Paguei o *${nomeServico}* (pedido ${paymentId}), mas o sistema não conseguiu liberar automaticamente (motivo: ${mensagemErro}). Podem liberar meu acesso manualmente? Meu código de pedido: ${codigo}`
      : `Olá! Acabei de pagar o *${nomeServico}*${
          servico?.preco ? ` no valor de R$ ${servico.preco}` : ""
        }.${paymentId ? ` Número da operação: ${paymentId}.` : ""} Podem me enviar o acesso?`;

  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

  const credenciaisFormatadas = credenciais ? formatarCredenciais(credenciais) : null;

  function copiarCodigo() {
    if (!codigo) return;
    navigator.clipboard.writeText(codigo).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/[0.03] border border-yellow-500/20 rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/logo.png" alt="Prime Legends GSM" className="w-8 h-8 object-contain" />
          <span className="bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent font-black tracking-wide text-sm">
            PRIME LEGENDS GSM
          </span>
        </div>

        <div className="flex justify-center mb-4">
          <div className="relative flex items-center justify-center w-16 h-16">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-30 animate-ping" />
            <span className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Pagamento aprovado!</h1>
        <p className="text-gray-400 mb-2">
          Obrigado pela confiança! Seu pagamento de{" "}
          <span className="text-white font-semibold">{nomeServico}</span> foi confirmado.
        </p>

        {status === "carregando" && (
          <p className="text-amber-400 text-sm mb-6 animate-pulse">Liberando seu acesso...</p>
        )}

        {status === "automatico" && credenciaisFormatadas && (
          <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-4 mb-4 text-left text-sm space-y-2">
            <p className="text-yellow-400 font-bold mb-2">✅ Seu acesso:</p>

            {credenciaisFormatadas.login && (
              <p className="break-words">
                <span className="text-gray-400">Login:</span>{" "}
                <span className="text-white font-mono">{credenciaisFormatadas.login}</span>
              </p>
            )}
            {credenciaisFormatadas.senha && (
              <p className="break-words">
                <span className="text-gray-400">Senha:</span>{" "}
                <span className="text-white font-mono">{credenciaisFormatadas.senha}</span>
              </p>
            )}
            {credenciaisFormatadas.linhas.map((linha, i) => (
              <p key={i} className="break-words">
                <span className="text-gray-400">{linha.label}:</span>{" "}
                <span className="text-white font-mono">{linha.valor}</span>
              </p>
            ))}
          </div>
        )}

        {status === "manual" && (
          <p className="text-gray-400 mb-4">
            Seu pagamento foi aprovado, mas a liberação automática não está disponível no momento.
            Clique no botão abaixo para falar com nosso suporte e receber seu acesso.
          </p>
        )}

        {status === "erro" && (
          <p className="text-gray-400 mb-4">
            Não conseguimos confirmar seu pedido automaticamente. Clique no botão abaixo para falar
            com nosso suporte e receber seu acesso.
          </p>
        )}

        {/* Código do pedido — sempre visível quando disponível, é o jeito do cliente
            consultar de novo depois, independente de o e-mail ter chegado ou não */}
        {codigo && (
          <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-4 mb-6 text-left text-sm">
            <p className="text-gray-400 mb-1">Guarde o código do seu pedido:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-yellow-300 font-mono text-xs break-all">{codigo}</code>
              <button
                onClick={copiarCodigo}
                className="shrink-0 text-xs font-semibold text-black bg-yellow-400 rounded-lg px-2 py-1 hover:opacity-90 transition"
              >
                {copiado ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <Link href={`/consultar?codigo=${codigo}`} className="mt-2 inline-block text-xs text-yellow-400 underline">
              Ver esta página de consulta a qualquer momento →
            </Link>
          </div>
        )}

        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 font-bold text-black transition hover:opacity-90"
        >
          💬 Falar no WhatsApp
        </a>

        <Link
          href="/"
          className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-xl border border-yellow-500/30 px-6 py-3 font-semibold text-yellow-400 transition hover:bg-yellow-400/10"
        >
          🏠 Voltar ao início
        </Link>

        <p className="mt-6 text-xs text-gray-500">
          Guarde o código acima — ele é a forma mais rápida de consultar seu acesso depois, mesmo se o e-mail não chegar.
        </p>
      </div>
    </main>
  );
}

export default function Sucesso() {
  return (
    <Suspense fallback={null}>
      <ConteudoSucesso />
    </Suspense>
  );
}
