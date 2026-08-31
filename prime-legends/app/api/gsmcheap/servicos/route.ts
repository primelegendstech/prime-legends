import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url = `${process.env.GSMCHEAP_URL}/public/api/index.php`;

    const body = new URLSearchParams({
      username: process.env.GSMCHEAP_USERNAME!,
      apiaccesskey: process.env.GSMCHEAP_API_KEY!,
      action: "imeiservicelist",
      requestformat: "JSON",
    });

    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    const dados = await resposta.json();

    return NextResponse.json(dados);
  } catch (erro) {
    return NextResponse.json({ erro: "Falha ao conectar com a GSM Cheap" }, { status: 500 });
  }
}