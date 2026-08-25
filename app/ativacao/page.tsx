import AtivacoesContent from "@/components/AtivacoesContent";
import GoldNetworkBackground from "@/components/GoldNetworkBackground";

export default function AtivacaoPage() {
  return (
    <main className="relative min-h-screen bg-black px-4 py-12 overflow-hidden">
      <GoldNetworkBackground />
      <div className="relative z-10 pt-24">
        <AtivacoesContent />
      </div>
    </main>
  );
}
