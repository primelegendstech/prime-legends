"use client";

import { useEffect, useRef, useState } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { formatarCredenciais } from "@/lib/formatar-credenciais";

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, { locale: "pt-BR" });

type Props = {
  ferramenta: string;
  duracao: string;
  preco: number;
  onFechar: () => void;
};

export default function CheckoutPix({ ferramenta, duracao, preco, onFechar }: Props) {
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"formulario" | "aguardando" | "aprovado" | "erro">("formulario");
  const [credenciais, setCredenciais] = useState<any>(null);
  const [codigo, setCodigo] = useState<string>("");
  const [mensagemErro, setMensagemErro] = useState<string>("");
  const [copiado, setCopiado] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, []);

  async function iniciarPolling(id: string) {
    intervaloRef.current = setInterval(async () => {
      try {
        const resp = await fetch(`/api/pagamento/status?id=${id}`);
        const dados = await resp.json();

        if (dados.status === "approved") {
          if (intervaloRef.current) clearInterval(intervaloRef.current);

          const entrega = await fetch("/api/entregar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: id }),
          });
          const dadosEntrega = await entrega.json();

          if (dadosEntrega.codigo) setCodigo(dadosEntrega.codigo);
          if (dadosEntrega.sucesso) {
            setCredenciais(dadosEntrega.dados);
            setStatus("aprovado");
          } else if (dadosEntrega.manual) {
            setMensagemErro(dadosEntrega.mensagem || "");
            setStatus("aprovado");
          } else {
            setStatus("erro");
            setMensagemErro("Pagamento aprovado, mas houve um problema na liberação. Fale com o suporte.");
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

  async function aoEnviar({ formData }: any) {
    try {
      const resp = await fetch("/api/pagamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, ferramenta, duracao }),
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
  }

  function copiarCodigoPix() {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  const credenciaisFormatadas = credenciais ? formatarCredenciais(credenciais) : null;

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
          Aluguel {duracao} — R$ {preco.toFixed(2).replace(".", ",")}
        </p>

        {status === "formulario" && (
          <Payment
            initialization={{ amount: preco }}
            customization={{
              paymentMethods: {
                bankTransfer: "all",
                creditCard: "all",
                maxInstallments: 1,
              },
            }}
            onSubmit={aoEnviar}
            onError={(erro) => {
              console.error("[brick] erro:", erro);
              setStatus("erro");
              setMensagemErro("Erro ao carregar formulário de pagamento.");
            }}
          />
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

            {credenciaisFormatadas && (
              <div className="bg-black/40 border border-yellow-500/30 rounded-xl p-4 mb-3 text-left text-sm space-y-2">
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

            {!credenciaisFormatadas && mensagemErro && (
              <p className="text-zinc-400 text-sm mb-3">{mensagemErro}</p>
            )}

            {codigo && <p className="text-zinc-500 text-xs">Código do pedido: {codigo}</p>}
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
