'use client';

import { useMotionValueEvent, type MotionValue } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';

/*
  ScrollReveal, do React Bits (DavidHDev/react-bits, TextAnimations).

  Aqui serve as vozes dos hóspedes: as palavras acendem pela ordem em que
  foram ditas, ao ritmo do scroll. Para no sítio quando o dedo para.

  O que mudou em relação ao original:
  - o motor: o original usa o ScrollTrigger do GSAP, que mede o elemento
    no ecrã; com os capítulos presos (sticky) essa medida sai errada.
    Recebe o progresso (0 a 1) de quem o usa, medido no fluxo natural;
  - só opacidade, sem desfocagem nem rotação (filter por palavra é caro);
  - base 0.18, para a frase se ler mesmo parada a meio;
  - escreve a opacidade direto nas palavras, só quando muda: dezenas de
    vozes na página sem um componente por palavra.
*/
type Props = {
  children: string;
  progresso: MotionValue<number>;
  className?: string;
  lang?: string;
  base?: number;
};

export default function ScrollReveal({ children, progresso, className = '', lang, base = 0.18 }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const ultimo = useRef<number[]>([]);

  const partes = useMemo(() => children.split(/(\s+)/), [children]);
  const total = partes.filter((p) => !/^\s+$/.test(p)).length;

  const pintar = (t: number) => {
    const el = ref.current;
    if (!el) return;
    const palavras = el.querySelectorAll<HTMLSpanElement>('[data-palavra]');
    // cada palavra acende numa janela curta, que corre do início ao fim
    const janela = Math.min(1, 4 / Math.max(1, total));
    palavras.forEach((s, i) => {
      const k = Math.min(1, Math.max(0, (t * (1 + janela) - i / total) / janela));
      const o = Math.round((base + (1 - base) * k) * 100) / 100;
      if (ultimo.current[i] !== o) {
        ultimo.current[i] = o;
        s.style.opacity = String(o);
      }
    });
  };

  useMotionValueEvent(progresso, 'change', pintar);
  useEffect(() => {
    pintar(progresso.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  let i = 0;
  return (
    <p ref={ref} lang={lang} className={className}>
      {partes.map((p, k) =>
        /^\s+$/.test(p) ? (
          p
        ) : (
          <span key={k} data-palavra={i++}>
            {p}
          </span>
        ),
      )}
    </p>
  );
}
