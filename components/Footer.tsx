import Link from "next/link";

export default function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-yellow-500/10 bg-black px-6 py-10 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
        <div className="text-center md:text-left">
          <p className="text-yellow-400 font-black tracking-wide">PRIME LEGENDS GSM</p>
          <p className="text-gray-500 text-xs mt-1">
            Aluguel de ferramentas, ativação de licenças e métodos técnicos para profissionais.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-gray-400">
          <Link href="/alugueis" className="hover:text-yellow-400 transition">
            Aluguéis
          </Link>
          <Link href="/ativacao" className="hover:text-yellow-400 transition">
            Ativações
          </Link>
          <Link href="/metodos" className="hover:text-yellow-400 transition">
            Métodos
          </Link>
          <Link href="/politica-reembolso" className="hover:text-yellow-400 transition">
            Política de Reembolso
          </Link>
          <Link href="/politica-privacidade" className="hover:text-yellow-400 transition">
            Política de Privacidade
          </Link>
          <a
            href="https://wa.me/5581995716227"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-yellow-400 transition"
          >
            WhatsApp
          </a>
        </div>
      </div>

      <p className="text-center text-gray-600 text-xs mt-8">
        © {ano} Prime Legends GSM. Todos os direitos reservados.
      </p>
    </footer>
  );
}
