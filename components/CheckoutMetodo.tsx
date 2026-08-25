"use client";

import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import type { Metodo } from "@/data/metodos";

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, { locale: "pt-BR" });

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
  metodo: Metodo;
  onFechar: () => void;
};

export default function CheckoutMetodo({ metodo, onFechar }: Props) {
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"formulario" | "aguardando" | "aprovado" | "erro">("formulario");
  const [resultado, setResultado] = useState<{ descricao?: string; video?: string | null; linkDownload?: string | null } | null>(null);
  const [mensagemErro, setMensagemErro] = useState("");
  const [copiado, setCopiado] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [emailCliente, setEmailCliente] = useState("");
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCliente);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, []);

  async function tentarEntrega(id: string, tentativa: number) {
    const MAX_TENTATIVAS = 10;
    try {
      const resp = await fetch("/api/entregar-metodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: id }),
      });
      const dados = await resp.json();

      if (dados.sucesso) {
        setResultado({ descricao: dados.descricao, video: dados.video, linkDownload: dados.linkDownload });
        setStatus("aprovado");
        return;
      }

      if (tentativa < MAX_TENTATIVAS) {
        setTimeout(() => tentarEntrega(id, tentativa + 1), 3000);
      } else {
        setStatus("erro");
        setMensagemErro("Pagamento aprovado, mas houve um problema na liberação. Fale com o suporte.");
      }
    } catch {
      if (tentativa < MAX_TENTATIVAS) {
        setTimeout(() => tentarEntrega(id, tentativa + 1), 3000);
      } else {
        setStatus("erro");
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
          tentarEntrega(id, 1);
        } else if (dados.status === "rejected" || dados.status === "cancelled") {
          if (intervaloRef.current) clearInterval(intervaloRef.current);
          setStatus("erro");
          setMensagemErro("Pagamento não aprovado. Tente novamente.");
        }
      } catch {
        // falha pontual — tenta de novo no próximo ciclo
      }
    }, 3000);
  }

  const aoEnviar = useCallback(
    async ({ formData }: any) => {
      try {
        const resp = await fetch("/api/pagamento-metodo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, metodoId: metodo.id, emailCliente }),
        });
        const dados = await resp.json();

        if (dados.erro) {
          setStatus("erro");
          setMensagemErro(dados.erro);
          return;
        }

        const qr = dados.point_of_interaction?.transaction_data;
        if (qr?.qr_code_base64) {
          setQrCodeBase64(qr.qr_code_base64);
          setQrCode(qr.qr_code);
          setStatus("aguardando");
          iniciarPolling(String(dados.id));
        } else if (dados.status === "approved") {
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
    [metodo.id, emailCliente]
  );

  const aoDarErro = useCallback((erro: any) => {
    console.error("[checkout-metodo] erro no brick:", erro);
    setStatus("erro");
    setMensagemErro("Erro ao carregar formulário de pagamento.");
  }, []);

  const initialization = useMemo(() => ({ amount: metodo.preco }), [metodo.preco]);
  const customization = useMemo(
    () => ({
      paymentMethods: { bankTransfer: "all" as const, creditCard: "all" as const, maxInstallments: 1 },
    }),
    []
  );

  function copiarCodigoPix() {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  const linkWhatsAppManual = useMemo(() => {
    const texto = `Olá! Paguei "${metodo.nome}" (R$ ${metodo.preco.toFixed(2).replace(".", ",")}) e não recebi o acesso. Podem verificar?`;
    return `https://wa.me/5581995716227?text=${encodeURIComponent(texto)}`;
  }, [metodo.nome, metodo.preco]);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center px-4">
      <div className="bg-[#0B0B0B] border border-yellow-500/30 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
        <button onClick={onFechar} className="absolute top-4 right-4 text-zinc-400 hover:text-white text-xl leading-none">
          ✕
        </button>

        <h3 className="text-white font-bold text-lg mb-1">{metodo.nome}</h3>
        <p className="text-zinc-400 text-sm mb-4">R$ {metodo.preco.toFixed(2).replace(".", ",")}</p>

        {status === "formulario" && (
          <>
            <div className="mb-4">
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">
                Seu e-mail (pra receber o link de download)
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={emailCliente}
                onChange={(e) => setEmailCliente(e.target.value.trim())}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-lg bg-black/40 border border-yellow-500/30 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-yellow-400"
              />
              {emailCliente.length > 0 && !emailValido && (
                <p className="text-red-400 text-xs mt-1">Digite um e-mail válido.</p>
              )}
            </div>

            {emailValido ? (
              <PaymentBrick
                initialization={initialization}
                customization={customization}
                onSubmit={aoEnviar}
                onError={aoDarErro}
              />
            ) : (
              <p className="text-zinc-500 text-xs text-center py-6">
                Preencha seu e-mail acima pra continuar com o pagamento.
              </p>
            )}
          </>
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

        {status === "aprovado" && (
          <div className="text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-white font-bold mb-3">Pagamento aprovado!</p>

            {resultado?.descricao && (
              <p className="text-zinc-300 text-sm text-left mb-3 bg-black/40 border border-yellow-500/20 rounded-xl p-3">
                {resultado.descricao}
              </p>
            )}

            {resultado?.video && (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-3 border border-white/10">
                <iframe src={resultado.video} title="Vídeo do método" className="w-full h-full" allowFullScreen />
              </div>
            )}

            {resultado?.linkDownload ? (
              <a
                href={resultado.linkDownload}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-yellow-400 px-5 py-3 text-sm font-bold text-black hover:opacity-90 transition mb-3"
              >
                ⬇️ Baixar arquivo
              </a>
            ) : resultado ? (
              <>
                <p className="text-zinc-400 text-sm mb-3">
                  Pagamento confirmado! Não conseguimos gerar o link automaticamente — fale com a gente que liberamos na hora.
                </p>
                <a
                  href={linkWhatsAppManual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-black hover:bg-emerald-400 transition mb-3"
                >
                  📲 Receber no WhatsApp
                </a>
              </>
            ) : null}

            {!resultado && mensagemErro && (
              <>
                <p className="text-zinc-400 text-sm mb-3">{mensagemErro}</p>
                <a
                  href={linkWhatsAppManual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-black hover:bg-emerald-400 transition mb-3"
                >
                  📲 Enviar dados no WhatsApp
                </a>
              </>
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
