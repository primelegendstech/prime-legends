import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Backblaze B2 tem uma API compatível com S3 — só aponta pro endpoint da
// sua região do B2. As variáveis abaixo vêm do painel do Backblaze:
// App Keys > Add a New Application Key (dê acesso só ao bucket que você
// criar). O endpoint aparece na página do próprio bucket (ex:
// "s3.us-west-004.backblazeb2.com").
const b2 = new S3Client({
  region: process.env.B2_REGION || "us-west-004",
  endpoint: `https://${process.env.B2_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APPLICATION_KEY!,
  },
});

const BUCKET = process.env.B2_BUCKET_NAME!;
const LINK_EXPIRA_SEGUNDOS = 60 * 60 * 72; // 72h pra baixar

// Gera um link de download temporário e assinado pro arquivo no bucket B2.
// Só chame isso DEPOIS de confirmar que o pagamento foi aprovado — o link
// funciona pra qualquer um que o receba até expirar, então ele nunca deve
// ser gerado (nem exposto) antes disso.
export async function gerarLinkDownloadB2(caminhoArquivo: string): Promise<string> {
  const comando = new GetObjectCommand({ Bucket: BUCKET, Key: caminhoArquivo });
  return getSignedUrl(b2, comando, { expiresIn: LINK_EXPIRA_SEGUNDOS });
}

