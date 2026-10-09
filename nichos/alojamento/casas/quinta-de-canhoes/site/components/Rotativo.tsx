"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export type Testemunho = {
  texto: string;
  autor: string;
  contexto: string;
};

type Props = {
  itens: Testemunho[];
  /** Milissegundos entre testemunhos. */
  intervalo?: number;
};

function Seta({ sentido }: { sentido: "anterior" | "seguinte" }) {
  return (
    <svg
      viewBox="0 0 20 12"
      aria-hidden="true"
      className={`h-2.5 w-4 ${sentido === "anterior" ? "rotate-180" : ""}`}
    >
      <path d="M0 6h18M13 1l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Passa os testemunhos um a um, de cinco em cinco segundos. Pára quando o
 * rato está por cima, quando o separador não está visível, e assim que a
 * pessoa usa as setas. Fica estático se o sistema pedir menos movimento.
 */
export function Rotativo({ itens, intervalo = 5000 }: Props) {
  const [atual, setAtual] = useState(0);
  const [direcao, setDirecao] = useState(1);
  const [parado, setParado] = useState(false);
  const semMovimento = useReducedMotion();

  const mover = useCallback(
    (passo: number) => {
      setDirecao(passo);
      setAtual((i) => (i + passo + itens.length) % itens.length);
    },
    [itens.length],
  );

  useEffect(() => {
    if (parado || itens.length < 2) return;
    const t = setInterval(() => mover(1), intervalo);
    return () => clearInterval(t);
  }, [parado, mover, intervalo, itens.length, atual]);

  useEffect(() => {
    const aoMudar = () => setParado(document.hidden);
    document.addEventListener("visibilitychange", aoMudar);
    return () => document.removeEventListener("visibilitychange", aoMudar);
  }, []);

  const t = itens[atual];
  const deslocamento = semMovimento ? 0 : 14 * direcao;

  return (
    <div
      onMouseEnter={() => setParado(true)}
      onMouseLeave={() => setParado(false)}
      onFocusCapture={() => setParado(true)}
      onBlurCapture={() => setParado(false)}
    >
      {/* A altura acompanha o testemunho mais comprido para a caixa não saltar. */}
      <div className="relative grid">
        {itens.map((item, i) => (
          <div key={`medida-${i}`} aria-hidden="true" className="invisible col-start-1 row-start-1">
            <p className="text-corpo-grande leading-relaxed">&ldquo;{item.texto}&rdquo;</p>
            <p className="mt-5 text-sm">{item.autor}</p>
            <p className="text-sm">{item.contexto}</p>
          </div>
        ))}

        <div className="col-start-1 row-start-1" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.figure
              key={atual}
              initial={{ opacity: 0, x: deslocamento }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -deslocamento }}
              transition={{ duration: semMovimento ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <blockquote>
                <p className="text-corpo-grande leading-relaxed text-xisto-suave">
                  &ldquo;{t.texto}&rdquo;
                </p>
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="text-xisto">{t.autor}</span>
                <span className="mt-0.5 block text-xisto-medio">{t.contexto}</span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              mover(-1);
              setParado(true);
            }}
            aria-label="Comentário anterior"
            className="flex h-10 w-10 items-center justify-center border border-granito-linha text-xisto-suave transition-colors duration-300 hover:border-caixilho hover:bg-caixilho hover:text-cal"
          >
            <Seta sentido="anterior" />
          </button>
          <button
            type="button"
            onClick={() => {
              mover(1);
              setParado(true);
            }}
            aria-label="Comentário seguinte"
            className="flex h-10 w-10 items-center justify-center border border-granito-linha text-xisto-suave transition-colors duration-300 hover:border-caixilho hover:bg-caixilho hover:text-cal"
          >
            <Seta sentido="seguinte" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {itens.map((item, i) => (
            <button
              key={item.autor}
              type="button"
              onClick={() => {
                setDirecao(i > atual ? 1 : -1);
                setAtual(i);
                setParado(true);
              }}
              aria-label={`Ver o comentário de ${item.autor}`}
              aria-current={i === atual}
              className="group py-2"
            >
              <span
                className={`block h-px w-7 transition-colors duration-500 ${
                  i === atual ? "bg-caixilho" : "bg-granito-linha group-hover:bg-xisto-suave"
                }`}
              />
            </button>
          ))}
        </div>

        <span className="ml-auto text-sm tabular-nums text-xisto-medio">
          {atual + 1} / {itens.length}
        </span>
      </div>
    </div>
  );
}
