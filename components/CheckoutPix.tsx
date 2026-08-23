"use client";

import { useEffect, useRef, useState, useMemo, useCallback, memo } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { formatarCredenciais } from "@/lib/formatar-credenciais";

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!, { locale: "pt-BR" });

// Isolado com memo: só re-renderiza (e só recria o Brick) se initialization/customization/
// onSubmit/onError mudarem de verdade. Protege contra re-renders do resto da tela
// (ex: o carrossel de imagens do AlugueisContent atualizando a cada 3s).
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

  // Capturado ANTES do formulário de pagamento, direto do cliente — não
  // depende mais do que o Mercado Pago retorna (que às vezes vem vazio). É
  // esse e-mail que garante o envio do login/senha por e-mail sempre.
  const [emailCliente, setEmailCliente] = useState("");
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailCliente);

  useEffect(() => {
    return () => {
      if (intervaloRef.current) clearInterval(intervaloRef.current);
    };
  }, []);

  // Chama /api/entregar e trata a resposta. Como o backend é idempotente
  // (nunca cria um pedido novo se já existe um em andamento), é sempre seguro
  // chamar de novo — é assim que "destravamos" pedidos que ainda estão
  // "reservando" (corrida com o webhook) ou "processando" (GSM Cheap ainda
  // gerando o código) sem duplicar nada e sem mostrar erro cedo demais.
  async function tentarEntrega(id: string, tentativa: number) {
    const MAX_TENTATIVAS = 12; // ~12 x 3s = 36s de tolerância antes de cair pro fallback manual

    try {
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
        return;
      }

      if (dadosEntrega.manual) {
        // Liberação manual definitiva (serviço não automatizado ou falha real
        // já reportada pra nossa equipe) — não adianta insistir mais.
        setMensagemErro(dadosEntrega.mensagem || "");
        setStatus("aprovado");
        return;
      }

      if (dadosEntrega.reservando || dadosEntrega.processando) {
        // Ainda em andamento (webhook processando em paralelo, ou GSM Cheap
        // gerando o código) — normal, não é erro. Tenta de novo em breve.
        if (tentativa < MAX_TENTATIVAS) {
          setTimeout(() => tentarEntrega(id, tentativa + 1), 3000);
        } else {
          // Demorou demais — mesmo assim NÃO é uma falha confirmada, então
          // não usamos o card de erro. Mostra que está a caminho + WhatsApp.
          setMensagemErro(
            "Seu acesso está sendo gerado e pode levar mais alguns instantes. Você também vai receber por e-mail assim que ficar pronto."
          );
          setStatus("aprovado");
        }
        return;
      }

      // Resposta inesperada (sem sucesso/manual/reservando/processando) —
      // trata como falha pontual e tenta de novo antes de desistir de vez.
      if (tentativa < MAX_TENTATIVAS) {
        setTimeout(() => tentarEntrega(id, tentativa + 1), 3000);
      } else {
        setStatus("erro");
        setMensagemErro("Pagamento aprovado, mas houve um problema na liberação. Fale com o suporte.");
      }
    } catch {
      // Falha de rede na própria chamada — também tenta de novo em vez de
      // desistir silenciosamente (o bug antigo: aqui o polling já tinha
      // parado e a tela ficava travada pra sempre em "Confirmando...").
      if (tentativa < MAX_TENTATIVAS) {
        setTimeout(() => tentarEntrega(id, tentativa + 1), 3000);
      } else {
        setStatus("erro");
        setMensagemErro("Pagamento aprovado, mas houve um problema na liberação. Fale com o suporte.");
      }
    }
  }

  async function iniciarPolling(id: string) {
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
        // falha pontual de rede — tenta de novo no próximo ciclo, sem quebrar a tela
      }
    }, 3000);
  }

  const aoEnviar = useCallback(
    async ({ formData }: any) => {
      try {
        const resp = await fetch("/api/pagamento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, ferramenta, duracao, emailCliente }),
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
    [ferramenta, duracao, emailCliente]
  );

  const aoDarErro = useCallback((erro: any) => {
    console.error("[brick] erro:", erro);
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

  function copiarCodigoPix() {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    });
  }

  const credenciaisFormatadas = credenciais ? formatarCredenciais(credenciais) : null;

  const linkWhatsAppManual = useMemo(() => {
    const texto = `Olá! Paguei o aluguel do ${ferramenta} (${duracao} — R$ ${preco.toFixed(2).replace(".", ",")}).${
      codigo ? ` Código do pedido: ${codigo}.` : ""
    } Poderia liberar meu acesso manualmente?`;
    return `https://wa.me/5581995716227?text=${encodeURIComponent(texto)}`;
  }, [ferramenta, duracao, preco, codigo]);

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
          <>
            <div className="mb-4">
              <label className="block text-zinc-400 text-xs font-semibold mb-1.5">
                Seu e-mail (pra receber o acesso por lá também)
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
              <p className="text-zinc-500 text-[11px] mt-2">
                Já tem conta?{" "}
                <a href="/entrar" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
                  Entrar
                </a>{" "}
                para usar seu saldo, ou{" "}
                <a href="/cadastro" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
                  crie uma conta
                </a>{" "}
                (opcional) pra guardar seu histórico de pedidos.
              </p>
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
