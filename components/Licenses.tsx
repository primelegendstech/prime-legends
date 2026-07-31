const licenses = [
  {
    name: "Licença Mensal",
    price: "R$ 79,90",
    period: "/mês",
    features: [
      "Acesso a todas as ferramentas",
      "Atualizações inclusas",
      "Suporte via chat",
    ],
    highlight: false,
  },
  {
    name: "Licença Anual",
    price: "R$ 699,90",
    period: "/ano",
    features: [
      "Acesso a todas as ferramentas",
      "Atualizações inclusas",
      "Suporte prioritário",
      "2 meses grátis",
    ],
    highlight: true,
  },
  {
    name: "Licença Vitalícia",
    price: "R$ 1.499,90",
    period: "único pagamento",
    features: [
      "Acesso vitalício a todas as ferramentas",
      "Atualizações inclusas para sempre",
      "Suporte prioritário",
    ],
    highlight: false,
  },
];

export default function Licenses() {
  return (
    <section id="licencas" className="bg-[#0B0B0B] px-6 py-24 border-t border-yellow-500/10">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <p className="text-yellow-400 font-semibold uppercase tracking-[0.3em] mb-3">
          Licenças
        </p>
        <h2 className="text-4xl font-extrabold text-white">
          Escolha o plano ideal para você
        </h2>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {licenses.map((license) => (
          <div
            key={license.name}
            className={`rounded-xl p-8 flex flex-col justify-between border transition ${
              license.highlight
                ? "bg-yellow-400 text-black border-yellow-400 scale-105"
                : "bg-black text-white border-yellow-500/20 hover:border-yellow-400"
            }`}
          >
            <div>
              <h3 className="font-bold text-xl mb-1">{license.name}</h3>
              <p className="mb-6">
                <span className="text-2xl font-extrabold">{license.price}</span>{" "}
                <span className="text-sm opacity-70">{license.period}</span>
              </p>

              <ul className="space-y-2 mb-8">
                {license.features.map((feature) => (
                  <li key={feature} className="text-sm flex items-start gap-2">
                    <span>✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`w-full py-3 rounded-lg font-bold transition ${
                license.highlight
                  ? "bg-black text-yellow-400 hover:bg-gray-900"
                  : "bg-yellow-400 text-black hover:bg-yellow-300"
              }`}
            >
              Assinar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}