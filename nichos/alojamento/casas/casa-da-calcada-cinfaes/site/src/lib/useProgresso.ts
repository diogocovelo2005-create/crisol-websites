'use client';

import { useScroll, useTransform, type MotionValue } from 'motion/react';
import { useEffect, useRef, type RefObject } from 'react';

/*
  Progresso de scroll de uma seccao, de 0 a 1, calculado a mao.

  Porque nao `useScroll({ target, offset })` do Motion: nesta versao ele
  passa a animacao para a ScrollTimeline nativa do browser, e com seccoes
  `sticky` o progresso sai errado. No hero a promessa aparecia ao descer
  em vez de sair, e ao saltar para o fundo da pagina os atos ficavam
  presos em valores antigos. Aqui mede-se a seccao e deriva-se do
  scrollY da janela, por funcao, que o Motion nao tenta acelerar.

  Modos:
  - 'preso'    de o topo da seccao tocar o topo do ecra ate o fundo dela
               tocar o fundo do ecra. Para seccoes com filho sticky.
  - 'entrada'  de o topo da seccao entrar por baixo ate chegar ao topo.
  - 'passagem' de o topo entrar por baixo ate o fundo sair por cima.
*/
export type Modo = 'preso' | 'entrada' | 'passagem';

export function useProgresso(ref: RefObject<HTMLElement | null>, modo: Modo = 'preso'): MotionValue<number> {
  const { scrollY } = useScroll();
  const medida = useRef({ inicio: 0, curso: 1 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const medir = () => {
      const r = el.getBoundingClientRect();
      const topo = r.top + window.scrollY;
      const vh = window.innerHeight;
      if (modo === 'preso') medida.current = { inicio: topo, curso: Math.max(1, r.height - vh) };
      else if (modo === 'entrada') medida.current = { inicio: topo - vh, curso: vh };
      else medida.current = { inicio: topo - vh, curso: r.height + vh };
    };

    medir();
    // a altura da pagina muda depois de montar (imagens, a visita a ganhar
    // largura): quem esta abaixo tem de voltar a medir
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    ro.observe(document.body);
    // Em ecras de toque a barra do browser muda apenas a altura visivel no
    // primeiro gesto. Recalcular ai altera o curso a meio do scroll e faz as
    // seccoes presas saltarem. Mantemos a medicao para uma mudanca real de
    // largura, como a rotacao do dispositivo.
    let largura = window.innerWidth;
    const aoRedimensionar = () => {
      if (window.innerWidth === largura && window.matchMedia('(hover: none)').matches) return;
      largura = window.innerWidth;
      medir();
    };
    window.addEventListener('resize', aoRedimensionar);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', aoRedimensionar);
    };
  }, [ref, modo]);

  return useTransform(scrollY, (y) => {
    const { inicio, curso } = medida.current;
    return Math.min(1, Math.max(0, (y - inicio) / curso));
  });
}
