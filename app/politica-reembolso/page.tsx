export default function PoliticaReembolso() {
  return (
    <main className="min-h-screen bg-[#0B0B0B] text-white px-6 py-20 md:py-24">
      <div className="max-w-3xl mx-auto">
        <p className="text-yellow-400 font-semibold uppercase tracking-[0.3em] mb-3 text-sm">
          Prime Legends GSM
        </p>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-10">
          Política de Reembolso e Prevenção de Fraudes
        </h1>

        <div className="space-y-10 text-zinc-300 text-sm md:text-base leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">
              1. Natureza do serviço
            </h2>
            <p>
              Os serviços oferecidos pela Prime Legends GSM (aluguel de ferramentas,
              ativação de licenças, créditos e demais serviços técnicos) são de{" "}
              <span className="text-white font-semibold">
                entrega digital instantânea ou em prazo determinado
              </span>
              . Após a liberação do acesso (login, senha, código de ativação ou
              crédito), o serviço é considerado{" "}
              <span className="text-white font-semibold">
                integralmente prestado e consumido
              </span>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">
              2. Não contestação de pagamentos via Pix
            </h2>
            <p className="mb-3">
              Ao efetuar o pagamento e utilizar qualquer ferramenta, licença ou
              serviço disponibilizado na plataforma, o cliente declara estar ciente
              de que:
            </p>
            <ul className="list-disc list-inside space-y-2 marker:text-yellow-400">
              <li>O pagamento via Pix é irrevogável após a confirmação da transação;</li>
              <li>
                Uma vez liberado o acesso ao serviço contratado, não há devolução do
                produto/serviço, pois se trata de bem digital já entregue;
              </li>
              <li>
                Qualquer tentativa de contestação, chargeback, MED (Mecanismo
                Especial de Devolução) ou cancelamento do pagamento{" "}
                <span className="text-white font-semibold">
                  após o uso do serviço
                </span>{" "}
                será tratada como fraude contra a plataforma.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">
              3. Consequências em caso de fraude confirmada
            </h2>
            <p className="mb-3">
              Caso seja identificado que um cliente solicitou reembolso, abriu
              contestação bancária ou MED Pix após já ter utilizado o serviço
              contratado, a Prime Legends GSM se reserva o direito de aplicar, sem
              aviso prévio:
            </p>
            <ul className="list-disc list-inside space-y-2 marker:text-yellow-400">
              <li>Banimento imediato e permanente da conta e do acesso aos serviços;</li>
              <li>Perda de qualquer saldo, crédito ou licença ativa vinculada à conta;</li>
              <li>
                Bloqueio de novos cadastros relacionados ao usuário (CPF, e-mail,
                telefone ou dispositivo);
              </li>
              <li>
                Registro da ocorrência para fins de segurança e prevenção contra
                futuras fraudes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">
              4. Casos elegíveis para reembolso
            </h2>
            <p className="mb-3">
              O reembolso só será considerado em casos excepcionais, como:
            </p>
            <ul className="list-disc list-inside space-y-2 marker:text-yellow-400 mb-3">
              <li>
                Falha técnica comprovada da nossa plataforma que impossibilite a
                entrega do serviço;
              </li>
              <li>Cobrança duplicada por erro do sistema de pagamento.</li>
            </ul>
            <p>
              Nesses casos, o cliente deve entrar em contato pelo WhatsApp{" "}
              <span className="text-white font-semibold">antes</span> de realizar
              qualquer contestação junto à instituição financeira, para que
              possamos analisar e resolver diretamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-yellow-400 mb-3">
              5. Aceite dos termos
            </h2>
            <p>
              Ao realizar uma compra na Prime Legends GSM, o cliente declara ter
              lido e concordado integralmente com esta Política de Reembolso e
              Prevenção de Fraudes.
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
