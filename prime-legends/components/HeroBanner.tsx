"use client";

import { useState, useEffect } from "react";

// 👉 Vá adicionando mais banners aqui conforme criar novas artes
const banners = [
  "/banners/banner-1.webp",
  "/banners/banner-2.webp",
  "/banners/banner-3.webp",
];

const INTERVALO_MS = 5000;

export default function HeroBanner() {
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const intervalo = setInterval(() => {
      setAtual((prev) => (prev + 1) % banners.length);
    }, INTERVALO_MS);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-yellow-500/20 aspect-[12/5]">
      {banners.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`Banner ${i + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
            i === atual ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setAtual(i)}
              aria-label={`Ver banner ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === atual ? "w-6 bg-amber-400" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
