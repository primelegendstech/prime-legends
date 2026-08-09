// lib/formatar-credenciais.ts
//
// Recebe o campo `dados` (como vem salvo em pedidos.dados) e tenta extrair
// login/senha de forma legível. Se não reconhecer o formato, cai num fallback
// que lista campo a campo em vez de despejar o JSON cru na tela do cliente.

export interface CredenciaisFormatadas {
  login?: string;
  senha?: string;
  linhas: { label: string; valor: string }[];
}

export function formatarCredenciais(dados: any): CredenciaisFormatadas {
  if (!dados) return { linhas: [] };

  // Formato mais comum da GSM Cheap: { SUCCESS: [{ CODE: "login✅senha", STATUS: n }] }
  const item = dados?.SUCCESS?.[0] ?? dados?.SUCCESS?.["1"] ?? null;
  const code: string | undefined = item?.CODE;

  if (typeof code === "string" && code.includes("✅")) {
    const [login, senha] = code.split("✅");
    return { login, senha, linhas: [] };
  }

  // Alguns fornecedores devolvem login/senha em campos já separados
  if (dados.login || dados.password || dados.senha) {
    return {
      login: dados.login,
      senha: dados.password ?? dados.senha,
      linhas: [],
    };
  }

  // Fallback: lista campo a campo (nunca joga o JSON cru na tela)
  const linhas: { label: string; valor: string }[] = [];
  function coletar(valor: any, rotulo = "") {
    if (valor === null || valor === undefined || valor === "") return;
    if (typeof valor !== "object") {
      linhas.push({ label: rotulo || "Informação", valor: String(valor) });
      return;
    }
    if (Array.isArray(valor)) {
      valor.forEach((v, i) => coletar(v, rotulo ? `${rotulo} ${i + 1}` : `Item ${i + 1}`));
      return;
    }
    for (const [chave, v] of Object.entries(valor)) {
      coletar(v, chave);
    }
  }
  coletar(dados);

  return { linhas };
}
