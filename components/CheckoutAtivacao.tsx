"use client";

import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { createClient } from "@/lib/supabase-browser";
import PainelPagarComSaldo from "@/components/PainelPagarComSaldo";

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
  senha?: string;
  email: string;
  onFechar: () => void;
  // true só pro plano de Créditos do Moto M Tool — liberação automática via
  // GSM Cheap. Todo o resto continua no fluxo manual (WhatsApp) de sempre.
  automatico?: boolean;
};

export default function CheckoutAtivacao({
  ferramenta,
  duracao,
  preco,
  nome,
  username,
  senha,
  email,
  onFechar,
  automatico = false,
}: Props) {
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"formulario" | "aguardando" | "aprovado" | "erro">("formulario");
  const [mensagemErro, setMensagemErro] = useState<string>("");
  const [copiado, setCopiado] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cliente logado paga só com saldo (regra do site). null = ainda checando.
  const [logado, setLogado] = useState<boolean | null>(null);
  const [pagoComSaldoManual, setPagoComSaldoManual] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setLogado(!!data.user));
  }, []);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, []);

  // Só usado no plano automático: chama /api/entregar (mesma rota/lógica dos
  // aluguéis) até a GSM Cheap confirmar o crédito, ou desistir depois de um
  // tempo e cair pro aviso de "liberação em andamento, chega por e-mail".
  async function tentarEntrega(id: string, tentativa: number) {
    const MAX_TENTATIVAS = 12; // ~12 x 3s = 36s de tolerância

    try {
      const entrega = await fetch("/api/entregar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: id }),
      });
      const dadosEntrega = await entrega.json();

      if (dadosEntrega.sucesso || dadosEntrega.manual) {
        setStatus("aprovado");
        if (dadosEntrega.manual) {
          setMensagemErro(
            dadosEntrega.mensagem ||
              "Pagamento aprovado. Seu crédito está sendo liberado, você recebe a confirmação por e-mail."
          );
        }
        return;
      }

      if (dadosEntrega.reservando || dadosEntrega.processando) {
        if (tentativa < MAX_TENTATIVAS) {
          setTimeout(() => tentarEntrega(id, tentativa + 1), 3000);
        } else {
          setMensagemErro(
            "Seu crédito está sendo liberado e pode levar mais alguns instantes. Você recebe a confirmação por e-mail assim que ficar pronto."
          );
          setStatus("aprovado");
        }
        return;
      }

      if (tentativa < MAX_TENTATIVAS) {
        setTimeout(() => tentarEntrega(id, tentativa + 1), 3000);
      } else {
        setStatus("aprovado");
        setMensagemErro("Pagamento aprovado, mas houve um problema na liberação. Fale com o suporte.");
      }
    } catch {
      if (tentativa < MAX_TENTATIVAS) {
        setTimeout(() => tentarEntrega(id, tentativa + 1), 3000);
      } else {
        setStatus("aprovado");
        setMensagemErro("Pagamento aprovado, mas houve um problema na liberação. Fale com o suporte.");
      }
    }
  }

  function iniciarPolling(id: string) {
    intervaloRef.current = setInterval(async () => {
      try {
        const resp = await fetch(`/api/pagamento/status?id=${id}`);
        const dados = await resp.json();

        if (dados.status === "approved") {
          if (intervaloRef.current) clearInterval(intervaloRef.current);
          if (automatico) {
            // Liberação automática (GSM Cheap) — chama /api/entregar de verdade
            tentarEntrega(id, 1);
          } else {
            // Liberação é manual — o pagamento já ficou registrado no Supabase
            // pela rota /api/pagamento-ativacao
            setStatus("aprovado");
          }
        } else if (dados.status === "rejected" || dados.status === "cancelled") {
          if (intervaloRef.current) clearInterval(intervaloRef.current);
          setStatus("erro");
          setMensagemErro("Pagamento não aprovado. Tente novamente.");
        }
      } catch {
        // falha pontual de rede — tenta de novo no próximo ciclo, sem quebrar a tela
      }
    }, 3000);
  }

  const aoEnviar = useCallback(
    async ({ formData }: any) => {
      try {
        const resp = await fetch("/api/pagamento-ativacao", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, ferramenta, duracao, nome, username, senha, email }),
        });
        const dados = await resp.json();

        if (dados.erro) {
          setStatus("erro");
          setMensagemErro(dados.erro);
          return;
        }

        const qr = dados.point_of_interaction?.transaction_data;

        if (qr?.qr_code_base64) {
          // Pix: precisa escanear e a gente espera a confirmação de verdade via polling
          setQrCodeBase64(qr.qr_code_base64);
          setQrCode(qr.qr_code);
          setStatus("aguardando");
          iniciarPolling(String(dados.id));
        } else if (dados.status === "approved") {
          // Cartão aprovado na hora — aí sim já foi confirmado de verdade
          if (automatico) {
            tentarEntrega(String(dados.id), 1);
          } else {
            setStatus("aprovado");
          }
        } else if (dados.status === "in_process" || dados.status === "pending") {
          // Cartão em análise: espera confirmação, NÃO é aprovado ainda
          setStatus("aguardando");
          iniciarPolling(String(dados.id));
        } else {
          setStatus("erro");
          setMensagemErro("Não foi possível gerar o pagamento.");
        }
      } catch {
        setStatus("erro");
        setMensagemErro("Erro ao processar pagamento.");
      }
    },
    [ferramenta, duracao, nome, username, senha, email, automatico]
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
    const linhaUsername = username ? `\nUsername/HWID: ${username}` : "";
    const linhaSenha = senha ? `\nSenha: ${senha}` : "";
    const linhaEmail = email ? `\nE-mail: ${email}` : "";
    const texto = `Olá! Fiz o pagamento da ativação:\n\nFerramenta: ${ferramenta}\nPlano: ${duracao}\nNome: ${nome}${linhaUsername}${linhaSenha}${linhaEmail}`;
    return `https://wa.me/5581995716227?text=${encodeURIComponent(texto)}`;
  }, [ferramenta, duracao, nome, username, senha, email]);

  function copiarCodigoPix() {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

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

        {status === "formulario" && logado === true && (
          <PainelPagarComSaldo
            preco={preco}
            corpo={{ tipo: "ativacao", ferramenta, duracao, nome, username, senha, email }}
            onSucesso={(dados) => {
              if (dados.mensagem) setMensagemErro(dados.mensagem);

              if (automatico) {
                if (dados.estado === "concluido") {
                  setStatus("aprovado");
                  return;
                }
                // Ainda processando no fornecedor — continua pelo MESMO
                // polling já usado no fluxo Pix, reconsultando esse pedido.
                setStatus("aguardando");
                if (dados.paymentId) tentarEntrega(dados.paymentId, 1);
                return;
              }

              // Plano manual: já foi registrado e a equipe já foi notificada
              // automaticamente (sem depender de webhook nem de WhatsApp).
              setPagoComSaldoManual(true);
              setStatus("aprovado");
            }}
            onErro={(msg) => {
              setStatus("erro");
              setMensagemErro(msg);
            }}
          />
        )}

        {status === "formulario" && logado === false && (
          <PaymentBrick
            initialization={initialization}
            customization={customization}
            onSubmit={aoEnviar}
            onError={aoDarErro}
          />
        )}

        {status === "formulario" && logado === null && (
          <p className="text-zinc-500 text-xs text-center py-6">Carregando...</p>
        )}

        {status === "aguardando" && qrCodeBase64 && (
          <div className="text-center">
            <p className="text-amber-400 text-sm font-semibold mb-3">Escaneie o QR Code pra pagar</p>
            <img
              src={`data:image/png;base64,${qrCodeBase64}`}
              alt="QR Code Pix"
              className="mx-auto rounded-lg mb-3 w-56 h-56 bg-white p-2"
            />
            <button
              onClick={copiarCodigoPix}
              className="text-xs font-semibold text-black bg-yellow-400 rounded-lg px-3 py-1.5 hover:opacity-90 transition"
            >
              {copiado ? "Copiado!" : "Copiar código Pix"}
            </button>
            <p className="text-zinc-500 text-xs mt-4 animate-pulse">
              Aguardando confirmação do pagamento... não feche essa janela.
            </p>
          </div>
        )}

        {status === "aguardando" && !qrCodeBase64 && (
          <p className="text-amber-400 text-sm text-center animate-pulse">Confirmando pagamento...</p>
        )}

        {status === "aprovado" && automatico && (
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-white font-bold mb-3">Pagamento aprovado!</p>
            <p className="text-zinc-400 text-sm mb-4">
              {mensagemErro ||
                "Seu crédito foi liberado automaticamente na conta cadastrada. Você também recebe a confirmação por e-mail."}
            </p>
            <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-4 text-left text-sm space-y-2">
              <p className="break-words">
                <span className="text-gray-400">Ferramenta:</span>{" "}
                <span className="text-white font-semibold">{ferramenta}</span>
              </p>
              <p className="break-words">
                <span className="text-gray-400">Plano:</span>{" "}
                <span className="text-white font-semibold">{duracao}</span>
              </p>
              <p className="break-words">
                <span className="text-gray-400">E-mail:</span>{" "}
                <span className="text-white font-mono">{email}</span>
              </p>
            </div>

            {logado === true && (
              <a
                href="/minha-conta/ordens"
                className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-full border border-yellow-500/40 text-yellow-400 text-sm font-bold py-2.5 hover:bg-yellow-500/10 transition"
              >
                🧾 Ver na Ordem de Serviço
              </a>
            )}
          </div>
        )}

        {status === "aprovado" && !automatico && (
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-white font-bold mb-3">Pagamento aprovado!</p>
            <p className="text-zinc-400 text-sm mb-4">
              {pagoComSaldoManual
                ? "Pedido registrado e nossa equipe já foi notificada automaticamente. Você recebe a confirmação por e-mail."
                : "Confirma os dados abaixo e manda pra gente no WhatsApp pra liberarmos sua ativação."}
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
              {username && (
                <p className="break-words">
                  <span className="text-gray-400">Username/HWID:</span>{" "}
                  <span className="text-white font-mono">{username}</span>
                </p>
              )}
              {senha && (
                <p className="break-words">
                  <span className="text-gray-400">Senha:</span>{" "}
                  <span className="text-white font-mono">{senha}</span>
                </p>
              )}
              {email && (
                <p className="break-words">
                  <span className="text-gray-400">E-mail:</span>{" "}
                  <span className="text-white font-mono">{email}</span>
                </p>
              )}
            </div>

            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-black hover:bg-emerald-400 transition"
            >
              📲 Enviar dados no WhatsApp
            </a>

            {logado === true && (
              <a
                href="/minha-conta/ordens"
                className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-full border border-yellow-500/40 text-yellow-400 text-sm font-bold py-2.5 hover:bg-yellow-500/10 transition"
              >
                🧾 Ver na Ordem de Serviço
              </a>
            )}
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
