'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { useMedia } from '@/lib/usaMedia';
import Revelar from '@/components/Revelar';
import Titulo from '@/components/Titulo';
import DepthCarousel from '@/components/reactbits/DepthCarousel';

/*
  VARIANTE E1 - Faixa lateral (era seccoes/ACasa.tsx).

  Ato 4 - A visita. Sentimento: calma, depois do pico.

  Amanhece outra vez: depois da noite do ato anterior, a pagina volta ao
  linho. No desktop a secao prende-se e o scroll vertical anda de lado
  pelos espacos, pela ordem por que se percorre a casa. O movimento
  lateral le-se como "escolher por onde ir", que e o que este ato e.

  So prende da primeira vez que se desce. Depois de atravessada, a pagina
  deixa de a prender e os cartoes andam com setas, trackpad e rato (ver
  Panoramica). Vem da Casa de Fatauncos (2026-09-18): atravessar a secao
  presa de cada vez que se subia e descia a pagina demorava demais.

  No telemovel e com movimento reduzido nao ha prisao: desliza-se com o
  dedo, que e o gesto natural.
*/

function Cartao({
  e,
  largura,
  formato = 'aspect-[4/5]',
}: {
  e: (typeof casa.visita.espacos)[number];
  largura: string;
  formato?: string;
}) {
  return (
    <li className={`shrink-0 snap-start ${largura}`}>
      <div className={`relative overflow-hidden rounded-[10px] ${formato}`}>
        <Image
          src={e.imagem}
          alt={e.alt}
          fill
          quality={85}
          sizes="(max-width: 1024px) 78vw, 26vw"
          className="object-cover transition-transform duration-700 ease-out hover:scale-[1.04]"
        />
      </div>
      <h3 className="mt-5 text-[1.6rem] text-tinta">{e.nome}</h3>
      <p className="mt-1.5 text-[0.93rem] font-light leading-relaxed text-tinta-medio">{e.nota}</p>
    </li>
  );
}

function Cabeca({ lado }: { lado?: React.ReactNode }) {
  const v = casa.visita;
  return (
    <div className="mx-auto flex w-full max-w-[1320px] items-end justify-between gap-8 px-6 md:px-10">
      <Revelar className="max-w-[620px]">
        <p className="versalete text-ouro-escuro">{v.etiqueta}</p>
        <h2 className="mt-5 text-[2.5rem] text-tinta md:text-[3.2rem]">
          <Titulo texto={v.titulo} />
        </h2>
        <p className="mt-5 max-w-[48ch] font-light leading-[1.8] text-tinta-medio">{v.intro}</p>
      </Revelar>
      {lado}
    </div>
  );
}

/*
  Telemovel: o DepthCarousel do React Bits (o mesmo da Quinta de Canhoes,
  com as adaptacoes que la se fizeram). Os cartoes empilham-se em
  profundidade e passam com o dedo; o nome e a nota do espaco da frente
  aparecem por baixo.

  Nao roda sozinho: o texto por baixo mudava enquanto se lia.
*/
function Carrossel() {
  const espacos = casa.visita.espacos;
  const [ativo, setAtivo] = useState(0);
  const e = espacos[ativo];

  return (
    <section id="espacos" className="scroll-mt-20 bg-linho-escuro pb-20 pt-24">
      <Cabeca />
      {/* O overflow-hidden impede os cartoes de tras, que ficam para la da
          borda, de alargarem a pagina. */}
      <div className="mt-10 overflow-hidden">
        <div className="h-[clamp(26rem,118vw,30rem)]">
          <DepthCarousel
            items={espacos.map((x) => ({ image: x.imagem, alt: x.alt }))}
            cardWidth={300}
            cardHeight={375}
            sideRoom={36}
            cardShadow="none"
            radius={10}
            tint="#2e3a2b"
            depth={170}
            spread={68}
            tilt={8}
            visibleCards={3}
            blur={2}
            duration={700}
            loop
            showControls={false}
            showIndicators
            onChange={(i) => setAtivo(i)}
          />
        </div>
      </div>
      {/* altura reservada para a nota mais comprida, para nada saltar ao
          trocar de espaco */}
      <div className="mx-auto mt-6 min-h-[7.5rem] max-w-[36ch] px-6 text-center" aria-live="polite">
        <h3 className="text-[1.6rem] text-tinta">{e.nome}</h3>
        <p className="mt-1.5 text-[0.95rem] font-light leading-relaxed text-tinta-medio">{e.nota}</p>
      </div>
    </section>
  );
}

// a pista anda 1 px de lado por cada 1,4 px de scroll
const LENTO = 1.4;

/*
  Os cartoes: a largura fica fixa (--w) e as fotografias ficam com a altura
  que sobrar no ecra, ate ao retrato 4/5. O nome e a nota nunca encolhem:
  num ecra baixo sao as fotografias que ficam mais horizontais, e o texto
  nunca e cortado. Antes havia tres formatos fixos por altura de ecra, e
  entre eles (1440x821, 1536x864, 1280x640) a nota do fundo saia do ecra.

  A pista e uma grelha de tres linhas (foto, nome, nota) partilhadas por
  todos os cartoes (subgrid): as fotos ficam todas a mesma altura, a da
  nota mais comprida manda. Vem da Casa de Fatauncos (2026-09-18).
*/
const PISTA =
  'grid min-h-0 w-max grid-flow-col gap-x-6 [--w:min(21.5vw,305px)] [@media(max-height:820px)]:[--w:min(24.5vw,330px)] [grid-auto-columns:var(--w)] [grid-template-rows:minmax(0,calc(var(--w)*1.25))_auto_auto]';
const LARGURA_CARTAO = 'row-span-3 grid grid-rows-subgrid';
const FORMATO_CARTAO = 'min-h-0';
const MARGEM = 'pl-[max(40px,calc((100vw-1320px)/2+40px))] pr-[max(40px,calc((100vw-1320px)/2+40px))]';

/*
  A versao do computador. Componente proprio para o useScroll so existir
  quando o elemento existe: com o hook no pai, o alvo ainda nao estava
  montado.

  Duas fases:
  - Da primeira vez que se desce, a secao prende-se e o scroll vertical anda
    de lado pelos espacos (a animacao do desenho).
  - Depois de a ter atravessado uma vez, fica "livre": deixa de prender (a
    pagina fica mais curta, subir e descer passa por ela num instante) e os
    cartoes andam com as setas, com o gesto de lado do trackpad ou
    arrastando com o rato. Quem ja viu nao tem de a ver outra vez.

  A troca faz-se quando a secao ja saiu toda por cima do ecra, por isso nao
  se ve. A pagina encolhe acima de quem esta a ler: o scroll e corrigido na
  mesma medida antes de pintar, e nada salta.
*/
function Panoramica() {
  const alvo = useRef<HTMLElement>(null);
  const pista = useRef<HTMLUListElement>(null);
  const faixa = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const [livre, setLivre] = useState(false);
  // o percurso que a secao tinha quando estava presa, para corrigir o scroll
  const percursoAntes = useRef(0);
  const [pontas, setPontas] = useState({ inicio: false, fim: true });

  // distancia: quanto a pista anda de lado. percurso: quanto scroll vertical
  // a secao fica presa. O percurso e maior do que a distancia de proposito:
  // a pista anda mais devagar do que o scroll (LENTO), e no fim fica parada
  // meio ecra de scroll com o ultimo cartao inteiro a vista, para se lerem as
  // notas antes de a secao se soltar. Antes andava ao ritmo do scroll e
  // soltava-se logo a seguir: os ultimos cartoes passavam sem se ler.
  const [medida, setMedida] = useState({ distancia: 0, percurso: 0, inicio: 0 });

  useEffect(() => {
    if (livre) return;
    const medir = () => {
      const el = pista.current;
      if (!el) return;
      // clientWidth e nao innerWidth: o innerWidth conta a barra de scroll,
      // e o ultimo cartao ficava tapado por ela
      const distancia = Math.max(0, el.scrollWidth - document.documentElement.clientWidth);
      const vh = window.innerHeight;
      const inicio = vh * 0.12;
      const percurso = inicio + distancia * LENTO + vh * 0.5;
      setMedida({ distancia, percurso, inicio });
    };
    medir();
    const ro = new ResizeObserver(medir);
    if (pista.current) ro.observe(pista.current);
    window.addEventListener('resize', medir);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', medir);
    };
  }, [livre]);

  // passa a livre quando a secao sai toda por cima do ecra
  useEffect(() => {
    if (livre) return;
    const ver = () => {
      const s = alvo.current;
      if (s && medida.percurso > 0 && s.getBoundingClientRect().bottom < 0) {
        percursoAntes.current = medida.percurso;
        setLivre(true);
      }
    };
    ver();
    window.addEventListener('scroll', ver, { passive: true });
    return () => window.removeEventListener('scroll', ver);
  }, [livre, medida.percurso]);

  // No momento da troca a secao encolheu `percursoAntes` px acima do ecra.
  // O scroll recua o mesmo, antes de pintar, e a faixa comeca onde a pista
  // tinha ficado (no fim).
  useLayoutEffect(() => {
    if (!livre) return;
    const menos = percursoAntes.current;
    if (lenis) {
      const alvoFinal = lenis.targetScroll - menos;
      lenis.scrollTo(lenis.animatedScroll - menos, { immediate: true, force: true });
      lenis.scrollTo(alvoFinal, { force: true });
    } else {
      window.scrollBy(0, -menos);
    }
    const f = faixa.current;
    if (f) f.scrollLeft = f.scrollWidth;
    // so na troca: o lenis nao muda e nao pode voltar a correr isto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [livre]);

  // setas desligadas nas pontas
  useEffect(() => {
    const f = faixa.current;
    if (!livre || !f) return;
    const atualizar = () =>
      setPontas({ inicio: f.scrollLeft <= 2, fim: f.scrollLeft >= f.scrollWidth - f.clientWidth - 2 });
    atualizar();
    f.addEventListener('scroll', atualizar, { passive: true });
    return () => f.removeEventListener('scroll', atualizar);
  }, [livre]);

  // O gesto de lado do trackpad: o Lenis apanha a roda na janela e faz dela
  // scroll vertical. Aqui a faixa fica com o movimento quando ele e sobretudo
  // horizontal (e o evento nao chega ao Lenis); o vertical segue para a
  // pagina como sempre.
  useEffect(() => {
    const f = faixa.current;
    if (!livre || !f) return;
    const roda = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation();
      f.scrollLeft += e.deltaX;
    };
    f.addEventListener('wheel', roda, { passive: false });
    return () => f.removeEventListener('wheel', roda);
  }, [livre]);

  // arrastar com o rato (no toque o browser ja faz isto sozinho)
  const arrasto = useRef<{ x: number; inicio: number } | null>(null);
  const [aArrastar, setAArrastar] = useState(false);
  const pegar = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !faixa.current) return;
    arrasto.current = { x: e.clientX, inicio: faixa.current.scrollLeft };
    faixa.current.setPointerCapture(e.pointerId);
    setAArrastar(true);
  };
  const mover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!arrasto.current || !faixa.current) return;
    faixa.current.scrollLeft = arrasto.current.inicio - (e.clientX - arrasto.current.x);
  };
  const largar = () => {
    arrasto.current = null;
    setAArrastar(false);
  };

  // uma seta = um cartao
  const andar = (sentido: 1 | -1) => {
    const f = faixa.current;
    const cartao = f?.querySelector('li');
    if (!f || !cartao) return;
    const passo = cartao.getBoundingClientRect().width + 24;
    f.scrollBy({ left: sentido * passo, behavior: 'smooth' });
  };

  const { distancia, percurso, inicio } = medida;
  const p = useProgresso(alvo, 'preso');
  const x = useTransform(p, (v) => {
    if (!percurso) return 0;
    const a = inicio / percurso;
    const b = (inicio + distancia * LENTO) / percurso;
    return -Math.min(1, Math.max(0, (v - a) / (b - a))) * distancia;
  });

  const cartoes = casa.visita.espacos.map((e) => (
    <Cartao key={e.nome} e={e} largura={LARGURA_CARTAO} formato={FORMATO_CARTAO} />
  ));

  const botao =
    'grid size-12 place-items-center rounded-full border border-tinta/30 text-tinta transition-colors hover:border-tinta hover:bg-tinta/5 disabled:opacity-30 disabled:hover:bg-transparent';
  // as setas so aparecem na fase livre
  const setas = (
    <div
      className={`flex shrink-0 gap-3 transition-opacity duration-700 ${livre ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      aria-hidden={!livre}
    >
      <button type="button" onClick={() => andar(-1)} disabled={pontas.inicio} tabIndex={livre ? 0 : -1} aria-label="Espaço anterior" className={botao}>
        <CaretLeftIcon size={20} weight="light" />
      </button>
      <button type="button" onClick={() => andar(1)} disabled={pontas.fim} tabIndex={livre ? 0 : -1} aria-label="Espaço seguinte" className={botao}>
        <CaretRightIcon size={20} weight="light" />
      </button>
    </div>
  );

  return (
    <section
      id="espacos"
      ref={alvo}
      // sem scroll-mt: o palco ja deixa o lugar do cabecalho em cima (pt), e
      // com os 80 px do menu a nota do fundo ficava fora do ecra
      className="bg-linho-escuro"
      style={{ height: livre ? '100vh' : `calc(100vh + ${percurso}px)` }}
    >
      {/* Em ecras baixos (portateis com a janela baixa) as fotos passam de
          retrato a horizontais e a margem de cima encolhe: assim foto, nome e
          nota cabem sempre, com folga em baixo, sem os cartoes ficarem
          pequenos. Em ecras altos fica tudo como no desenho original. */}
      <div className="sticky top-0 flex h-dvh flex-col justify-center gap-9 overflow-hidden pb-12 pt-[clamp(6.5rem,13dvh,8.5rem)] [@media(max-height:820px)]:gap-7 [@media(max-height:640px)]:gap-5 [@media(max-height:640px)]:pb-6">
        <Cabeca lado={setas} />
        {livre ? (
          <div
            ref={faixa}
            tabIndex={0}
            aria-label="Espaços da casa"
            onPointerDown={pegar}
            onPointerMove={mover}
            onPointerUp={largar}
            onPointerCancel={largar}
            // sem isto o browser pega na fotografia para a arrastar e o gesto perde-se
            onDragStart={(e) => e.preventDefault()}
            className={`sem-barra flex min-h-0 overflow-x-auto overscroll-x-contain outline-none scroll-pl-[max(40px,calc((100vw-1320px)/2+40px))] ${
              aArrastar ? 'cursor-grabbing select-none' : 'cursor-grab snap-x snap-mandatory'
            }`}
          >
            <ul className={`${PISTA} ${MARGEM}`}>{cartoes}</ul>
          </div>
        ) : (
          <motion.ul ref={pista} style={{ x }} className={`${PISTA} ${MARGEM}`}>
            {cartoes}
          </motion.ul>
        )}
      </div>
    </section>
  );
}

export default function ACasa() {
  const parado = useMovimentoReduzido();
  const largo = useMedia('(min-width: 1024px)');
  const espacos = casa.visita.espacos;

  // Telemovel e tablet: carrossel em profundidade, arrastavel ao dedo.
  if (!largo) return <Carrossel />;

  if (parado) {
    return (
      <section id="espacos" className="scroll-mt-20 bg-linho-escuro pb-24 pt-28">
        <Cabeca />
        <ul className="sem-barra mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 md:px-10">
          {espacos.map((e) => (
            <Cartao key={e.nome} e={e} largura="w-[78vw] sm:w-[46vw]" />
          ))}
          <li aria-hidden className="w-1 shrink-0" />
        </ul>
      </section>
    );
  }

  return <Panoramica />;
}
