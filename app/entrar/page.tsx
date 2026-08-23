"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { useIdioma } from "@/context/LanguageContext";

const textos = {
  pt: {
    titulo: "Entrar na sua conta",
    subtitulo: "Acesse seu saldo e histórico de pedidos.",
    email: "E-mail",
    senha: "Senha",
    entrar: "Entrar",
    entrando: "Entrando...",
    semConta: "Ainda não tem conta?",
    criarConta: "Criar conta",
    continuarSemConta: "Continuar sem conta",
    esqueceuSenha: "Esqueceu sua senha?",
    erroCredenciais: "E-mail ou senha incorretos.",
    erroGenerico: "Não foi possível entrar. Tente novamente.",
  },
  en: {
    titulo: "Sign in to your account",
    subtitulo: "Access your balance and order history.",
    email: "Email",
    senha: "Password",
    entrar: "Sign in",
    entrando: "Signing in...",
    semConta: "Don't have an account yet?",
    criarConta: "Create account",
    continuarSemConta: "Continue without an account",
    esqueceuSenha: "Forgot your password?",
    erroCredenciais: "Incorrect email or password.",
    erroGenerico: "Couldn't sign in. Please try again.",
  },
};

export default function EntrarPage() {
  const router = useRouter();
  const supabase = createClient();
  const { idioma } = useIdioma();
  const t = textos[idioma];

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    setCarregando(false);

    if (error) {
      setErro(
        error.message === "Invalid login credentials"
          ? t.erroCredenciais
          : t.erroGenerico
      );
      return;
    }

    router.push("/minha-conta");
    router.refresh();
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

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              {t.senha}
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-yellow-500/20 bg-white/[0.03] px-3 py-2.5 text-white outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/40 transition"
              placeholder="••••••••"
            />
          </div>

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <div className="text-right">
            <Link href="/esqueci-senha" className="text-xs text-gray-400 hover:text-yellow-400">
              {t.esqueceuSenha}
            </Link>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black py-2.5 font-bold hover:brightness-110 disabled:opacity-60 transition"
          >
            {carregando ? t.entrando : t.entrar}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-5">
          {t.semConta}{" "}
          <Link href="/cadastro" className="text-yellow-400 font-semibold hover:underline">
            {t.criarConta}
          </Link>
        </p>
        <p className="text-sm text-gray-500 mt-1">
          <Link href="/" className="hover:text-gray-300">
            {t.continuarSemConta}
          </Link>
        </p>
      </div>
    </main>
  );
}
