export default function Contact() {
  return (
    <section id="contato" className="bg-[#0B0B0B] px-6 py-24 border-t border-yellow-500/10">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-yellow-400 font-semibold uppercase tracking-[0.3em] mb-3">
          Contato
        </p>
        <h2 className="text-4xl font-extrabold text-white mb-4">
          Prime Legends GSM
        </h2>
        <p className="text-gray-400 mb-10">
          Dúvidas sobre ferramentas, licenças ou serviços? Manda uma mensagem.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://wa.me/5581995716227"
            target="_blank"
            className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold px-8 py-4 rounded-xl transition"
          >
            WhatsApp
          </a>
          <a
            href="mailto:primelegendsx@gmail.com"
            className="border border-yellow-500/40 hover:border-yellow-400 text-white font-bold px-8 py-4 rounded-xl transition"
          >
            E-mail
          </a>
        </div>
      </div>

      <footer className="mt-20 text-center">
  <div className="flex items-center justify-center gap-5 mb-4">
    <a
      href="https://www.youtube.com/@PrimeLegendsTech"
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-amber-400 transition"
      aria-label="YouTube"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5V8.5l6.3 3.5-6.3 3.5Z" />
      </svg>
    </a>

    <a
      href="https://www.facebook.com/profile.php?id=61567467432767"
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-amber-400 transition"
      aria-label="Facebook"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
      </svg>
    </a>
  </div>

  <p className="text-gray-600 text-sm">
    © {new Date().getFullYear()} Prime Legends Tech. Todos os direitos reservados.
  </p>
</footer>
    </section>
  );
}