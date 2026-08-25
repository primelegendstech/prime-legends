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
    imagem: "/laptops/samsung-1.png",
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
