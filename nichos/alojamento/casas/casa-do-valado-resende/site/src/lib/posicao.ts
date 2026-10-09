'use client';

import { useMotionValue, useScroll, type MotionValue } from 'motion/react';
import { useEffect, useRef, type RefObject } from 'react';

/*
  Onde está um elemento no ecrã, para as animações presas ao scroll.

  Porque não getBoundingClientRect: os capítulos ficam presos (sticky) no
  fim e a secção seguinte sobe por cima deles. Enquanto um capítulo está
  preso, a posição no ecrã dos elementos dele já não é a do fluxo, e uma
  medida feita nesse momento estragava tudo. Aqui mede-se a posição
  natural: offsetTop até ao capítulo (ignora transforms e o sticky dos
  filhos) e o topo do capítulo pela soma das alturas dos irmãos antes
  dele.

  Uma só ResizeObserver para a página inteira avisa todos os elementos
  quando é preciso voltar a medir. No telemóvel, a barra do browser a
  esconder-se muda só a altura: aí não se mede de novo, senão o que está
  preso ao dedo saltava a meio do gesto.
*/

export type Medida = { topo: number; altura: number; vh: number };

const ouvintes = new Set<() => void>();
let ligado = false;

function ligar() {
  if (ligado || typeof window === 'undefined') return;
  ligado = true;
  let pendente = 0;
  const avisar = () => {
    cancelAnimationFrame(pendente);
    pendente = requestAnimationFrame(() => ouvintes.forEach((f) => f()));
  };
  new ResizeObserver(avisar).observe(document.body);
  let largura = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === largura && window.matchMedia('(hover: none)').matches) return;
    largura = window.innerWidth;
    avisar();
  });
  document.fonts?.ready.then(avisar);
}

/** Chamada sempre que a página pode ter mudado de medidas. */
export function aoMedir(f: () => void) {
  ligar();
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
}

function topoCapitulo(sec: HTMLElement): number {
  const pai = sec.parentElement as HTMLElement;
  let y = topoNatural(pai);
  for (const irmao of Array.from(pai.children)) {
    if (irmao === sec) break;
    y += (irmao as HTMLElement).offsetHeight;
  }
  return y;
}

/** Topo do elemento no documento, como se nenhum capítulo estivesse preso. */
export function topoNatural(el: HTMLElement): number {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n) {
    if (n.dataset.capitulo !== undefined) return y + topoCapitulo(n);
    y += n.offsetTop;
    const p = n.offsetParent as HTMLElement | null;
    if (!p || p === document.body) return y;
    n = p;
  }
  return y;
}

/** Distância do topo de `el` ao topo de `ancestral`, sem transforms. */
export function topoDentro(el: HTMLElement, ancestral: HTMLElement): number {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== ancestral) {
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return y;
}

/**
 * `pos`: o topo natural do elemento em relação ao topo do ecrã, em px
 * (positivo abaixo). Muda com o scroll e quando a página volta a medir.
 * `medida`: altura do elemento e altura do ecrã da última medição.
 */
export function useMedida(ref: RefObject<HTMLElement | null>): { pos: MotionValue<number>; medida: RefObject<Medida> } {
  const { scrollY } = useScroll();
  const medida = useRef<Medida>({ topo: 1e6, altura: 1, vh: 800 });
  const pos = useMotionValue(1e6);

  useEffect(() => {
    const atualizar = () => pos.set(medida.current.topo - window.scrollY);
    const medir = () => {
      const el = ref.current;
      if (!el) return;
      medida.current = { topo: topoNatural(el), altura: el.offsetHeight, vh: window.innerHeight };
      atualizar();
    };
    medir();
    const largar = aoMedir(medir);
    const parar = scrollY.on('change', atualizar);
    return () => {
      largar();
      parar();
    };
  }, [ref, pos, scrollY]);

  return { pos, medida };
}

export const prender = (v: number) => Math.min(1, Math.max(0, v));
