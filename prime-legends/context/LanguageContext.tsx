"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Idioma = "pt" | "en";

interface LanguageContextType {
  idioma: Idioma;
  trocarIdioma: (novo: Idioma) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [idioma, setIdioma] = useState<Idioma>("pt");

  useEffect(() => {
    const salvo = localStorage.getItem("idioma") as Idioma | null;
    if (salvo === "pt" || salvo === "en") {
      setIdioma(salvo);
    }
  }, []);

  function trocarIdioma(novo: Idioma) {
    setIdioma(novo);
    localStorage.setItem("idioma", novo);
  }

  return (
    <LanguageContext.Provider value={{ idioma, trocarIdioma }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useIdioma() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useIdioma precisa estar dentro de LanguageProvider");
  }
  return context;
}