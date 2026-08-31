// 📦 CATÁLOGO DE ATIVAÇÕES DE LICENÇA
// Para adicionar uma ferramenta nova: copie um bloco inteiro (de { até },)
// e cole no final do array, ajustando os dados. Não precisa mexer em mais
// nenhum outro arquivo — o site atualiza sozinho.

export type CampoConfig = { label: string } | false; // false = ocultar esse campo nesse plano

export type PlanoAtivacao = {
  nome: string;
  preco: number;
  destaque?: boolean;
  tipo?: "ativacao" | "credito"; // "credito" = recarga p/ usuário já ativo. Se não informar, é tratado como "ativacao".
  // Por padrão o formulário pede: nome, username (ou senha, se precisaSenha) e email.
  // Use "campos" pra mudar isso NESSE plano específico: troque o rótulo do campo
  // (ex: username → "HWID") ou oculte um campo passando false.
  campos?: {
    username?: CampoConfig;
    senha?: CampoConfig;
    email?: CampoConfig;
  };
};

export type Ativacao = {
  nome: string;
  badge?: string;
  imagens: string[];
  links: {
    modelos?: string;
    download: string;
    registro?: string;
  };
  video?: string; // link do YouTube (ex: "https://www.youtube.com/embed/XXXXXXXX")
  obs?: string; // mensagem personalizada exibida na tela de detalhe
  precisaSenha?: boolean; // true = pede senha além de username (ex: Chimera Tool)
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
  {
    nome: "Chimera Tool",
    imagens: ["/laptops/chimera-1.webp"], // suba o arquivo em public/laptops/chimera-1.png (veja instruções)
    links: {
      modelos: "https://chimeratool.com/en/models",
      download: "https://chimeratool.com/en/download",
      registro: "https://chimeratool.com/en/signup",
    },
    video: "",
    obs: "Antes de ativar, você precisa ter uma conta criada no site oficial do Chimera Tool. A ativação é feita no username e senha informados abaixo — confira se estão corretos antes de pagar.",
    precisaSenha: true,
    planos: [
      { nome: "1 ano (Basic)", preco: 509.9 },
      { nome: "1 ano (Professional)", preco: 768.9, destaque: true },
      // Plano Premium fica de fora por enquanto: fornecedor (GSM Cheap) está
      // sem estoque nesse serviço (MAXQNT 0). Reative quando voltar:
      // { nome: "1 ano (Premium)", preco: 964.9 },
    ],
  },
  {
    nome: "Moto M Tool",
    imagens: ["/laptops/moto-m-tool-1.webp"],
    links: {
      download: "https://motopatchfirm.nyc3.cdn.digitaloceanspaces.com/App-Updates/Moto-M%20Tool%20Setup.exe",
    },
    video: "",
    obs: "Ativação nova: informe o HWID do aparelho. Renovação ou compra de créditos (usuário já cadastrado): informe o e-mail cadastrado na ferramenta.",
    planos: [
      {
        nome: "Ativação 1 ano - (Novos Usuários)",
        preco: 109.9,
        destaque: true,
        campos: {
          username: { label: "HWID do aparelho" },
          email: false,
        },
      },
      {
        nome: "Renovação 1 ano (Usuário Existente)",
        preco: 109.9,
        campos: {
          username: false,
          email: { label: "E-mail cadastrado na Moto M Tool" },
        },
      },
      {
        nome: "Créditos (usuário existente)",
        preco: 7.48,
        tipo: "credito",
        // Liberação automática via GSM Cheap — só precisa do e-mail cadastrado
        // na ferramenta pra saber em qual conta creditar. Sem username/senha.
        campos: { username: false },
      },
    ],
  },
  {
    nome: "Alien Tool",
    imagens: ["/laptops/alien-tool-1.webp"],
    links: {
      modelos: "URL_MODELOS_ALIEN_TOOL",
      download: "https://alientool.app/",
      registro: "URL_REGISTRO_ALIEN_TOOL",
    },
    video: "",
    obs: "Antes de ativar, você precisa ter uma conta criada no site oficial do Alien Tool. A ativação é feita no e-mail cadastrado na ferramenta — confira se está correto antes de pagar.",
    planos: [
      { nome: "3 meses", preco: 121.54 },
      { nome: "6 meses", preco: 164.9, destaque: true },
      { nome: "12 meses", preco: 217.2, destaque: true },
    ],
  },
];

