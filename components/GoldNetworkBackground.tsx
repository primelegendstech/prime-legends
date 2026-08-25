"use client";

import { useEffect, useRef } from "react";

type Particula = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

export default function GoldNetworkBackground({
  quantidade = 55,
  distanciaConexao = 130,
}: {
  quantidade?: number;
  distanciaConexao?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefereReduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let largura = 0;
    let altura = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particulas: Particula[] = [];
    let animId = 0;

    function criarParticulas() {
      particulas = Array.from({ length: quantidade }, () => ({
        x: Math.random() * largura,
        y: Math.random() * altura,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.8,
      }));
    }

    function redimensionar() {
      const container = canvas!.parentElement;
      largura = container ? container.clientWidth : window.innerWidth;
      altura = container ? container.clientHeight : window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = largura * dpr;
      canvas!.height = altura * dpr;
      canvas!.style.width = `${largura}px`;
      canvas!.style.height = `${altura}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      criarParticulas();
    }

    function desenhar() {
      ctx!.clearRect(0, 0, largura, altura);

      // conexões
      for (let i = 0; i < particulas.length; i++) {
        for (let j = i + 1; j < particulas.length; j++) {
          const a = particulas[i];
          const b = particulas[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < distanciaConexao) {
            const opacidade = (1 - dist / distanciaConexao) * 0.35;
            ctx!.strokeStyle = `rgba(212, 175, 55, ${opacidade})`;
            ctx!.lineWidth = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // pontos
      for (const p of particulas) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(255, 209, 102, 0.85)";
        ctx!.shadowColor = "rgba(255, 200, 60, 0.9)";
        ctx!.shadowBlur = 4;
        ctx!.fill();
      }
    }

    function atualizar() {
      for (const p of particulas) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > largura) p.vx *= -1;
        if (p.y < 0 || p.y > altura) p.vy *= -1;
      }
    }

    function loop() {
      atualizar();
      desenhar();
      animId = requestAnimationFrame(loop);
    }

    redimensionar();
    desenhar();

    if (!prefereReduzido) {
      animId = requestAnimationFrame(loop);
    }

    window.addEventListener("resize", redimensionar);
    return () => {
      window.removeEventListener("resize", redimensionar);
      if (animId) cancelAnimationFrame(animId);
    };
  }, [quantidade, distanciaConexao]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 opacity-70"
      aria-hidden="true"
    />
  );
}
