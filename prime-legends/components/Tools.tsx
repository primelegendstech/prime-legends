const tools = [
  {
    name: "FRP Bypass Tool",
    description: "Remova a verificação de conta Google em segundos, com suporte a diversos modelos.",
    price: "R$ 49,90",
  },
  {
    name: "Unlock Master",
    description: "Desbloqueio de operadora para os principais modelos Android do mercado.",
    price: "R$ 39,90",
  },
  {
    name: "IMEI Repair Suite",
    description: "Correção e restauração de IMEI de forma rápida e segura.",
    price: "R$ 59,90",
  },
  {
    name: "Firmware Flash Tool",
    description: "Instale firmwares originais e evite brick em diversos aparelhos.",
    price: "R$ 44,90",
  },
];

export default function Tools() {
  return (
    <section id="ferramentas" className="bg-[#0B0B0B] px-6 py-24">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <p className="bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent font-semibold uppercase tracking-[0.3em] mb-3">
  Ferramentas
</p>
        <h2 className="text-4xl font-extrabold text-white">
          As melhores ferramentas para o seu dia a dia
        </h2>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="bg-black border border-yellow-500/20 rounded-xl p-6 flex flex-col justify-between hover:border-yellow-400 transition"
          >
            <div>
              <h3 className="text-white font-bold text-lg mb-2">
                {tool.name}
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                {tool.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent font-bold">{tool.price}</span>
              <button className="bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 hover:from-yellow-200 hover:to-yellow-500 text-black text-sm font-bold px-4 py-2 rounded-lg transition">
  Ver mais
</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}