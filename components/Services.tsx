const services = [
  {
    name: "Suporte Técnico Remoto",
    description: "Ajuda especializada para resolver problemas de software e configuração à distância.",
  },
  {
    name: "Suporte De Ativações de Licenças",
    description: "Ativações de licenças com suporte técnico especializado.",
  },
  {
    name: "Desbloqueio de Aparelhos",
    description: "Liberação de operadora e remoção de contas vinculadas em diversos modelos.",
  },
  {
    name: "Consultoria para Técnicos",
    description: "Orientação sobre ferramentas, fluxos de trabalho e melhores práticas.",
  },
];

export default function Services() {
  return (
    <section id="servicos" className="bg-[#0B0B0B] px-6 py-24 border-t border-yellow-500/10">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <p className="text-yellow-400 font-semibold uppercase tracking-[0.3em] mb-3">
          Serviços
        </p>
        <h2 className="text-4xl font-extrabold text-white">
          Suporte especializado para o seu trabalho
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">
        {services.map((service) => (
          <div
            key={service.name}
            className="bg-black border border-yellow-500/20 rounded-xl p-6 hover:border-yellow-400 transition"
          >
            <h3 className="text-white font-bold text-lg mb-2">
              {service.name}
            </h3>
            <p className="text-gray-400 text-sm">
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}