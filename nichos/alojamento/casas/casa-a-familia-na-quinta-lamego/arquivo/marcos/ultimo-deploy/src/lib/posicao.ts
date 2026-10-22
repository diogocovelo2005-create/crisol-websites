'use client';

import { useMotionValue, useScroll, type MotionValue } from 'motion/react';
import { useEffect, useRef, type RefObject } from 'react';

/*
  Onde está um elemento no ecrã, para as animações presas ao scroll.

  Porque não getBoundingClientRect: quando uma secção fica presa (sticky),
  a posição no ecrã dos elementos dela já não é a do fluxo, e uma medida
  feita nesse momento estragava tudo (era o defeito do ScrollReveal
  original e do useScroll com target). Aqui mede-se a posição natural:
  offsetTop (ignora transforms) até ao primeiro antepassado preso, e o
  topo desse pela soma das alturas dos irmãos antes dele, sem o
  deslocamento do sticky. Conta como preso qualquer elemento com
  `position: sticky` ou com o atributo `data-capitulo` (para uma secção
  que só prende às vezes).

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

// Os filhos que ocupam lugar no fluxo (os de `display: contents` contam
// pelos filhos deles; os absolutos não contam).
function filhosEmFluxo(pai: HTMLElement, lista: HTMLElement[] = []): HTMLElement[] {
  for (const f of Array.from(pai.children) as HTMLElement[]) {
    const s = getComputedStyle(f);
    if (s.display === 'contents') filhosEmFluxo(f, lista);
    else if (s.position !== 'absolute' && s.position !== 'fixed' && s.display !== 'none') lista.push(f);
  }
  return lista;
}

function topoCapitulo(sec: HTMLElement): number {
  let pai = sec.parentElement as HTMLElement;
  while (pai.parentElement && getComputedStyle(pai).display === 'contents') pai = pai.parentElement;
  const sp = getComputedStyle(pai);
  const mt = parseFloat(getComputedStyle(sec).marginTop);
  const emColuna = sp.display === 'block' || sp.display === 'flow-root' || (sp.display.includes('flex') && sp.flexDirection.startsWith('column'));
  const irmaos = filhosEmFluxo(pai);
  const anterior = irmaos[irmaos.indexOf(sec) - 1];
  // Num pai em linha (flex em linha, grelha) a posição não vem dos irmãos:
  // fica o topo do conteúdo do pai (o sticky alinha-se aí).
  if (!emColuna || !anterior) return topoNatural(pai) + pai.clientTop + parseFloat(sp.paddingTop) + mt;
  // Logo a seguir ao irmão anterior (as margens verticais colapsam).
  const mb = parseFloat(getComputedStyle(anterior).marginBottom);
  const vao = sp.display === 'block' || sp.display === 'flow-root' ? Math.max(mb, mt) : mb + mt + (parseFloat(sp.rowGap) || 0);
  return topoNatural(anterior) + anterior.offsetHeight + vao;
}

/** Topo do elemento no documento, como se nenhum capítulo estivesse preso. */
export function topoNatural(el: HTMLElement): number {
  let y = 0;
  let n: HTMLElement | null = el;
  while (n) {
    if (n.dataset.capitulo !== undefined || getComputedStyle(n).position === 'sticky') return y + topoCapitulo(n);
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
