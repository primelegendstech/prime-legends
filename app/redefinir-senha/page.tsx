"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { useIdioma } from "@/context/LanguageContext";

const textos = {
  pt: {
    titulo: "Definir nova senha",
    subtitulo: "Escolha uma nova senha para sua conta.",
    novaSenha: "Nova senha",
    senhaHint: "Mínimo 6 caracteres",
    confirmarSenha: "Confirmar nova senha",
    salvar: "Salvar nova senha",
    salvando: "Salvando...",
    erroSenhaCurta: "A senha precisa ter pelo menos 6 caracteres.",
    erroNaoConfere: "As senhas não conferem.",
    erroGenerico:
      "Não foi possível redefinir a senha. O link pode ter expirado — solicite um novo.",
    sucesso: "Senha atualizada! Redirecionando...",
  },
  en: {
    titulo: "Set a new password",
    subtitulo: "Choose a new password for your account.",
    novaSenha: "New password",
    senhaHint: "At least 6 characters",
    confirmarSenha: "Confirm new password",
    salvar: "Save new password",
    salvando: "Saving...",
    erroSenhaCurta: "Password must be at least 6 characters.",
    erroNaoConfere: "Passwords don't match.",
    erroGenerico:
      "Couldn't reset the password. The link may have expired — request a new one.",
    sucesso: "Password updated! Redirecting...",
  },
};

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const supabase = createClient();
  const { idioma } = useIdioma();
  const t = textos[idioma];

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (senha.length < 6) {
      setErro(t.erroSenhaCurta);
      return;
    }
    if (senha !== confirmarSenha) {
      setErro(t.erroNaoConfere);
      return;
    }

    setCarregando(true);

    const { error } = await supabase.auth.updateUser({ password: senha });

    setCarregando(false);

    if (error) {
      setErro(t.erroGenerico);
      return;
    }

    setSucesso(true);
    setTimeout(() => {
      router.push("/minha-conta");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4 pt-24 pb-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-black text-white mb-1">{t.titulo}</h1>
        <p className="text-sm text-gray-400 mb-6">{t.subtitulo}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              {t.novaSenha}
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

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-1">
              {t.confirmarSenha}
            </label>
            <input
              type="password"
              required
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              className="w-full rounded-lg border border-yellow-500/20 bg-white/[0.03] px-3 py-2.5 text-white outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/40 transition"
            />
          </div>

          {erro && <p className="text-sm text-red-400">{erro}</p>}
          {sucesso && <p className="text-sm text-green-400">{t.sucesso}</p>}

          <button
            type="submit"
            disabled={carregando || sucesso}
            className="w-full rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black py-2.5 font-bold hover:brightness-110 disabled:opacity-60 transition"
          >
            {carregando ? t.salvando : t.salvar}
          </button>
        </form>
      </div>
    </main>
  );
}
