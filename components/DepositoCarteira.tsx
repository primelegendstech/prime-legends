"use client";

import { useEffect, useRef, useState, useMemo, memo } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, { locale: "pt-BR" });

const PaymentBrick = memo(function PaymentBrick({
  initialization,
  onSubmit,
  onError,
}: {
  initialization: { amount: number };
  onSubmit: (data: any) => Promise<unknown>;
  onError: (erro: any) => void;
}) {
  return (
    <Payment
      initialization={initialization}
      customization={{ paymentMethods: { bankTransfer: "all", } }}
      onSubmit={onSubmit}
      onError={onError}
    />
  );
});

const VALORES_SUGERIDOS = [5, 10, 20, 50, 100];

type Props = {
  onFechar: () => void;
  onSucesso: () => void;
  variante?: "modal" | "pagina";
};

export default function DepositoCarteira({ onFechar, onSucesso, variante = "modal" }: Props) {
  const [valor, setValor] = useState<number>(50);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"formulario" | "aguardando" | "aprovado" | "erro">("formulario");
  const [mensagemErro, setMensagemErro] = useState("");
  const [copiado, setCopiado] = useState(false);
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, []);

  function iniciarPolling(paymentId: string) {
    intervaloRef.current = setInterval(async () => {
      const resp = await fetch(`/api/pagamento/status?id=${paymentId}`);
      const dados = await resp.json();

      if (dados.status === "approved") {
        if (intervaloRef.current) clearInterval(intervaloRef.current);
        setStatus("aprovado");
        onSucesso();
      } else if (dados.status === "rejected" || dados.status === "cancelled") {
        if (intervaloRef.current) clearInterval(intervaloRef.current);
        setMensagemErro("Pagamento não aprovado. Tente novamente.");
        setStatus("erro");
      }
    }, 3000);
  }

  const initialization = useMemo(() => ({ amount: valor }), [valor]);

  async function aoEnviar({ formData }: any) {
    try {
      const resp = await fetch("/api/carteira/depositar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, valorCentavos: Math.round(valor * 100) }),
      });
      const dados = await resp.json();

      if (dados.erro) {
        setMensagemErro(dados.erro);
        setStatus("erro");
        return;
      }

      const pix = dados.point_of_interaction?.transaction_data;
      if (pix) {
        setQrCodeBase64(pix.qr_code_base64);
        setQrCode(pix.qr_code);
        setStatus("aguardando");
        iniciarPolling(String(dados.id));
      }
    } catch {
      setMensagemErro("Erro ao processar pagamento. Tente novamente.");
      setStatus("erro");
    }
  }

  function aoDarErro(erro: any) {
    console.error("[deposito] erro no brick:", erro);
  }

  function copiarCodigo() {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const conteudo = (
    <div
      className={
        variante === "modal"
          ? "bg-zinc-900 border border-yellow-500/20 rounded-xl w-full max-w-sm p-5 relative max-h-[90vh] overflow-y-auto"
          : "bg-zinc-900 border border-yellow-500/20 rounded-xl w-full max-w-sm p-5 relative mx-auto"
      }
    >
      {variante === "modal" && (
        <button
          onClick={onFechar}
          className="absolute top-3 right-3 text-zinc-400 hover:text-white text-xl leading-none"
          aria-label="Fechar"
        >
          ×
        </button>
      )}

      <h2 className="text-white font-bold text-lg mb-1">Adicionar saldo</h2>
      <p className="text-zinc-400 text-xs mb-4">Pagamento via Pix, cai na hora.</p>

      {status === "formulario" && (
        <>
          <div className="mb-4">
            <label className="block text-zinc-400 text-xs font-semibold mb-1.5">Valor</label>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {VALORES_SUGERIDOS.map((v) => (
                <button
                  key={v}
                  onClick={() => setValor(v)}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${
                    valor === v
                      ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                      : "bg-black/40 border border-yellow-500/20 text-zinc-300 hover:border-yellow-500/50"
                  }`}
                >
                  R$ {v}
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              step={1}
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
              className="w-full rounded-lg bg-black/40 border border-yellow-500/30 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-yellow-400"
            />
            <p className="text-zinc-600 text-[11px] mt-1">Valor mínimo: R$ 1,00</p>
          </div>

          {valor >= 1 ? (
            <PaymentBrick initialization={initialization} onSubmit={aoEnviar} onError={aoDarErro} />
          ) : (
            <p className="text-zinc-500 text-xs text-center py-6">
              O valor mínimo pra depósito é R$ 1,00.
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
            className="w-48 h-48 mx-auto rounded-lg bg-white p-2"
          />
          <button
            onClick={copiarCodigo}
            className="mt-4 w-full rounded-lg bg-black/40 border border-yellow-500/30 text-zinc-200 text-xs py-2.5 hover:border-yellow-500/60 transition"
          >
            {copiado ? "Código copiado!" : "Copiar código Pix"}
          </button>
          <p className="text-zinc-500 text-xs mt-3">Aguardando confirmação do pagamento...</p>
        </div>
      )}

      {status === "aprovado" && (
        <div className="text-center py-6">
          <p className="text-emerald-400 text-2xl mb-2">✓</p>
          <p className="text-white font-semibold">Saldo adicionado!</p>
        </div>
      )}

      {status === "erro" && (
        <div className="text-center py-6">
          <p className="text-red-400 text-sm">{mensagemErro}</p>
          <button
            onClick={() => setStatus("formulario")}
            className="mt-4 text-yellow-400 text-sm hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );

  if (variante === "pagina") {
    return conteudo;
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4">
      {conteudo}
    </div>
  );
}
