"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

function formatarReais(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type Props = {
  preco: number;
  corpo: Record<string, any>;
  onSucesso: (dados: any) => void;
  onErro: (mensagem: string) => void;
};

// Painel de pagamento com saldo — usado dentro dos 3 checkouts (Aluguel,
// Ativação, Métodos) quando o cliente já está logado. A chamada é sempre
// pra mesma rota (/api/carteira/pagar), só muda o "corpo" que cada tela manda.
export default function PainelPagarComSaldo({ preco, corpo, onSucesso, onErro }: Props) {
  const [saldoCentavos, setSaldoCentavos] = useState<number | null>(null);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let ativo = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: linha } = await supabase
        .from("carteira_saldo")
        .select("saldo_centavos")
        .eq("usuario_id", data.user.id)
        .maybeSingle();
      if (ativo) setSaldoCentavos(linha?.saldo_centavos ?? 0);
    });

    return () => {
      ativo = false;
    };
  }, []);

  const precoCentavos = Math.round(preco * 100);
  const saldoSuficiente = saldoCentavos !== null && saldoCentavos >= precoCentavos;

  async function pagar() {
    setProcessando(true);
    try {
      const resp = await fetch("/api/carteira/pagar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
      const dados = await resp.json();

      if (dados.erro === "saldo_insuficiente") {
        onErro("Saldo insuficiente. Adicione mais saldo pra continuar.");
        setProcessando(false);
        return;
      }

      if (dados.erro) {
        onErro(dados.mensagem || dados.erro);
        setProcessando(false);
        return;
      }

      onSucesso(dados);
    } catch {
      onErro("Erro ao processar pagamento com saldo.");
      setProcessando(false);
    }
  }

  if (saldoCentavos === null) {
    return <p className="text-zinc-500 text-xs text-center py-6">Carregando seu saldo...</p>;
  }

  return (
    <div className="rounded-xl border border-yellow-500/25 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-zinc-400 text-sm">Seu saldo</span>
        <span className={`font-bold text-sm ${saldoSuficiente ? "text-yellow-400" : "text-red-400"}`}>
          {formatarReais(saldoCentavos / 100)}
        </span>
      </div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-zinc-400 text-sm">Total do pedido</span>
        <span className="text-white font-bold text-sm">{formatarReais(preco)}</span>
      </div>

      {saldoSuficiente ? (
        <button
          onClick={pagar}
          disabled={processando}
          className="w-full rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold py-2.5 hover:brightness-110 transition disabled:opacity-60"
        >
          {processando ? "Processando..." : "Pagar com saldo"}
        </button>
      ) : (
        <>
          <p className="text-red-400 text-xs mb-3 text-center">
            Saldo insuficiente — faltam {formatarReais((precoCentavos - saldoCentavos) / 100)}.
          </p>
          <a
            href="/minha-conta/adicionar-saldo"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold py-2.5 hover:brightness-110 transition"
          >
            + Adicionar saldo
          </a>
          <p className="text-zinc-500 text-[11px] mt-2 text-center">
            Abre em outra aba — depois de recarregar, volte aqui e clique em atualizar.
          </p>
          <button
            onClick={async () => {
              const supabase = createClient();
              const { data } = await supabase.auth.getUser();
              if (!data.user) return;
              const { data: linha } = await supabase
                .from("carteira_saldo")
                .select("saldo_centavos")
                .eq("usuario_id", data.user.id)
                .maybeSingle();
              setSaldoCentavos(linha?.saldo_centavos ?? 0);
            }}
            className="w-full text-yellow-400 text-xs mt-2 hover:underline"
          >
            Atualizar saldo
          </button>
        </>
      )}
    </div>
  );
}
