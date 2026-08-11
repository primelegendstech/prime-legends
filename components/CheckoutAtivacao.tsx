"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, { locale: "pt-BR" });

// Isolado com memo: só re-renderiza (e só recria o Brick) se initialization/customization/
// onSubmit/onError mudarem de verdade — evita o loop de recriação do Brick.
const PaymentBrick = memo(function PaymentBrick({
  initialization,
  customization,
  onSubmit,
  onError,
}: {
  initialization: { amount: number };
  customization: any;
  onSubmit: (data: any) => Promise<unknown>;
  onError: (erro: any) => void;
}) {
  return (
    <Payment
      initialization={initialization}
      customization={customization}
      onSubmit={onSubmit}
      onError={onError}
    />
  );
});

type Props = {
  ferramenta: string;
  duracao: string;
  preco: number;
  nome: string;
  username: string;
  email: string;
  onFechar: () => void;
};

export default function CheckoutAtivacao({
  ferramenta,
  duracao,
  preco,
  nome,
  username,
  email,
  onFechar,
}: Props) {
  const [status, setStatus] = useState<"formulario" | "processando" | "aprovado" | "erro">("formulario");
  const [mensagemErro, setMensagemErro] = useState<string>("");

  const aoEnviar = useCallback(
    async ({ formData }: any) => {
      setStatus("processando");
      try {
        const resp = await fetch("/api/pagamento-ativacao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, ferramenta, duracao, nome, username, email }),
        });
        const dados = await resp.json();

        if (dados.erro) {
          setStatus("erro");
          setMensagemErro(dados.erro);
          return;
        }

        if (dados.status === "approved" || dados.status === "pending" || dados.status === "in_process") {
          // Liberação é manual (GSM Africa) — o pagamento já ficou registrado
          // no Supabase pela rota /api/pagamento-ativacao
          setStatus("aprovado");
        } else {
          setStatus("erro");
          setMensagemErro("Pagamento não aprovado. Tente novamente.");
        }
      } catch {
        setStatus("erro");
        setMensagemErro("Erro ao processar pagamento.");
      }
    },
    [ferramenta, duracao, nome, username, email]
  );

  const aoDarErro = useCallback((erro: any) => {
    console.error("[brick ativacao] erro:", erro);
    setStatus("erro");
    setMensagemErro("Erro ao carregar formulário de pagamento.");
  }, []);

  // Referências estáveis: sem isso, o Brick recria a cada render e entra em loop
  const initialization = useMemo(() => ({ amount: preco }), [preco]);

  const customization = useMemo(
    () => ({
      paymentMethods: {
        bankTransfer: "all" as const,
        creditCard: "all" as const,
        maxInstallments: 1,
      },
    }),
    []
  );

  const linkWhatsApp = useMemo(() => {
    const texto = `Olá! Fiz o pagamento da ativação:\n\nFerramenta: ${ferramenta}\nPlano: ${duracao}\nNome: ${nome}\nUsername: ${username}\nE-mail: ${email}`;
    return `https://wa.me/5581995716227?text=${encodeURIComponent(texto)}`;
  }, [ferramenta, duracao, nome, username, email]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4">
      <div className="bg-[#0B0B0B] border border-yellow-500/30 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl leading-none"
        >
          ✕
        </button>

        <h3 className="text-white font-bold text-lg mb-1">{ferramenta}</h3>
        <p className="text-zinc-400 text-sm mb-4">
          Ativação {duracao} — R$ {preco.toFixed(2).replace(".", ",")}
        </p>

        {status === "formulario" && (
          <PaymentBrick
            initialization={initialization}
            customization={customization}
            onSubmit={aoEnviar}
            onError={aoDarErro}
          />
        )}

        {status === "processando" && (
          <p className="text-amber-400 text-sm text-center animate-pulse">Processando pagamento...</p>
        )}

        {status === "aprovado" && (
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-white font-bold mb-3">Pagamento recebido!</p>
            <p className="text-zinc-400 text-sm mb-4">
              Confirma os dados abaixo e manda pra gente no WhatsApp pra liberarmos sua ativação.
            </p>

            <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-4 mb-4 text-left text-sm space-y-2">
              <p className="break-words">
                <span className="text-gray-400">Ferramenta:</span>{" "}
                <span className="text-white font-semibold">{ferramenta}</span>
              </p>
              <p className="break-words">
                <span className="text-gray-400">Plano:</span>{" "}
                <span className="text-white font-semibold">{duracao}</span>
              </p>
              <p className="break-words">
                <span className="text-gray-400">Nome:</span>{" "}
                <span className="text-white font-mono">{nome}</span>
              </p>
              <p className="break-words">
                <span className="text-gray-400">Username:</span>{" "}
                <span className="text-white font-mono">{username}</span>
              </p>
              <p className="break-words">
                <span className="text-gray-400">E-mail:</span>{" "}
                <span className="text-white font-mono">{email}</span>
              </p>
            </div>

            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-black hover:bg-emerald-400 transition"
            >
              📲 Enviar dados no WhatsApp
            </a>
          </div>
        )}

        {status === "erro" && (
          <div className="text-center">
            <p className="text-red-400 font-semibold mb-2">Algo deu errado</p>
            <p className="text-zinc-400 text-sm">{mensagemErro}</p>
          </div>
        )}
      </div>
    </div>
  );
}
