"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { useIdioma } from "@/context/LanguageContext";

const textos = {
  pt: {
    titulo: "Esqueceu sua senha?",
    subtitulo: "Digite seu e-mail e enviaremos um link para redefinir a senha.",
    email: "E-mail",
    enviar: "Enviar link",
    enviando: "Enviando...",
    voltar: "Voltar para o login",
    erroGenerico: "Não foi possível enviar o link. Tente novamente.",
    enviadoTitulo: "Link enviado!",
    enviadoTexto: "Enviamos um link de redefinição de senha para",
  },
  en: {
    titulo: "Forgot your password?",
    subtitulo: "Enter your email and we'll send you a link to reset it.",
    email: "Email",
    enviar: "Send link",
    enviando: "Sending...",
    voltar: "Back to sign in",
    erroGenerico: "Couldn't send the link. Please try again.",
    enviadoTitulo: "Link sent!",
    enviadoTexto: "We sent a password reset link to",
  },
};

export default function EsqueciSenhaPage() {
  const supabase = createClient();
  const { idioma } = useIdioma();
  const t = textos[idioma];

  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/redefinir-senha`,
    });

    setCarregando(false);

    if (error) {
      setErro(t.erroGenerico);
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 pt-24 pb-10">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-black text-white mb-2">{t.enviadoTitulo}</h1>
          <p className="text-gray-400 mb-6">
            {t.enviadoTexto} <strong className="text-yellow-400">{email}</strong>.
          </p>
          <Link href="/entrar" className="text-yellow-400 font-semibold hover:underline">
            {t.voltar}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 pt-24 pb-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-black text-white mb-1">{t.titulo}</h1>
        <p className="text-sm text-gray-400 mb-6">{t.subtitulo}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              {t.email}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-yellow-500/20 bg-white/[0.03] px-3 py-2.5 text-white outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/40 transition"
              placeholder="seu@email.com"
            />
          </div>

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black py-2.5 font-bold hover:brightness-110 disabled:opacity-60 transition"
          >
            {carregando ? t.enviando : t.enviar}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-5">
          <Link href="/entrar" className="text-yellow-400 font-semibold hover:underline">
            {t.voltar}
          </Link>
        </p>
      </div>
    </main>
  );
}
