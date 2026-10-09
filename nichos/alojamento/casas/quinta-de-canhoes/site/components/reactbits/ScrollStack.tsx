import React, { useLayoutEffect, useRef, useCallback } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import Lenis from 'lenis';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
  style?: CSSProperties;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '', style }) => (
  // Adaptado: o cartao nao impoe altura, cor nem padding. Quem usa decide,
  // aqui fica so o que a animacao de empilhamento precisa.
  <div style={style} className={`scroll-stack-card relative w-full box-border origin-top ${itemClassName}`.trim()}>
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  /** Quanto tempo, em altura de ecrã, a pilha completa fica à vista antes
   *  de se soltar e seguir com a página. */
  holdViewports?: number;
  onStackComplete?: () => void;
}

/** Geometria de layout, medida fora do ciclo de animação. */
interface Medidas {
  topos: number[];
  alturaJanela: number;
}

/**
 * Pilha de cartões presa ao scroll.
 *
 * Adaptação de fundo em relação ao original do React Bits: quem prende os
 * cartões é o `position: sticky` do browser, e não um translateY calculado
 * em JavaScript a cada frame.
 *
 * A versão original punha o cartão a compensar o scroll pela mão: para ele
 * parecer parado, o transform tinha de cancelar exactamente o deslocamento
 * da página. Num telemóvel o scroll corre no compositor e o JavaScript
 * corre na linha principal, por isso o transform chegava sempre um ou mais
 * frames atrasado e o cartão tremia contra o dedo. Com sticky, a fixação é
 * feita pelo compositor e não pode dessincronizar.
 *
 * Ao JavaScript sobra a escala, que muda devagar e onde um frame de atraso
 * não se vê.
 */
const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  holdViewports = 0.35,
  onStackComplete
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const ultimasEscalasRef = useRef<number[]>([]);

  // A geometria é medida de uma vez e guardada aqui. O ciclo de animação lê
  // só números, e por isso não força reflow nenhum.
  const medidasRef = useRef<Medidas | null>(null);
  const ultimoScrollRef = useRef(Number.NaN);

  /** Enquanto a pilha está longe do ecrã não há nada a calcular. */
  const activoRef = useRef(true);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  const getElementOffset = useCallback(
    (element: HTMLElement) => {
      if (!useWindowScroll) return element.offsetTop;
      // offsetTop é posição de layout e não é afectado por transforms nem
      // pelo sticky, ao contrário de getBoundingClientRect.
      let y = 0;
      let no: HTMLElement | null = element;
      while (no) {
        y += no.offsetTop;
        no = no.offsetParent as HTMLElement | null;
      }
      return y;
    },
    [useWindowScroll]
  );

  /** Lê o layout e escreve os `top` do sticky. Custa caro, por isso só
   *  corre ao montar, ao redimensionar e quando o conteúdo muda de altura. */
  const medir = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    const alturaJanela = useWindowScroll
      ? window.innerHeight
      : (scrollerRef.current?.clientHeight ?? 0);
    const stackPositionPx = parsePercentage(stackPosition, alturaJanela);

    // Todos os cartões passam a ter a altura do mais alto. Sem isto a pilha
    // sai torta de duas maneiras: os cartões de trás, se forem mais altos,
    // assomam por baixo do da frente e a pilha lê-se como um monte; e, como
    // o sticky larga cada um quando o fim do bloco lhe chega ao pé, os de
    // alturas diferentes largam em alturas de scroll diferentes e
    // desalinham-se à saída.
    cards.forEach(card => {
      card.style.minHeight = '';
      card.style.height = '';
    });
    const maisAlto = cards.reduce((m, c) => Math.max(m, c.offsetHeight), 0);

    cards.forEach((card, i) => {
      card.style.minHeight = `${maisAlto}px`;
      card.style.height = `${maisAlto}px`;
      card.style.top = `${Math.round(stackPositionPx + itemStackDistance * i)}px`;
    });

    medidasRef.current = { topos: cards.map(getElementOffset), alturaJanela };
    ultimoScrollRef.current = Number.NaN;
  }, [getElementOffset, itemStackDistance, parsePercentage, stackPosition, useWindowScroll]);

  /** Só a escala. A posição é do sticky. */
  const actualizarEscalas = useCallback(() => {
    const medidas = medidasRef.current;
    const cards = cardsRef.current;
    if (!medidas || !cards.length) return;

    const scrollTop = useWindowScroll ? window.scrollY : (scrollerRef.current?.scrollTop ?? 0);
    if (scrollTop === ultimoScrollRef.current) return;
    ultimoScrollRef.current = scrollTop;

    const { topos, alturaJanela } = medidas;
    const stackPositionPx = parsePercentage(stackPosition, alturaJanela);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, alturaJanela);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (!card) continue;

      // O cartão encolhe no troço em que se prende: começa quando encosta
      // ao seu lugar na pilha e acaba pouco depois.
      const inicio = topos[i] - stackPositionPx - itemStackDistance * i;
      const fim = topos[i] - scaleEndPositionPx;
      const progresso = fim > inicio ? Math.min(1, Math.max(0, (scrollTop - inicio) / (fim - inicio))) : 0;

      const escalaAlvo = baseScale + i * itemScale;
      const escala = Math.round((1 - progresso * (1 - escalaAlvo)) * 1000) / 1000;

      if (Math.abs((ultimasEscalasRef.current[i] ?? 1) - escala) > 0.001) {
        card.style.transform = escala === 1 ? '' : `scale(${escala})`;
        ultimasEscalasRef.current[i] = escala;
      }

      if (i === cards.length - 1) {
        const completa = progresso >= 1;
        if (completa !== stackCompletedRef.current) {
          stackCompletedRef.current = completa;
          if (completa) onStackComplete?.();
        }
      }
    }
  }, [
    baseScale,
    itemScale,
    itemStackDistance,
    onStackComplete,
    parsePercentage,
    scaleEndPosition,
    stackPosition,
    useWindowScroll
  ]);

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      // O scroll suave global ja vive em <ScrollSuave />. Criar aqui um
      // segundo Lenis sobre a window punha os dois a disputar o mesmo
      // scroll. Ler window.scrollY num ciclo de rAF não custa reflow e
      // apanha também os saltos programáticos, que não disparam evento.
      const ciclo = () => {
        if (activoRef.current) actualizarEscalas();
        animationFrameRef.current = requestAnimationFrame(ciclo);
      };
      animationFrameRef.current = requestAnimationFrame(ciclo);
      return;
    }

    const scroller = scrollerRef.current;
    if (!scroller) return;

    const lenis = new Lenis({
      wrapper: scroller,
      content: scroller.querySelector('.scroll-stack-inner') as HTMLElement,
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      infinite: false,
      gestureOrientation: 'vertical',
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075
    });

    lenis.on('scroll', actualizarEscalas);

    const raf = (time: number) => {
      lenis.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    };
    animationFrameRef.current = requestAnimationFrame(raf);

    lenisRef.current = lenis;
    return lenis;
  }, [actualizarEscalas, useWindowScroll]);

  useLayoutEffect(() => {
    if (!useWindowScroll && !scrollerRef.current) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : (scrollerRef.current?.querySelectorAll('.scroll-stack-card') ?? [])
    ) as HTMLElement[];
    cardsRef.current = cards;
    ultimasEscalasRef.current = cards.map(() => 1);

    const n = cards.length;
    cards.forEach((card, i) => {
      card.style.position = 'sticky';
      card.style.transformOrigin = 'top center';
      card.style.flexShrink = '0';
      // O z-index crescente põe cada cartão à frente do anterior, que é o
      // que faz a pilha parecer um baralho e não uma escada.
      card.style.zIndex = String(i + 1);

      // O sticky larga o cartão quando o fim do bloco lhe chega ao pé, e a
      // margem de baixo entra nessa conta. Dando a cada cartão a margem
      // certa, os quatro largam no mesmo ponto de scroll e descem como um
      // baralho inteiro, em vez de convergirem todos para o mesmo sítio.
      const margemBaixo = itemStackDistance * (n - 1 - i);
      card.style.marginBottom = `${margemBaixo}px`;
      // O afastamento entre cartões no fluxo é o que sobra, posto por cima
      // do cartão seguinte. Sem colapso de margens, porque o bloco é flex.
      card.style.marginTop =
        i === 0 ? '0px' : `${Math.max(0, itemDistance - itemStackDistance * (n - i))}px`;
    });

    medir();
    setupLenis();
    actualizarEscalas();

    const aoRedimensionar = () => medir();
    window.addEventListener('resize', aoRedimensionar);
    window.addEventListener('load', aoRedimensionar);
    // Um ResizeObserver aqui entrava em ciclo: medir escreve a altura dos
    // cartões, o que muda o tamanho do bloco, o que voltava a chamar medir.
    // Estes dois sinais cobrem o que de facto mexe no layout depois de
    // montar, e nenhum deles depende do que nós próprios escrevemos.
    let vivo = true;
    document.fonts?.ready.then(() => {
      if (vivo) medir();
    });

    const vigia = new IntersectionObserver(
      ([entrada]) => {
        activoRef.current = entrada.isIntersecting;
      },
      { rootMargin: '60% 0px 60% 0px' }
    );
    if (scrollerRef.current) vigia.observe(scrollerRef.current);

    return () => {
      vivo = false;
      vigia.disconnect();
      window.removeEventListener('resize', aoRedimensionar);
      window.removeEventListener('load', aoRedimensionar);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (lenisRef.current) lenisRef.current.destroy();
      stackCompletedRef.current = false;
      cardsRef.current = [];
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    actualizarEscalas,
    medir
  ]);

  return (
    <div className={`relative w-full ${className}`.trim()} ref={scrollerRef}>
      {/* Os cartões são sticky dentro deste bloco, e é o fim dele que os
          solta. A folga a seguir ao último cartão é o tempo em que a pilha
          completa fica à vista antes de seguir com a página. */}
      <div
        className="scroll-stack-inner"
        /* Flex em coluna para as margens dos cartões não colaparem umas nas
           outras: a conta que alinha a libertação depende de elas somarem. */
        style={{
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: `${holdViewports * 100}vh`
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ScrollStack;
