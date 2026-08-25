"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Metadata = {
  nome: string;
  celular: string;
  cidade: string;
  pais: string;
  endereco: string;
  moeda: "BRL" | "USDT";
};

const WHATSAPP_SUPORTE = "5581995716227";
const EMAIL_SUPORTE = "primelegendsx@gmail.com";

function Card({ titulo, emoji, children }: { titulo: string; emoji: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-yellow-500/20 bg-white/[0.03] p-5 md:p-6">
      <h2 className="text-white font-bold mb-5 flex items-center gap-2">
        <span>{emoji}</span> {titulo}
      </h2>
      {children}
    </div>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

const classeInput =
  "w-full rounded-lg border border-yellow-500/20 bg-white/[0.03] px-3.5 py-2.5 text-white text-sm outline-none focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/40 transition disabled:opacity-50 disabled:cursor-not-allowed";

export default function PerfilConteudo({
  email,
  metadataInicial,
}: {
  email: string;
  metadataInicial: Metadata;
}) {
  const supabase = createClient();

  // --- Perfil ---
  const [dados, setDados] = useState<Metadata>(metadataInicial);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [statusPerfil, setStatusPerfil] = useState<"idle" | "sucesso" | "erro">("idle");

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    setSalvandoPerfil(true);
    setStatusPerfil("idle");

    const { error } = await supabase.auth.updateUser({
      data: {
        nome: dados.nome,
        celular: dados.celular,
        cidade: dados.cidade,
        pais: dados.pais,
        endereco: dados.endereco,
        moeda: dados.moeda,
      },
    });

    setSalvandoPerfil(false);
    setStatusPerfil(error ? "erro" : "sucesso");
  }

  // --- Senha ---
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [statusSenha, setStatusSenha] = useState<"idle" | "sucesso" | "erro" | "naoConfere" | "curta">(
    "idle"
  );

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault();

    if (novaSenha.length < 6) {
      setStatusSenha("curta");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setStatusSenha("naoConfere");
      return;
    }

    setSalvandoSenha(true);
    setStatusSenha("idle");

    const { error } = await supabase.auth.updateUser({ password: novaSenha });

    setSalvandoSenha(false);
    if (error) {
      setStatusSenha("erro");
    } else {
      setStatusSenha("sucesso");
      setNovaSenha("");
      setConfirmarSenha("");
    }
  }

  const mensagemWhatsApp = encodeURIComponent(
    "Olá! Preciso de suporte com a minha conta na Prime Legends."
  );

  return (
    <div className="space-y-6">
      {/* PERFIL */}
      <Card titulo="Perfil" emoji="👤">
        <form onSubmit={salvarPerfil} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Campo label="E-mail">
              <input type="email" value={email} disabled className={classeInput} />
            </Campo>

            <Campo label="Moeda preferida">
              <select
                value={dados.moeda}
                onChange={(e) => setDados({ ...dados, moeda: e.target.value as "BRL" | "USDT" })}
                className={classeInput}
              >
                <option value="BRL">Real (BRL)</option>
                <option value="USDT">USDT</option>
              </select>
            </Campo>

            <Campo label="Nome">
              <input
                type="text"
                value={dados.nome}
                onChange={(e) => setDados({ ...dados, nome: e.target.value })}
                className={classeInput}
                placeholder="Seu nome"
              />
            </Campo>

            <Campo label="Celular">
              <input
                type="tel"
                value={dados.celular}
                onChange={(e) => setDados({ ...dados, celular: e.target.value })}
                className={classeInput}
                placeholder="(81) 9 9999-9999"
              />
            </Campo>

            <Campo label="Cidade">
              <input
                type="text"
                value={dados.cidade}
                onChange={(e) => setDados({ ...dados, cidade: e.target.value })}
                className={classeInput}
                placeholder="Sua cidade"
              />
            </Campo>

            <Campo label="País">
              <input
                type="text"
                value={dados.pais}
                onChange={(e) => setDados({ ...dados, pais: e.target.value })}
                className={classeInput}
                placeholder="Seu país"
              />
            </Campo>
          </div>

          <Campo label="Endereço (opcional)">
            <input
              type="text"
              value={dados.endereco}
              onChange={(e) => setDados({ ...dados, endereco: e.target.value })}
              className={classeInput}
              placeholder="Rua, número, bairro..."
            />
          </Campo>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={salvandoPerfil}
              className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold px-5 py-2.5 hover:brightness-110 transition disabled:opacity-60"
            >
              {salvandoPerfil ? "Salvando..." : "Salvar alterações"}
            </button>
            {statusPerfil === "sucesso" && (
              <span className="text-emerald-400 text-sm font-semibold">✓ Perfil atualizado</span>
            )}
            {statusPerfil === "erro" && (
              <span className="text-red-400 text-sm font-semibold">Não foi possível salvar. Tente de novo.</span>
            )}
          </div>
        </form>
      </Card>

      {/* SENHA */}
      <Card titulo="Senha" emoji="🔒">
        <form onSubmit={salvarSenha} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Campo label="Nova senha">
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className={classeInput}
                placeholder="Mínimo 6 caracteres"
              />
            </Campo>
            <Campo label="Confirmar nova senha">
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className={classeInput}
                placeholder="Repita a senha"
              />
            </Campo>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={salvandoSenha}
              className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-sm font-bold px-5 py-2.5 hover:brightness-110 transition disabled:opacity-60"
            >
              {salvandoSenha ? "Salvando..." : "Alterar senha"}
            </button>
            {statusSenha === "sucesso" && (
              <span className="text-emerald-400 text-sm font-semibold">✓ Senha alterada</span>
            )}
            {statusSenha === "curta" && (
              <span className="text-red-400 text-sm font-semibold">Mínimo de 6 caracteres.</span>
            )}
            {statusSenha === "naoConfere" && (
              <span className="text-red-400 text-sm font-semibold">As senhas não conferem.</span>
            )}
            {statusSenha === "erro" && (
              <span className="text-red-400 text-sm font-semibold">Não foi possível alterar. Tente de novo.</span>
            )}
          </div>
        </form>
      </Card>

      {/* SUPORTE */}
      <Card titulo="Suporte" emoji="💬">
        <p className="text-gray-400 text-sm mb-4">
          Precisa de ajuda com seu pedido, pagamento ou acesso? Fale com a gente:
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={`mailto:${EMAIL_SUPORTE}`}
            className="flex items-center gap-2 rounded-lg border border-yellow-500/25 bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-gray-200 hover:border-yellow-500/50 hover:text-yellow-400 transition"
          >
            ✉️ {EMAIL_SUPORTE}
          </a>
          <a
            href={`https://wa.me/${WHATSAPP_SUPORTE}?text=${mensagemWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-4 py-2.5 text-sm font-bold hover:brightness-110 transition"
          >
            📲 Falar no WhatsApp
          </a>
        </div>
      </Card>
    </div>
  );
}
