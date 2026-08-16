// 📦 CATÁLOGO DE FERRAMENTAS DE ALUGUEL
// Para adicionar uma ferramenta nova: copie um bloco inteiro (de { até },)
// e cole no final do array, ajustando os dados. Não precisa mexer em mais
// nenhum outro arquivo — o site atualiza sozinho.

export type Plano = {
  nome: string;        // ex: "6 horas"
  preco: number;       // ex: 5 (= R$ 5,00)
  destaque?: boolean;  // mostra a tag "POPULAR"
  instantaneo?: boolean; // mostra a tag "⚡ INSTANTÂNEO"
};

export type Ferramenta = {
  nome: string;
  badge?: string;           // ex: "CellTool" (aparece do lado do nome)
  imagens: string[];        // fotos grandes que ficam trocando
  links: {
    modelos: string;
    download: string;
  };
  planos: Plano[];
};

export const ferramentas: Ferramenta[] = [
  {
    nome: "UnlockTool",
    imagens: ["/laptops/unlocktool-1.png", "/laptops/unlocktool-2.png"],
    links: {
      modelos: "https://unlocktool.net/models/",
      download: "https://file.unlocktool.net/",
    },
    planos: [
      { nome: "6 horas", preco: 5, destaque: true, instantaneo: true },
      { nome: "12 horas", preco: 9, destaque: true, instantaneo: true },
      { nome: "48 horas", preco: 18 },
      { nome: "120 horas", preco: 30 },
    ],
  },
  {
    nome: "TSM Tool",
    imagens: ["/laptops/tsm-1.png", "/laptops/tsm-2.png"],
    links: {
      modelos: "https://tsm-tool.com/SupportedModels",
      download: "https://tsm-tool.com/download",
    },
    planos: [
      { nome: "3 horas", preco: 5.5, destaque: true, instantaneo: true },
      { nome: "12 horas", preco: 9, destaque: true },
      { nome: "48 horas", preco: 18 },
      { nome: "168 horas", preco: 35 },
    ],
  },
  {
    nome: "AMT Tool",
    imagens: ["/laptops/amt-1.png", "/laptops/amt-2.png"],
    links: {
      modelos: "https://androidmultitool.com/supported_models/",
      download: "https://androidmultitool.com/",
    },
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
    imagens: ["/laptops/samsung-1.png", "/laptops/samsung-2.png"],
    links: {
      modelos: "https://celltool.io/qcsupportmodel",
      download: "https://celltool.io/",
    },
    planos: [
      { nome: "12 horas", preco: 15, destaque: true, instantaneo: true },
      { nome: "24 horas", preco: 20 },
      { nome: "48 horas", preco: 30 },
      { nome: "72 horas", preco: 35 },
    ],
  },
  {
    nome: "Griffin-Unlocker",
    imagens: ["/laptops/griffin-1.png", "/laptops/griffin-2.png"],
    links: {
      modelos: "https://griffin-unlocker.com/models.html",
      download: "https://griffin-unlocker.com/download.html",
    },
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
  //   planos: [
  //     { nome: "6 horas", preco: 5, destaque: true, instantaneo: true },
  //     { nome: "24 horas", preco: 15 },
  //   ],
  // },
];
