import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteção extra (defesa em profundidade) pro /admin e suas rotas de API:
  // além da checagem que já existe dentro de cada página/rota via
  // lib/admin.ts, barra aqui também no nível do middleware, antes de
  // qualquer coisa renderizar ou qualquer API rodar.
  const ehAreaAdmin =
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/api/admin");

  if (ehAreaAdmin) {
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const autorizado = !!user?.email && adminEmails.includes(user.email.toLowerCase());

    if (!autorizado) {
      // Rotas de API respondem com 401 (sem redirecionar, senão o front
      // recebe HTML de redirect em vez de JSON). Páginas normais redirecionam.
      if (request.nextUrl.pathname.startsWith("/api/admin")) {
        return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
      }
      if (!user) {
        const loginUrl = new URL("/entrar", request.url);
        loginUrl.searchParams.set("redirect", "/admin");
        return NextResponse.redirect(loginUrl);
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
