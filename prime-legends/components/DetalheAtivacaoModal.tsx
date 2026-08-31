"use client";

import { useState } from "react";
import type { Ativacao, PlanoAtivacao } from "@/data/ativacoes";

type Props = {
  ativacao: Ativacao;
  plano: PlanoAtivacao;
  onFechar: () => void;
  onAtivar: (dados: { nome: string; username: string; senha: string; email: string }) => void;
};

export default function DetalheAtivacaoModal({ ativacao, plano, onFechar, onAtivar }: Props) {
  const [nome, setNome] = useState("");
  const [username, setUsername] = useState("");
  const [senha, setSenha] = useState("");
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const campos = plano.campos ?? {};
  const mostrarUsername = campos.username !== false;
  const usernameLabel = campos.username
    ? campos.username.label
    : `Username cadastrado no ${ativacao.nome}`;
  const mostrarSenha = ativacao.precisaSenha === true && campos.senha !== false;
  const senhaLabel = campos.senha ? campos.senha.label : `Senha cadastrada no ${ativacao.nome}`;
  const mostrarEmail = campos.email !== false;
  const emailLabel = campos.email ? campos.email.label : "E-mail cadastrado na ferramenta";

  function confirmar() {
    if (
      nome.trim() === "" ||
      (mostrarUsername && username.trim() === "") ||
      (mostrarEmail && email.trim() === "") ||
      (mostrarSenha && senha.trim() === "")
    ) {
      setErro("Preencha todos os campos antes de continuar.");
      return;
    }
    setErro(null);
    onAtivar({ nome: nome.trim(), username: username.trim(), senha: senha.trim(), email: email.trim() });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
      onClick={onFechar}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0d0d0d] border border-yellow-500/25 rounded-2xl p-6 md:p-7 animate-hero-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onFechar}
          className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 text-xl leading-none"
          aria-label="Fechar"
        >
          ✕
        </button>

        <h3 className="text-2xl font-black text-white mb-1 flex items-center gap-2 pr-8">
          {ativacao.nome}
          {ativacao.badge && (
            <span className="text-xs font-semibold text-yellow-400 border border-yellow-400 px-2 py-0.5 rounded">
              {ativacao.badge}
            </span>
          )}
        </h3>
        <p className="text-gray-400 text-sm mb-5">Ativação {plano.nome}</p>

        {/* Vídeo, só aparece se tiver link cadastrado */}
        {ativacao.video && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-5 border border-white/10">
            <iframe
              src={ativacao.video}
              title={`Vídeo demonstrativo — ${ativacao.nome}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="flex flex-wrap gap-4 mb-5 text-sm">
          {ativacao.links.modelos && (
            <a
              href={ativacao.links.modelos}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              📋 Ver modelos suportados ➤
            </a>
          )}
          <a
            href={ativacao.links.download}
            target="_blank"
            rel="noopener noreferrer"
            className="text-yellow-400 hover:text-yellow-300 transition"
          >
            ⬇️ Baixar {ativacao.nome} ➤
          </a>
          {ativacao.links.registro && (
            <a
              href={ativacao.links.registro}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              📝 Registre-se ➤
            </a>
          )}
        </div>

        {ativacao.obs && (
          <div className="bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4 mb-5">
            <p className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">
              📌 Observação
            </p>
            <p className="text-sm text-gray-300 leading-relaxed">{ativacao.obs}</p>
          </div>
        )}

        <div className="bg-black/30 border border-yellow-500/10 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            Seus dados para ativação
          </p>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              placeholder="Seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
            />
            {mostrarUsername && (
              <input
                type="text"
                placeholder={usernameLabel}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              />
            )}
            {mostrarSenha && (
              <input
                type="text"
                placeholder={senhaLabel}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              />
            )}
            {mostrarEmail && (
              <input
                type="email"
                placeholder={emailLabel}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              />
            )}
          </div>
          {erro && <p className="text-red-400 text-xs mt-2">{erro}</p>}
        </div>

        <div className="flex items-center justify-between bg-white/[0.03] border border-yellow-500/15 rounded-xl p-4">
          <div>
            <p className="text-xs text-gray-500">Valor da ativação</p>
            <p className="text-xl font-extrabold bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
              R$ {plano.preco.toFixed(2).replace(".", ",")}
            </p>
          </div>
          <button
            onClick={confirmar}
            className="px-6 py-3 rounded-full font-bold text-black bg-gradient-to-r from-yellow-400 to-amber-500 hover:opacity-90 transition text-sm"
          >
            Ativar Agora
          </button>
        </div>
      </div>
    </div>
  );
}
