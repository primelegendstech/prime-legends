"use client";

import { useIdioma } from "@/context/LanguageContext";

const conteudo = {
  pt: {
    features: [
      {
        icon: "🛡️",
        title: "100% Seguro",
        description:
          "Seus pagamentos e ativações estão protegidos. Operamos com total transparência, garantindo que você receba sua licença sem riscos.",
      },
      {
        icon: "⚡",
        title: "Entrega Rápida",
        description:
          "Sabemos que tempo é dinheiro. Processamos ativações em tempo recorde para que você não precise interromper seu trabalho.",
      },
      {
        icon: "🤖",
        title: "Gestão de Licenças",
        description:
          "Nosso suporte se concentra exclusivamente no acesso e uso da sua licença. Garantimos disponibilidade imediata e total estabilidade.",
      },
    ],
  },
  en: {
    features: [
      {
        icon: "🛡️",
        title: "100% Secure",
        description:
          "Your payments and activations are protected. We operate with full transparency, ensuring you receive your license risk-free.",
      },
      {
        icon: "⚡",
        title: "Fast Delivery",
        description:
          "We know time is money. We process activations in record time so you never have to stop working.",
      },
      {
        icon: "🤖",
        title: "License Management",
        description:
          "Our support focuses exclusively on access and use of your license. We guarantee immediate availability and full stability.",
      },
    ],
  },
};

export default function About() {
  const { idioma } = useIdioma();
  const { features } = conteudo[idioma];

  return (
    <section id="sobre" className="bg-[#0B0B0B] px-6 py-16 border-t border-yellow-500/10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-[#121212] border border-yellow-500/20 rounded-xl p-8 text-center hover:border-yellow-400 transition"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 flex items-center justify-center text-2xl">
              {f.icon}
            </div>
            <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
