const downloads = [
  {
    name: "Driver USB Universal",
    size: "24 MB",
    version: "v3.2",
  },
  {
    name: "Firmware Pack Samsung",
    size: "1.2 GB",
    version: "v5.0",
  },
  {
    name: "Ferramenta de Backup",
    size: "18 MB",
    version: "v1.8",
  },
];

export default function Downloads() {
  return (
    <section id="downloads" className="bg-[#0B0B0B] px-6 py-24 border-t border-yellow-500/10">
      <div className="max-w-6xl mx-auto text-center mb-14">
        <p className="text-yellow-400 font-semibold uppercase tracking-[0.3em] mb-3">
          Downloads
        </p>
        <h2 className="text-4xl font-extrabold text-white">
          Arquivos e utilitários gratuitos
        </h2>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        {downloads.map((file) => (
          <div
            key={file.name}
            className="bg-black border border-yellow-500/20 rounded-xl p-5 flex items-center justify-between hover:border-yellow-400 transition"
          >
            <div>
              <h3 className="text-white font-bold">{file.name}</h3>
              <p className="text-gray-400 text-sm">
                {file.version} • {file.size}
              </p>
            </div>

            <button className="bg-yellow-400 hover:bg-yellow-300 text-black text-sm font-bold px-5 py-2 rounded-lg transition">
              Baixar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}