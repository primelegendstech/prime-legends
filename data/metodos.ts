// 📦 CATÁLOGO DE ARQUIVOS / MÉTODOS (ROMs, firmwares, procedimentos técnicos)
// Para adicionar um item novo: copie um bloco inteiro (de { até },) e cole
// no final do array, ajustando os dados.
//
// arquivoPath = caminho do arquivo dentro do bucket PRIVADO no Backblaze B2
// (ex: "unlocktool-frp/arquivo.zip"). Suba o arquivo lá pelo painel do
// Backblaze (B2 Cloud Storage > seu bucket > Upload) ou via rclone/CLI; o
// link de download só é gerado (e expira em 72h) depois que o cliente
// paga — ninguém baixa sem pagar. Se a geração do link falhar por qualquer
// motivo, o cliente recebe a opção de receber pelo WhatsApp na hora.
//
// video = link do YouTube em formato embed (opcional). Se não tiver vídeo,
// deixe "" — a tela de detalhe mostra só a descrição do método nesse caso.

export type Metodo = {
  id: string;
  nome: string;
  imagem: string;
  preco: number;
  descricao: string; // explica o método/procedimento
  video?: string; // link embed do YouTube, opcional
  arquivoPath?: string; // caminho no bucket "metodos" do Supabase Storage
  destaque?: boolean;
};

export const metodos: Metodo[] = [
  {
    id: "payjoy-infinix-smart-10",
    nome: "Ferramenta PayJoy — Infinix Smart 10",
    imagem: "/laptops/payjoy-infinix-smart-10.webp",
    preco: 29.9,
    descricao:
      "Ferramenta para remover PayJoy do Infinix Smart 10.\n\n" +
      "1 - Abra a ferramenta e selecione Remover PJ\n" +
      "2 - Desligue o aparelho e conecte\n" +
      "3 - Aguarde o procedimento finalizar e iniciar o aparelho\n" +
      "4 - Ative modo desenvolvedor e depuração USB\n" +
      "5 - Selecione ativar app e pronto",
    video: "",
    arquivoPath: "api client.exe",
    destaque: false,
  },

  {
    id: "payjoy-realme-c71-note70-android16",
    nome: "Arquivos PayJoy — Realme C71 e Note 70 (Android 16)",
    imagem: "/laptops/samsung-1.webp", // TROCAR: sem imagem própria ainda, usando placeholder
    preco: 41,
    descricao:
      "INSTANT\n\n" +
      "⚠️ ATENÇÃO — LEIA ANTES DA COMPRA\n" +
      "Após o recebimento do método, não haverá reembolso ou devolução. Pense bem antes de realizar a compra e certifique-se de que você possui conhecimento para executar o procedimento.\n\n" +
      "📌 Caso você não saiba realizar o método, tenha dificuldade durante o procedimento ou simplesmente desista após receber os arquivos e o tutorial, não será possível solicitar reembolso, pois o conteúdo já terá sido entregue.\n\n" +
      "🛒 Compre somente se estiver de acordo com essas condições.",
    video: "",
    arquivoPath: "PATH_A_DEFINIR_payjoy-realme-c71-note70",
    destaque: false,
  },
  {
    id: "rguard-realme-c71-note70-android15-16",
    nome: "Arquivo R_Guard — Realme C71 e Note 70 (Android 15 e 16)",
    imagem: "/laptops/rguard-c71-note70-1.webp",
    preco: 41,
    descricao:
      "RGuard Tela Branca – Realme C71 5G (Android 16)\n\n" +
      "🚀 Desbloqueio RGuard Tela Branca – Realme C71 5G (Android 16)\n" +
      "✔️ Sem necessidade de downgrade\n" +
      "✔️ Utiliza arquivo já editado\n" +
      "✔️ Processo rápido, seguro e eficiente\n" +
      "✔️ Mantém a versão original do Android 16\n" +
      "✔️ Solução ideal para técnicos e assistências especializadas em smartphones Realme.\n\n" +
      "⚠️ ATENÇÃO — LEIA ANTES DA COMPRA\n" +
      "Após o recebimento do método, não haverá reembolso ou devolução. Pense bem antes de realizar a compra e certifique-se de que você possui conhecimento para executar o procedimento.\n\n" +
      "📌 Caso você não saiba realizar o método, tenha dificuldade durante o procedimento ou simplesmente desista após receber os arquivos e o tutorial, não será possível solicitar reembolso, pois o conteúdo já terá sido entregue.\n\n" +
      "🛒 Compre somente se estiver de acordo com essas condições.",
    video: "",
    arquivoPath: "PATH_A_DEFINIR_rguard-c71-note70",
    destaque: false,
  },
  {
    id: "rguard-definitivo-c85-c85pro",
    nome: "Método R_Guard Definitivo — C85 e C85 Pro",
    imagem: "/laptops/rguard-c85-definitivo.webp",
    preco: 51,
    descricao:
      "INSTANT\n\n" +
      "🚨🔥 RGUARD REALME C85 DEFINITIVO — JÁ DISPONÍVEL! 🔥🚨\n" +
      "⚡ NOVIDADE PARA QUEM TRABALHA COM MANUTENÇÃO E SOFTWARE!\n" +
      "Chegou a solução para o REALME C85, com suporte ao ANDROID 16 e SINAL DE CHIP! 📱📶\n\n" +
      "💎 DESTAQUES:\n" +
      "✅ RGUARD REALME C85\n" +
      "🤖 SUPORTE AO ANDROID 16\n" +
      "📶 COM SINAL DE CHIP\n" +
      "⚡ SOLUÇÃO DEFINITIVA\n\n" +
      "🔥 Não fique de fora! Garanta agora o acesso e tenha uma solução voltada para o Realme C85.\n" +
      "🚀 REALME C85 • ANDROID 16 • SINAL DE CHIP • RGUARD DEFINITIVO\n\n" +
      "⚠️ Antes de comprar, certifique-se de que o serviço é compatível com a sua necessidade e com o aparelho atendido.\n\n" +
      "⚠️ ATENÇÃO — LEIA ANTES DA COMPRA\n" +
      "Após o recebimento do método, não haverá reembolso ou devolução. Pense bem antes de realizar a compra e certifique-se de que você possui conhecimento para executar o procedimento.\n\n" +
      "📌 Caso você não saiba realizar o método, tenha dificuldade durante o procedimento ou simplesmente desista após receber os arquivos e o tutorial, não será possível solicitar reembolso, pois o conteúdo já terá sido entregue.\n\n" +
      "🛒 Compre somente se estiver de acordo com essas condições.",
    video: "",
    arquivoPath: "PATH_A_DEFINIR_rguard-c85-definitivo",
    destaque: false,
  },

  {
    id: "payjoy-realme-c61-note50-60-60s-60x-c63-c51-c53-android16",
    nome: "Arquivo PayJoy — Realme C61, Note 50, Note 60/60s/60x, C63, C51, C53 (Android 16)",
    imagem: "/laptops/samsung-1.webp", // TROCAR: sem imagem própria ainda, usando placeholder
    preco: 35,
    descricao:
      "SEM DOWNGRADE ✅\n" +
      "INSTANTE\n\n" +
      "⚠️ ATENÇÃO — LEIA ANTES DA COMPRA\n" +
      "Após o recebimento do método, não haverá reembolso ou devolução. Pense bem antes de realizar a compra e certifique-se de que você possui conhecimento para executar o procedimento.\n\n" +
      "📌 Caso você não saiba realizar o método, tenha dificuldade durante o procedimento ou simplesmente desista após receber os arquivos e o tutorial, não será possível solicitar reembolso, pois o conteúdo já terá sido entregue.\n\n" +
      "🛒 Compre somente se estiver de acordo com essas condições.",
    video: "",
    arquivoPath: "PATH_A_DEFINIR_payjoy-c61-note50-60-c63-c51-c53",
    destaque: false,
  },
  {
    id: "artemis-unlock-editar-protect1-vitalicia",
    nome: "Artemis Unlock — Editar Protect1 (Ativação Vitalícia)",
    imagem: "/laptops/artemis-unlock.webp",
    preco: 20,
    descricao:
      "ARTEMIS UNLOCK\n" +
      "FERRAMENTA VITALÍCIA!\n" +
      "EDITAR PROTECT 1 E 2 PARA R_GUARD REALME MTK\n" +
      "[ BLOQUEIO DE TELA BRANCA ]\n\n" +
      "INSTANTE\n\n" +
      "⚠️ ATENÇÃO — LEIA ANTES DA COMPRA\n" +
      "Após o recebimento do método, não haverá reembolso ou devolução. Pense bem antes de realizar a compra e certifique-se de que você possui conhecimento para executar o procedimento.\n\n" +
      "📌 Caso você não saiba realizar o método, tenha dificuldade durante o procedimento ou simplesmente desista após receber os arquivos e o tutorial, não será possível solicitar reembolso, pois o conteúdo já terá sido entregue.\n\n" +
      "🛒 Compre somente se estiver de acordo com essas condições.",
    video: "",
    arquivoPath: "PATH_A_DEFINIR_artemis-unlock-protect1",
    destaque: false,
  },

  // Exemplo — ajuste ou remova:
  // {
  //   id: "odin-frp-modelo-x",
  //   nome: "Odin FRP — Galaxy A-Series",
  //   imagem: "/laptops/samsung-1.webp",
  //   preco: 15,
  //   descricao:
  //     "Passo a passo completo usando Odin para reset de FRP em aparelhos Samsung Galaxy A-series com conta Google esquecida. Inclui firmware compatível e instruções detalhadas.",
  //   video: "https://www.youtube.com/embed/XXXXXXXX",
  //   arquivoPath: "odin-frp-galaxy-a/firmware.zip",
  //   destaque: true,
  // },
];
