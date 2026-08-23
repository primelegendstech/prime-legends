"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DepositoCarteira from "@/components/DepositoCarteira";

function formatarReais(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function SaldoCarteira({ saldoInicialCentavos }: { saldoInicialCentavos: number }) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);

  function aoConcluirDeposito() {
    // Fecha o modal e recarrega os dados do servidor (saldo atualizado)
    setTimeout(() => {
      setModalAberto(false);
      router.refresh();
    }, 1200);
  }

  return (
    <>
      <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-4 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Saldo</p>
          <p className="text-2xl font-black text-yellow-400">
            {formatarReais(saldoInicialCentavos)}
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold px-4 py-2 hover:brightness-110 transition"
        >
          + Adicionar
        </button>
      </div>

      {modalAberto && (
        <DepositoCarteira onFechar={() => setModalAberto(false)} onSucesso={aoConcluirDeposito} />
      )}
    </>
  );
}
