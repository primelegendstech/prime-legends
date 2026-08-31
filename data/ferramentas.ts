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
    online:true,
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

  {
    nome: "Alien Tool",
    badge: "Motorola/Infinix",
    imagens: ["/laptops/alien-tool-1.webp"],
    links: {
      modelos: "https://alientool.app/index.html#download",
      download: "https://alientool.app/index.html#download",
    },
    video: "",
    obs: "Pagamento aprovado, nossa equipe libera o login e senha manualmente — você recebe por e-mail em poucos minutos. Ferramenta especializada em remoção de FRP e desbloqueio de bootloader Motorola/Infinix (MediaTek), com bypass de MDM, RomPatch Motorola/Xiaomi e redefinições ilimitadas de HWID.",
    planos: [{ nome: "6 horas", preco: 15, destaque: true }],
  },
  {
    nome: "TFM Tool",
    imagens: ["/laptops/tfmtool.webp"],
    links: {
      modelos: "https://tfmtool.com/supports",
      download: "https://tfmtool.com/",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. TFM Tool Pro: atualização de firmware, restauração de fábrica, desbloqueio de FRP, remoção de bloqueio de privacidade e desbloqueio de rede e bootloader, com interface simples e direta.",
    planos: [{ nome: "6 horas", preco: 5.5, destaque: true, instantaneo: true }],
  },
  {
    nome: "MDM Fix Tool",
    badge: "Acesso Premium",
    imagens: ["/laptops/mdmfix.webp"],
    links: {
      modelos: "https://mdmfixtool.com/supported_models",
      download: "https://mdmfixtool.com/",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. Ferramenta especializada em desbloqueio de KG/MDM e remoção de admin do dispositivo (Android IT Admin Remove).",
    planos: [{ nome: "6 horas", preco: 8.7, destaque: true, instantaneo: true }],
  },
  {
    nome: "DFT Pro",
    imagens: ["/laptops/dftpro.webp"],
    links: {
      modelos: "https://www.dftpro.com/#downloads-section",
      download: "https://www.dftpro.com/#downloads-section",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. Solução avançada para atualizar, reparar e desbloquear smartphones.",
    planos: [{ nome: "48 horas", preco: 12, destaque: true, instantaneo: true }],
  },
  {
    nome: "AndroidWinTool (AWT)",
    imagens: ["/laptops/awt.webp"],
    links: {
      modelos: "https://androidwintool.com/supported-models",
      download: "https://androidwintool.com/download",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. Repara IMEI/MEID/número de série, instala firmware original e ROMs personalizadas, e desbloqueia contas Google, Samsung, Mi e FRP.",
    planos: [{ nome: "48 horas", preco: 12, destaque: true, instantaneo: true }],
  },
  {
    nome: "AnonySHU Tool",
    badge: "Entrega Rápida",
    imagens: ["/laptops/anony.webp"],
    links: {
      modelos: "https://amojons.com/devices_support",
      download: "https://amojons.com/",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. Solução avançada de desbloqueio MDM, com restauração de fábrica e habilitação de ADB em poucos cliques.",
    planos: [{ nome: "12 horas", preco: 16.5, destaque: true, instantaneo: true }],
  },
  {
    nome: "KG Killer Tool",
    imagens: ["/laptops/kgkiller.webp"],
    links: {
      modelos: "https://kgkiller.com/support_Devices",
      download: "https://kgkiller.com/downloads",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente.",
    planos: [{ nome: "4 horas", preco: 7.2, destaque: true, instantaneo: true }],
  },
  {
    nome: "MST (MobileSea Service Tool)",
    imagens: ["/laptops/MST.webp"],
    links: {
      modelos: "https://www.mobileseaservice.net/devices?module=qcom",
      download: "https://www.mobileseaservice.net/download",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente.",
    planos: [{ nome: "6 horas", preco: 5, destaque: true, instantaneo: true }],
  },
  {
    nome: "CF-Tools",
    imagens: ["/laptops/cftool.webp"],
    links: {
      modelos: "https://www.cftoolsid.com/supported-models",
      download: "https://t.me/cftools/13156",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. Flash de firmware multimarca, desbloqueio de conta Mi/FRP/tela e reparo com um clique via QCOM e MTK.",
    planos: [{ nome: "12 horas", preco: 5.5, destaque: true, instantaneo: true }],
  },
  {
    nome: "Hydra Tool (Sem Dongle)",
    badge: "Sem Dongle",
    imagens: ["/laptops/hydra.webp"],
    links: {
      modelos: "https://www.hydradongle.com/devices",
      download: "https://www.hydradongle.com/download/software",
    },
    video: "",
    obs: "Após o pagamento, o login e senha são liberados automaticamente. Remoção de FRP com um clique, backup/restauração de firmware original e desbloqueio de dispositivos demo — sem necessidade de dongle físico.",
    planos: [{ nome: "24 horas", preco: 5.9, destaque: true, instantaneo: true }],
  },
  {
    nome: "Pandora Tool",
    badge: "Promoção",
    imagens: ["/laptops/pandora-aluguel.webp"],
    links: {
      modelos: "https://z3x-team.com/download/",
      download: "https://z3x-team.com/download/",
    },
    video: "",
    obs: "Pagamento aprovado, nossa equipe libera o login e senha manualmente — você recebe por e-mail em poucos minutos. Z3X Pandora Tool para reparo de smartphones e tablets com chipset Mediatek.",
    planos: [{ nome: "48 horas", preco: 47.5, destaque: true }],
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
