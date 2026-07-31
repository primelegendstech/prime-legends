const stats = [
  { value: "Completo", label: "SUPORTE" },
  { value: "Rápida", label: "ENTREGA" },
  { value: "2026", label: "ATUALIZADO" },
];

export default function TrustBadges() {
  return (
    <section className="bg-[#0B0B0B] px-6 py-10">
      <div className="max-w-3xl mx-auto flex items-center justify-center divide-x divide-amber-500/20">
        {stats.map((stat) => (
          <div key={stat.label} className="flex-1 text-center px-6">
            <p className="text-2xl md:text-3xl font-extrabold text-white">
              {stat.value}
            </p>
            <p className="text-xs text-amber-400 tracking-wide mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}