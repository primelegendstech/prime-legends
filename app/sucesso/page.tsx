"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";

function ConteudoSucesso() {
  const params = useSearchParams();
  const servico = params.get("servico") || "seu serviço";
  const valor = params.get("valor") || "";
  const operacao = params.get("payment_id") || params.get("collection_id") || "";

  const numeroWhatsApp = "5581995716227";
  const mensagem = `Olá! Acabei de pagar o *${servico}*${
    valor ? ` no valor de R$ ${valor}` : ""
  }.${operacao ? ` Número da operação: ${operacao}.` : ""} Podem me enviar o acesso?`;

  const linkWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white/[0.03] border border-yellow-500/20 rounded-2xl p-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <img src="/logo.png" alt="Prime Legends GSM" className="w-8 h-8 object-contain" />
          <span className="bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent font-black tracking-wide text-sm">
            PRIME LEGENDS GSM
          </span>
        </div>

        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Pagamento aprovado!</h1>
        <p className="text-gray-400 mb-2">
          Obrigado pela confiança! Seu pagamento de{" "}
          <span className="text-white font-semibold">{servico}</span> foi confirmado.
        </p>
        <p className="text-gray-400 mb-6">
          Clique no botão abaixo para falar com nosso suporte e receber seu acesso.
        </p>

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
          Você já pode fechar esta janela após enviar a mensagem no WhatsApp.
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
