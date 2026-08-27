import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";

// Lista de e-mails autorizados a acessar o /admin, configurada na variável
// de ambiente ADMIN_EMAILS (separados por vírgula). Pra adicionar um novo
// admin: só editar essa variável na Vercel e redeployar — não precisa mexer
// em código nem no banco.
// Ex: ADMIN_EMAILS="voce@gmail.com,socio@gmail.com"
function listaAdmins(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function emailEhAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return listaAdmins().includes(email.toLowerCase());
}

// Usado em Server Components (páginas do /admin). Redireciona pra fora se
// não estiver logado ou se o e-mail não estiver na lista de admins.
export async function exigirAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?redirect=/admin");
  }

  if (!emailEhAdmin(user.email)) {
    redirect("/");
  }

  return user;
}

// Usado em API routes do /admin (app/api/admin/**). Retorna o usuário se for
// admin, ou null se não for — a rota decide o status HTTP de resposta.
export async function verificarAdminApi() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !emailEhAdmin(user.email)) {
    return null;
  }

  return user;
}
