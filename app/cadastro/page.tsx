"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { useIdioma } from "@/context/LanguageContext";

const textos = {
  pt: {
    titulo: "Criar conta",
    subtitulo: "Opcional — só se você quiser saldo pré-pago e histórico de pedidos.",
    nome: "Nome",
    email: "E-mail",
    senha: "Senha",
    senhaHint: "Mínimo 6 caracteres",
    criar: "Criar conta",
    criando: "Criando conta...",
    jaTemConta: "Já tem conta?",
    entrar: "Entrar",
    continuarSemConta: "Continuar sem conta",
    erroSenhaCurta: "A senha precisa ter pelo menos 6 caracteres.",
    erroJaExiste: "Esse e-mail já tem conta. Tente entrar.",
    erroGenerico: "Não foi possível criar a conta. Tente novamente.",
    enviadoTitulo: "Quase lá!",
    enviadoTexto: "Enviamos um link de confirmação para",
  },
  en: {
    titulo: "Create account",
    subtitulo: "Optional — only if you want prepaid balance and order history.",
    nome: "Name",
    email: "Email",
    senha: "Password",
    senhaHint: "At least 6 characters",
    criar: "Create account",
    criando: "Creating account...",
    jaTemConta: "Already have an account?",
    entrar: "Sign in",
    continuarSemConta: "Continue without an account",
    erroSenhaCurta: "Password must be at least 6 characters.",
    erroJaExiste: "This email already has an account. Try signing in.",
    erroGenerico: "Couldn't create the account. Please try again.",
    enviadoTitulo: "Almost there!",
    enviadoTexto: "We sent a confirmation link to",
  },
};

export default function CadastroPage() {
  const supabase = createClient();
  const { idioma } = useIdioma();
  const t = textos[idioma];

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro(t.erroSenhaCurta);
      return;
    }

    setCarregando(true);

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    setCarregando(false);

    if (error) {
      setErro(
        error.message.includes("already registered") ? t.erroJaExiste : t.erroGenerico
      );
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 pt-24 pb-10">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-black text-white mb-2">{t.enviadoTitulo}</h1>
          <p className="text-gray-400">
            {t.enviadoTexto} <strong className="text-yellow-400">{email}</strong>.
          </p>
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
              {t.nome}
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-yellow-500/20 bg-white/[0.03] px-3 py-2.5 text-white outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/40 transition"
            />
          </div>

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
              placeholder={t.senhaHint}
            />
          </div>

          {erro && <p className="text-sm text-red-400">{erro}</p>}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black py-2.5 font-bold hover:brightness-110 disabled:opacity-60 transition"
          >
            {carregando ? t.criando : t.criar}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-5">
          {t.jaTemConta}{" "}
          <Link href="/entrar" className="text-yellow-400 font-semibold hover:underline">
            {t.entrar}
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
