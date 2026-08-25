import AlugueisContent from "@/components/AlugueisContent";

export default function AlugueisPage() {
  return (
    <>
      <main className="min-h-screen bg-black text-white px-6 pt-24 pb-20">
        <AlugueisContent />

        <div className="text-center mt-16">
          <a href="/" className="text-sm text-yellow-400 hover:text-yellow-300 transition">
            ← Voltar para o site
          </a>
        </div>
      </main>
    </>
  );
}