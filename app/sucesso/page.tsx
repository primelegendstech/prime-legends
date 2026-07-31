"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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
        <div className="text-5xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Pagamento aprovado!</h1>
        <p className="text-gray-400 mb-6">
          Seu pagamento de <span className="text-white font-semibold">{servico}</span> foi
          confirmado. Clique no botão abaixo para falar com nosso suporte e receber seu acesso.
        </p>
        <a
          href={linkWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-3 font-bold text-black transition hover:opacity-90"
        >
          💬 Falar no WhatsApp
        </a>
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