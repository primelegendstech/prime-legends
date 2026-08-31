import type { MetadataRoute } from "next";

const SITE_URL = "https://primelegendsgsm.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  const paginas = [
    { rota: "", prioridade: 1, frequencia: "daily" as const },
    { rota: "/alugueis", prioridade: 0.9, frequencia: "daily" as const },
    { rota: "/ativacao", prioridade: 0.9, frequencia: "daily" as const },
    { rota: "/metodos", prioridade: 0.8, frequencia: "weekly" as const },
    { rota: "/politica-reembolso", prioridade: 0.3, frequencia: "monthly" as const },
    { rota: "/politica-privacidade", prioridade: 0.3, frequencia: "monthly" as const },
    { rota: "/entrar", prioridade: 0.2, frequencia: "monthly" as const },
    { rota: "/cadastro", prioridade: 0.2, frequencia: "monthly" as const },
  ];

  return paginas.map((p) => ({
    url: `${SITE_URL}${p.rota}`,
    lastModified: new Date(),
    changeFrequency: p.frequencia,
    priority: p.prioridade,
  }));
}
