// 📦 CATÁLOGO DE ATIVAÇÕES DE LICENÇA
// Para adicionar uma ferramenta nova: copie um bloco inteiro (de { até },)
// e cole no final do array, ajustando os dados. Não precisa mexer em mais
// nenhum outro arquivo — o site atualiza sozinho.

export type PlanoAtivacao = {
  nome: string;
  preco: number;
  destaque?: boolean;
};

export type Ativacao = {
  nome: string;
  badge?: string;
  imagens: string[];
  links: {
    modelos: string;
    download: string;
    registro: string;
  };
  video?: string; // link do YouTube (ex: "https://www.youtube.com/embed/XXXXXXXX")
  obs?: string; // mensagem personalizada exibida na tela de detalhe
  planos: PlanoAtivacao[];
};

export const ativacoes: Ativacao[] = [
  {
    nome: "UnlockTool",
    imagens: ["/laptops/unlocktool-1.png", "/laptops/unlocktool-2.png"],
    links: {
      modelos: "https://unlocktool.net/models/",
      download: "https://file.unlocktool.net/",
      registro: "https://unlocktool.net/register/",
    },
    video: "",
    obs: "Antes de ativar, você precisa ter uma conta criada no site oficial do UnlockTool. A ativação é feita no username informado abaixo — confira se está correto antes de pagar.",
    planos: [
      { nome: "3 meses", preco: 109.9 },
      { nome: "6 meses", preco: 149.9, destaque: true },
      { nome: "12 meses", preco: 234.9, destaque: true },
    ],
  },
  {
    nome: "TSM Tool",
    imagens: ["/laptops/tsm-1.png", "/laptops/tsm-2.png"],
    links: {
      modelos: "URL_MODELOS_TSM",
      download: "URL_DOWNLOAD_TSM",
      registro: "URL_REGISTRO_TSM",
    },
    video: "",
    obs: "Antes de ativar, você precisa ter uma conta criada no site oficial do TSM Tool. A ativação é feita no username informado abaixo — confira se está correto antes de pagar.",
    planos: [
      { nome: "3 meses", preco: 149.9 },
      { nome: "6 meses", preco: 199.9, destaque: true },
      { nome: "12 meses", preco: 254.9, destaque: true },
    ],
  },
];
