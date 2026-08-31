"use client";

import { useRouter } from "next/navigation";
import DepositoCarteira from "@/components/DepositoCarteira";

export default function AdicionarSaldoConteudo() {
  const router = useRouter();

  function aoConcluirDeposito() {
    setTimeout(() => {
      router.push("/minha-conta");
      router.refresh();
    }, 1500);
  }

  return (
    <DepositoCarteira
      variante="pagina"
      onFechar={() => router.push("/minha-conta")}
      onSucesso={aoConcluirDeposito}
    />
  );
}
