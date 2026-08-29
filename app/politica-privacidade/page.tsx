import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Prime Legends GSM",
  description:
    "Como a Prime Legends GSM coleta, usa e protege seus dados pessoais, em conformidade com a LGPD (Lei Geral de Proteção de Dados).",
  alternates: { canonical: "/politica-privacidade" },
  robots: { index: true, follow: true },
};

export default function PoliticaPrivacidade() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white px-6 py-20 md:py-24">
      <div className="max-w-3xl mx-auto">
        <p className="text-yellow-400 font-semibold uppercase tracking-[0.3em] mb-3 text-sm">
          Prime Legends GSM
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3">Política de Privacidade</h1>
        <p className="text-zinc-500 text-sm mb-10">Última atualização: agosto de 2026</p>

        <div className="space-y-10 text-zinc-300 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">1. Quem somos</h2>
            <p>
              A Prime Legends GSM oferece aluguel de ferramentas, ativação de licenças e métodos técnicos
              para profissionais de manutenção de smartphones. Esta política explica quais dados
              coletamos, para que usamos e quais direitos você tem sobre eles, em conformidade com a{" "}
              <span className="text-white font-semibold">
                Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)
              </span>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">2. Quais dados coletamos</h2>
            <ul className="list-disc list-inside space-y-2 marker:text-yellow-400">
              <li>Dados de cadastro: nome e e-mail, usados para criar e identificar sua conta;</li>
              <li>
                Dados de pagamento: processados diretamente pelo Mercado Pago — não armazenamos número de
                cartão nem dados sensíveis de pagamento em nossos servidores;
              </li>
              <li>
                Dados de uso: histórico de pedidos, saldo de carteira e movimentações, para manter seu
                extrato e liberar os serviços contratados;
              </li>
              <li>Dados de contato: quando você fala com a gente pelo WhatsApp ou e-mail.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">3. Para que usamos seus dados</h2>
            <ul className="list-disc list-inside space-y-2 marker:text-yellow-400">
              <li>Processar pagamentos e liberar o acesso aos serviços contratados;</li>
              <li>Manter seu histórico de pedidos e saldo de carteira disponível na sua conta;</li>
              <li>Enviar comunicações sobre o status dos seus pedidos;</li>
              <li>Prevenir fraudes e proteger a segurança da plataforma;</li>
              <li>Cumprir obrigações legais e fiscais quando aplicável.</li>
            </ul>
            <p className="mt-3">Não vendemos nem compartilhamos seus dados com terceiros para fins de marketing.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">4. Com quem compartilhamos</h2>
            <p>
              Compartilhamos dados apenas com prestadores essenciais à operação do serviço: processador de
              pagamento (Mercado Pago), provedor de e-mail transacional e provedor de armazenamento de
              arquivos, na medida necessária pra cada um cumprir sua função.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">5. Cookies</h2>
            <p>
              Usamos cookies essenciais para manter você logado e para lembrar suas preferências de
              idioma. Podemos usar cookies de análise de tráfego para entender como o site é usado e
              melhorar a experiência.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">6. Seus direitos</h2>
            <p className="mb-3">De acordo com a LGPD, você pode a qualquer momento solicitar:</p>
            <ul className="list-disc list-inside space-y-2 marker:text-yellow-400">
              <li>Confirmação de que tratamos seus dados e acesso a eles;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Exclusão dos seus dados pessoais, respeitadas as obrigações legais de retenção;</li>
              <li>Informação sobre com quem compartilhamos seus dados.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">7. Segurança</h2>
            <p>
              Adotamos medidas técnicas para proteger seus dados, incluindo controle de acesso e
              criptografia em trânsito. Apesar disso, nenhum sistema é 100% imune a incidentes — caso algo
              relevante aconteça, você será informado conforme exige a lei.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">8. Contato</h2>
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre esta política, fale com a gente pelo
              WhatsApp ou pelo e-mail{" "}
              <a href="mailto:primelegendsx@gmail.com" className="text-yellow-400 hover:text-yellow-300">
                primelegendsx@gmail.com
              </a>
              .
            </p>
          </section>
        </div>

        <div className="mt-14 pt-6 border-t border-yellow-500/10">
          <a
            href="https://wa.me/5581995716227"
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300 transition text-sm font-semibold"
          >
            Dúvidas? Fale com a gente no WhatsApp ➤
          </a>
        </div>
      </div>
    </main>
  );
}
