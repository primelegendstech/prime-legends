// 📦 CATÁLOGO DE FERRAMENTAS DE ALUGUEL
// Para adicionar uma ferramenta nova: copie um bloco inteiro (de { até },)
// e cole no final do array, ajustando os dados. Não precisa mexer em mais
// nenhum outro arquivo — o site atualiza sozinho.

export type Plano = {
  nome: string;
  preco: number;
  destaque?: boolean;
  instantaneo?: boolean;
};

export type Ferramenta = {
  nome: string;
  badge?: string;
  // Controla o status exibido nos cards de aluguel. Não precisa preencher em
  // ferramentas já existentes — sem esse campo, o site trata como "online"
  // normalmente. Pra tirar uma ferramenta do ar (ex: fornecedor fora do ar,
  // manutenção), é só colocar `online: false` no bloco dela aqui embaixo.
  online?: boolean;
  imagens: string[];
  links: {
    modelos: string;
    download: string;
  };
  video?: string;   // link do YouTube (ex: "https://www.youtube.com/embed/XXXXXXXX")
  obs?: string;      // mensagem personalizada exibida na tela de detalhe
  planos: Plano[];
};

export const ferramentas: Ferramenta[] = [
  {
    nome: "UnlockTool",
    imagens: ["/laptops/unlocktool-1.webp", "/laptops/unlocktool-2.webp"],
    links: {
      modelos: "https://unlocktool.net/models/",
      download: "https://file.unlocktool.net/",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. Baixe a ferramenta pelo link acima antes de usar.",
    planos: [
      { nome: "6 horas", preco: 5, destaque: true, instantaneo: true },
      { nome: "12 horas", preco: 9, destaque: true, instantaneo: true },
      { nome: "48 horas", preco: 18 },
      { nome: "120 horas", preco: 30 },
    ],
  },
  {
    nome: "TSM Tool",
    imagens: ["/laptops/tsm-1.webp", "/laptops/tsm-2.webp"],
    links: {
      modelos: "https://tsm-tool.com/SupportedModels",
      download: "https://tsm-tool.com/download",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. Baixe a ferramenta pelo link acima antes de usar.",
    planos: [
      { nome: "3 horas", preco: 5.5, destaque: true, instantaneo: true },
      { nome: "12 horas", preco: 9, destaque: true },
      { nome: "48 horas", preco: 18 },
      { nome: "168 horas", preco: 35 },
    ],
  },
  {
    nome: "AMT Tool",
    imagens: ["/laptops/amt-1.webp", "/laptops/amt-2.webp"],
    links: {
      modelos: "https://androidmultitool.com/supported_models/",
      download: "https://androidmultitool.com/",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. Baixe a ferramenta pelo link acima antes de usar.",
    planos: [
      { nome: "2 horas", preco: 5, destaque: true, instantaneo: true },
      { nome: "3 horas", preco: 6, destaque: true },
      { nome: "5 horas", preco: 8 },
      { nome: "12 horas", preco: 10, instantaneo: true },
    ],
  },
  {
    nome: "Samsung Tool",
    badge: "CellTool",
    imagens: ["/laptops/samsung-1.webp", "/laptops/samsung-2.webp"],
    links: {
      modelos: "https://celltool.io/qcsupportmodel",
      download: "https://celltool.io/",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. Baixe a ferramenta pelo link acima antes de usar.",
    planos: [
      { nome: "12 horas", preco: 15, destaque: true, instantaneo: true },
      { nome: "24 horas", preco: 20 },
      { nome: "48 horas", preco: 30 },
      { nome: "72 horas", preco: 35 },
    ],
  },
  {
    nome: "Griffin-Unlocker",
    imagens: ["/laptops/griffin-1.webp", "/laptops/griffin-2.webp"],
    links: {
      modelos: "https://griffin-unlocker.com/models.html",
      download: "https://griffin-unlocker.com/download.html",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. Baixe a ferramenta pelo link acima antes de usar.",
    planos: [
      { nome: "6 horas", preco: 9, destaque: true, instantaneo: true },
      { nome: "12 horas", preco: 14 },
      { nome: "24 horas", preco: 18 },
    ],
  },

  // 👇 EXEMPLO — copie este bloco pra adicionar uma ferramenta nova
  // {
  //   nome: "Nome Da Ferramenta",
  //   imagens: ["/laptops/nome-1.png", "/laptops/nome-2.png"],
  //   links: {
  //     modelos: "https://site-da-ferramenta.com/models",
  //     download: "https://site-da-ferramenta.com/download",
  //   },
  //   video: "https://www.youtube.com/embed/XXXXXXXX",
  //   obs: "Escreva aqui uma observação específica dessa ferramenta.",
  //   planos: [
  //     { nome: "6 horas", preco: 5, destaque: true, instantaneo: true },
  //     { nome: "24 horas", preco: 15 },
  //   ],
  // },
];
