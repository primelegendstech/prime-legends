"use client";

import { useIdioma } from "@/context/LanguageContext";

const textos = {
  pt: {
    pix: "Pagamento 100% Seguro via Pix",
    entrega: "Entrega Garantida",
    suporte: "Suporte Real 24h",
  },
  en: {
    pix: "100% Secure Payment via Pix",
    entrega: "Guaranteed Delivery",
    suporte: "Real 24h Support",
  },
};

export default function SeloSeguranca() {
  const { idioma } = useIdioma();
  const t = textos[idioma];

  const itens = [
    { emoji: "🔒", label: t.pix },
    { emoji: "✅", label: t.entrega },
    { emoji: "🎧", label: t.suporte },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
      {itens.map((item) => (
        <span
          key={item.label}
          className="flex items-center gap-1.5 text-xs md:text-sm text-zinc-400 font-medium"
        >
          <span>{item.emoji}</span>
          {item.label}
        </span>
      ))}
    </div>
  );
}
