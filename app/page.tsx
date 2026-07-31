import Header from "@/components/Header";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import WhatsAppButton from "@/components/WhatsAppButton";
import TrustBadges from "@/components/TrustBadges";
import About from "@/components/About";
import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white relative overflow-hidden">
      <div
        className="fixed inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Cdefs%3E%3Cfilter id='glow' x='-50%25' y='-50%25' width='200%25' height='200%25'%3E%3CfeGaussianBlur stdDeviation='3' result='blur'/%3E%3CfeMerge%3E%3CfeMergeNode in='blur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg filter='url(%23glow)'%3E%3Cg stroke='%23ffb800' stroke-width='1.4' fill='none' stroke-linecap='round'%3E%3Cpath d='M-30 60L90 60L150 -10'/%3E%3Cpath d='M20 400L90 320L90 200L200 90L320 90'/%3E%3Cpath d='M-30 250L60 250L140 170'/%3E%3Cpath d='M250 -20L250 70L360 180L430 180'/%3E%3Cpath d='M400 340L300 340L220 260L220 180'/%3E%3Cpath d='M-30 150L40 150L100 90L100 30'/%3E%3Cpath d='M180 400L180 330L260 250'/%3E%3C/g%3E%3Cg fill='%23ffdd66'%3E%3Ccircle cx='90' cy='60' r='3'/%3E%3Ccircle cx='90' cy='200' r='2.5'/%3E%3Ccircle cx='200' cy='90' r='3'/%3E%3Ccircle cx='140' cy='170' r='2'/%3E%3Ccircle cx='250' cy='70' r='2.5'/%3E%3Ccircle cx='360' cy='180' r='3'/%3E%3Ccircle cx='220' cy='260' r='2.5'/%3E%3Ccircle cx='100' cy='90' r='2'/%3E%3Ccircle cx='260' cy='250' r='2.5'/%3E%3Ccircle cx='150' cy='-10' r='1.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "400px 400px",
          backgroundRepeat: "repeat",
        }}
      />
      <div className="relative z-10">
        <Header />
      <section
  className="relative flex min-h-screen items-center px-6 md:px-16 pt-24"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(11,11,11,0.95) 0%, rgba(11,11,11,0.75) 35%, rgba(11,11,11,0.3) 60%, rgba(11,11,11,0.1) 100%), url('/hero-bg.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div
          className="md:hidden absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `url('/hero-mobile-bg.png')`,
            backgroundSize: "cover",
            backgroundPosition: "top center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="max-w-2xl text-left relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Prime Legends Tech" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            <span className="border border-amber-500/40 rounded-full px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-semibold text-amber-400">
              Serviço de Ativação Imediata
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              Ativações
            </span>
            <br />
            e aluguéis
            <br />
            profissionais.
          </h1>

          <p className="mt-6 md:mt-8 text-base md:text-xl text-zinc-400 max-w-xl">
            Sua solução completa para serviços técnicos. Oferecemos{" "}
            <span className="font-bold text-white">serviços remotos, ferramentas, licenças, downloads e suporte</span>{" "}
            especializado para manutenção de dispositivos Android e iPhone.
          </p>

          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row justify-start gap-3 sm:gap-4">
            <button className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-black transition hover:scale-105">
              🛒 COMPRAR LICENÇA
            </button>

            <Link
              href="/alugueis"
              className="flex items-center justify-center gap-2 rounded-xl border border-amber-500 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold text-amber-400 transition hover:bg-gradient-to-r hover:from-yellow-300 hover:via-amber-500 hover:to-yellow-600 hover:text-black"
            >
              🕐 ALUGUEL DE FERRAMENTAS
            </Link>
          </div>
        </div>
      </section>
      <TrustBadges />
<About />
<Services />
<Contact />
<WhatsAppButton />
      </div>
    </main>
  );
}