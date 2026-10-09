'use client';

import { useMotionValueEvent, type MotionValue } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';

/*
  ScrollReveal, do React Bits (DavidHDev/react-bits, TextAnimations).

  Aqui serve a única citação do site, na faixa verde que leva à sala: as
  palavras acendem pela ordem, ao ritmo do scroll, como a luz que muda ao
  fim da tarde. Para no sítio quando o dedo para.

  O que mudou em relação ao original:
  - o motor: o original usa o ScrollTrigger do GSAP, que mede o elemento
    no ecrã e, logo a seguir a um palco preso (sticky), mede mal. Recebe o
    progresso (0 a 1) de quem o usa, do useRevelacao do esqueleto;
  - só opacidade: sem desfocagem nem rotação (filter por palavra é caro e
    a rotação tirava o ar parado da citação);
  - base 0.28: a frase lê-se inteira mesmo parada a meio;
  - escreve a opacidade direto nas palavras, só quando muda.
*/
type Props = {
  children: string;
  progresso: MotionValue<number>;
  className?: string;
  base?: number;
};

export default function ScrollReveal({ children, progresso, className = '', base = 0.28 }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const ultimo = useRef<number[]>([]);

  const partes = useMemo(() => children.split(/(\s+)/), [children]);
  const total = partes.filter((p) => !/^\s+$/.test(p)).length;

  const pintar = (t: number) => {
    const el = ref.current;
    if (!el) return;
    const palavras = el.querySelectorAll<HTMLSpanElement>('[data-palavra]');
    // cada palavra acende numa janela curta que corre do início ao fim
    const janela = Math.min(1, 3 / Math.max(1, total));
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
  }, [children, progresso]);

  let i = 0;
  return (
    <p ref={ref} className={className}>
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
