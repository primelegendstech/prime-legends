import Header from "@/components/Header";
import AtivacoesContent from "@/components/AtivacoesContent";

export default function AtivacaoPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-12">
      <Header />
      <div className="pt-24">
        <AtivacoesContent />
      </div>
    </main>
  );
}
