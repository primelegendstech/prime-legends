import type { MetadataRoute } from "next";

const SITE_URL = "https://primelegendsgsm.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/minha-conta", "/api", "/consultar", "/sucesso"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
