'use client';

import Image from 'next/image';
import { animate, motion, useMotionValue, useSpring, useTransform, useVelocity, type MotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import Revelar from '@/components/Revelar';
import TituloDito from '@/components/TituloDito';
import { useProgresso } from '@/lib/useProgresso';
import { useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useMedia } from '@/lib/usaMedia';
import { aoMedir } from '@/lib/posicao';

/*
  5 · Os da quinta: a mesa de madeira com as fotografias dos animais.

  A história é acolher. As fotografias chegam à mesa despejadas de um
  envelope, espalhadas à toa, umas por cima das outras. Com a mesa presa
  no ecrã, cada passo do scroll pega numa, levanta-a (cresce e ganha sombra) e
  pousa-a no seu lugar: um a um, cada animal ganha o seu canto. Ao pousar,
  a palavra dele escreve-se no post-it, e a frase do projeto vai-se
  montando: abrigo, amor, uma família, um lar, para a vida inteira.

  Depois de pousadas, são fotografias de verdade: pegam-se e arrastam-se
  pela mesa (inclinam-se com a velocidade do gesto e assentam com mola), e
  com um clique viram-se, com a frase da família escrita no verso e a
  palavra daquele animal sublinhada.

  O fecho, e a passagem para "Fazer parte" (a 6 é a conclusão da 5, por
  isso não começa uma secção nova): com a frase inteira, a mesa continua
  presa. As seis fotografias levantam-se outra vez e juntam-se numa roda,
  com um lugar vazio em baixo, virado para quem lê; o post-it vai para o
  meio da roda e, por baixo dele, escreve-se a passagem ("Para a vida
  inteira é muito tempo. Há quem queira ajudar a cumpri-lo."). Depois o
  post-it sai, o título da 6 é dito no meio da roda e o lugar vazio ganha
  contorno: a família fecha-se num círculo onde cabe mais um. A mesa
  solta-se e o resto da 6 continua na mesma madeira, sem cabeçalho novo.

  No telemóvel e com movimento reduzido não há prisão: as fotografias já
  estão arrumadas e viram-se com um toque, e a 6 tem o título dela.
*/

// monte: onde cai, à toa (o centro x, y na mesa, e a rotação)
type Animal = { src: string; alt: string; foco: string; palavra: string; especie: string; x: number; y: number; w: number; h: number; rot: number; monte: [number, number, number] };

// posições do protótipo C, na mesa de 1240 × 780
const ANIMAIS: Animal[] = [
  { src: '/fotos/animais/cabra-v2.jpg', alt: 'Uma cabra preta e branca a comer uma flor', foco: '68% 20%', palavra: 'abrigo', especie: 'As cabras', x: 0, y: 30, w: 270, h: 260, rot: -4, monte: [560, 300, 14] },
  { src: '/fotos/animais/ovelha-v2.jpg', alt: 'Um borrego branco deitado na palha', foco: '65% 35%', palavra: 'amor', especie: 'As ovelhas', x: 300, y: 0, w: 380, h: 300, rot: 2.5, monte: [220, 560, -12] },
  { src: '/fotos/animais/porco-v2.jpg', alt: 'Um porco pequeno, preto, de pé na palha', foco: '50% 35%', palavra: 'uma família', especie: 'Os porcos', x: 715, y: 50, w: 270, h: 260, rot: -2, monte: [980, 300, 9] },
  { src: '/fotos/animais/coelho-v2.jpg', alt: 'Um coelho branco num cesto de palha', foco: '30% 30%', palavra: 'um lar', especie: 'Os coelhos', x: 965, y: 10, w: 270, h: 260, rot: 4, monte: [380, 610, -16] },
  { src: '/fotos/animais/ponei-v2.jpg', alt: 'A cabeça de um pónei castanho debruçada sobre a porta da baia', foco: '45% 35%', palavra: 'para a vida', especie: 'Os póneis', x: 120, y: 420, w: 300, h: 260, rot: 3, monte: [690, 320, 11] },
  { src: '/fotos/animais/burro-v2.jpg', alt: 'Um burro castanho, de perfil, de cabeça baixa', foco: '60% 45%', palavra: 'inteira', especie: 'e os burros', x: 420, y: 400, w: 340, h: 290, rot: -3, monte: [640, 620, -7] },
];

const MESA = { w: 1240, h: 780 };
const CAPTION = 66; // a margem de papel e a legenda por baixo da foto

const dentroFora = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const chegar = (t: number) => 1 - Math.pow(1 - t, 3);
const fatia = (v: number, a: number, b: number) => Math.min(1, Math.max(0, (v - a) / (b - a)));

// a janela do scroll em que cada fotografia passa do monte para o lugar
// (acabam aos 88%: a frase fica um pouco inteira antes de a mesa se soltar)
// (no tempo da mesa antiga, de 1,35 ecrãs; agora a mesa tem mais 0,75 para a roda)
const F = 1.35 / 2.1;
const janela = (i: number) => [(0.03 + i * 0.13) * F, (0.21 + i * 0.13) * F] as const;

// a roda: o centro e os raios na mesa, a escala das fotografias nela, e o
// tempo (cada fotografia sai do seu canto um pouco depois da anterior)
const RODA = { cx: 620, cy: 400, rx: 490, ry: 290, escala: 0.6 };
const ANEL = (i: number) => [0.59 + i * 0.015, 0.59 + i * 0.015 + 0.11] as const;
const lugarNaRoda = (k: number) => {
  const a = ((90 + (k * 360) / 7) * Math.PI) / 180; // k = 0 é o lugar vazio, em baixo
  return [RODA.cx + RODA.rx * Math.cos(a), RODA.cy + RODA.ry * Math.sin(a)] as const;
};
const PASSAGEM = 'Para a vida inteira é muito tempo. Há quem queira ajudar a cumpri-lo.';
const TITULO6 = ['Quem', 'quiser,', 'pode', 'fazer', 'parte', 'da', 'família'];

// o verso da fotografia: a frase da família, com a palavra deste animal sublinhada
function Verso({ i, grande = false }: { i: number; grande?: boolean }) {
  const w = (k: number) => <strong className={k === i ? 'font-normal text-telha underline decoration-telha/50 decoration-2 underline-offset-4' : 'font-normal'}>{ANIMAIS[k].palavra}</strong>;
  return (
    <div className="flex h-full flex-col justify-between p-6">
      <p className="versalete !text-[0.62rem] text-tinta-medio">
        {ANIMAIS[i].especie} · {ANIMAIS[i].palavra}
      </p>
      <p className={`font-display leading-[1.38] text-tinta ${grande ? 'text-[1.4rem]' : 'text-[1.15rem]'}`}>
        «Acolhemos animais de quinta necessitados de {w(0)} e {w(1)} e damos-lhes {w(2)} e {w(3)} {w(4)} {w(5)}!»
      </p>
      <p className="versalete !text-[0.62rem] text-tinta-medio">A Família na Quinta</p>
    </div>
  );
}

function Fotografia({
  a,
  i,
  p,
  entrada,
  mesa,
  frente,
  aFrente,
  vivo,
}: {
  a: Animal;
  i: number;
  p: MotionValue<number>;
  entrada: MotionValue<number>;
  mesa: React.RefObject<HTMLDivElement | null>;
  frente: MotionValue<number>;
  aFrente: (i: number) => void;
  vivo: boolean;
}) {
  const [virada, setVirada] = useState(false);
  const [pousada, setPousada] = useState(!vivo);
  const [ini, fim] = janela(i);
  const altura = a.h + CAPTION;

  useEffect(() => {
    if (!vivo) return;
    const ver = (v: number) => setPousada(v >= fim - 0.01);
    ver(p.get());
    return p.on('change', ver);
  }, [p, fim, vivo]);

  // do monte ao lugar
  const dx = a.monte[0] - (a.x + a.w / 2);
  const dy = a.monte[1] - (a.y + altura / 2);
  const t = useTransform(p, (v) => dentroFora(fatia(v, ini, fim)));
  const [aIni, aFim] = ANEL(i);
  const g = useTransform(p, (v) => dentroFora(fatia(v, aIni, aFim)));
  const [rx, ry] = lugarNaRoda(i + 1);
  const ex = rx - (a.x + a.w / 2);
  const ey = ry - (a.y + altura / 2);
  const caiu = useTransform(entrada, (v) => chegar(fatia(v, 0.25 + (5 - i) * 0.07, 0.6 + (5 - i) * 0.07)));
  const transform = useTransform([t, caiu, g], ([k, c, n]: number[]) => {
    const arco = Math.sin(Math.PI * k) + Math.sin(Math.PI * n);
    const x = dx * (1 - k) + ex * n;
    const y = dy * (1 - k) - 80 * arco - (1 - c) * 520 + ey * n;
    const r = a.monte[2] + (a.rot - a.monte[2]) * k + (1 - c) * (i % 2 ? 18 : -18) - a.rot * 0.5 * n;
    const s = (1 + 0.09 * arco) * (1 - (1 - RODA.escala) * n);
    return `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  });
  const opacidade = useTransform(caiu, [0, 0.4], [0, 1]);
  const sombra = useTransform([t, g], ([k, n]: number[]) => Math.sin(Math.PI * k) + Math.sin(Math.PI * n));
  // na roda já não se arrasta: o que se arrastou volta ao sítio, para a roda fechar
  const [naRoda, setNaRoda] = useState(false);
  useEffect(() => {
    if (!vivo) return;
    const ver = (v: number) => setNaRoda(v >= aIni - 0.03);
    ver(p.get());
    return p.on('change', ver);
  }, [p, aIni, vivo]);
  const zIndex = useTransform([p, frente], ([v, f]: number[]) => {
    if (f === i) return 60;
    if (v > ini && v < fim) return 50;
    if (v >= fim) return 20 + i;
    return 16 - i;
  });

  // o arrasto: inclina com a velocidade do gesto e assenta com mola
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const vx = useVelocity(x);
  useEffect(() => {
    if (!naRoda) return;
    const c1 = animate(x, 0, { type: 'spring', duration: 0.5, bounce: 0.1 });
    const c2 = animate(y, 0, { type: 'spring', duration: 0.5, bounce: 0.1 });
    return () => {
      c1.stop();
      c2.stop();
    };
  }, [naRoda, x, y]);
  const inclina = useSpring(useTransform(vx, [-1600, 0, 1600], [-10, 0, 10], { clamp: true }), { stiffness: 300, damping: 24 });

  const rotY = useSpring(0, { stiffness: 170, damping: 22 });
  useEffect(() => {
    rotY.set(virada ? 180 : 0);
  }, [virada, rotY]);

  const virar = () => {
    aFrente(i);
    setVirada((v) => !v);
  };

  return (
    <motion.div
      className="absolute"
      style={{ left: a.x, top: a.y, width: a.w, height: altura, zIndex, ...(vivo ? { transform, opacity: opacidade } : { transform: `rotate(${a.rot}deg)`, opacity: 1 }) }}
    >
      {vivo && <motion.div aria-hidden style={{ opacity: sombra }} className="absolute inset-2 shadow-[0_46px_60px_rgba(0,0,0,0.45)]" />}
      <motion.div
        drag={pousada && !naRoda}
        dragConstraints={mesa}
        dragElastic={0.12}
        dragTransition={{ power: 0.25, timeConstant: 220, bounceStiffness: 300, bounceDamping: 26 }}
        onDragStart={() => aFrente(i)}
        onTap={virar}
        whileHover={pousada && !naRoda ? { scale: 1.025 } : undefined}
        whileDrag={{ scale: 1.06, cursor: 'grabbing' }}
        transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
        style={{ x, y, rotate: inclina, perspective: 1200 }}
        className={`relative size-full touch-pan-y ${pousada && !naRoda ? 'cursor-grab' : ''}`}
      >
        <motion.div
          role="button"
          tabIndex={0}
          aria-pressed={virada}
          aria-label={`${a.especie}, ${a.palavra}. Virar a fotografia`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              virar();
            }
          }}
          style={{ rotateY: rotY, transformStyle: 'preserve-3d' }}
          className="relative size-full outline-offset-4"
        >
          {/* a frente */}
          <figure className="foto absolute inset-0 select-none [backface-visibility:hidden]" aria-hidden={virada}>
            {(i === 1 || i === 3 || i === 5) && <span aria-hidden className="fita-cola" style={{ transform: `rotate(${i === 3 ? 4 : -3}deg)` }} />}
            <div className="relative w-full overflow-hidden" style={{ height: a.h }}>
              <Image src={a.src} alt={a.alt} fill draggable={false} sizes={`${a.w}px`} quality={85} className="pointer-events-none object-cover" style={{ objectPosition: a.foco }} />
            </div>
            <figcaption className="flex items-baseline justify-between gap-2.5">
              <b className="whitespace-nowrap text-[1.45rem] font-normal text-telha">{a.palavra}</b>
              <span className="whitespace-nowrap font-corpo text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-tinta-medio">{a.especie}</span>
            </figcaption>
          </figure>
          {/* o verso */}
          <div className="absolute inset-0 bg-[#f1e9da] shadow-[0_14px_30px_rgba(0,0,0,0.25)] [backface-visibility:hidden] [transform:rotateY(180deg)]" aria-hidden={!virada}>
            <Verso i={i} grande={a.w >= 340} />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function PostIt({ p, vivo }: { p: MotionValue<number>; vivo: boolean }) {
  const palavras = ['Abrigo,', 'amor,', 'uma família,', 'um lar,', 'para a vida', 'inteira.'];
  // vai para o meio da roda (o centro dele: de 1030, 550 para 620, 300) e,
  // com a passagem escrita, sai para cima para dar lugar ao título
  const transform = useTransform(p, (v) => {
    const k = dentroFora(fatia(v, 0.6, 0.74));
    const sobe = chegar(fatia(v, 0.845, 0.9));
    return `translate3d(${(-410 * k).toFixed(1)}px, ${(-250 * k - 40 * sobe).toFixed(1)}px, 0) rotate(${(-1.5 + 0.5 * k).toFixed(2)}deg) scale(${(1 - 0.08 * k).toFixed(4)})`;
  });
  const opacidade = useTransform(p, [0.845, 0.885], [1, 0]);
  return (
    <motion.div
      className="absolute left-[820px] top-[450px] w-[420px] bg-postit px-6 py-[22px] shadow-[0_10px_22px_rgba(0,0,0,0.22)]"
      style={vivo ? { transform, opacity: opacidade, zIndex: 18 } : { transform: 'rotate(-1.5deg)', zIndex: 18 }}
    >
      <strong className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-telha">Uma palavra por fotografia</strong>
      <p className="min-h-[5.4rem] font-display text-[1.75rem] leading-[1.25] text-tinta" aria-label="Abrigo, amor, uma família, um lar, para a vida inteira.">
        {palavras.map((w, i) => (
          <Escrita key={w} p={p} i={i} vivo={vivo}>
            {w}
          </Escrita>
        ))}
      </p>
      <p className="mt-3 text-[0.95rem] leading-[1.55] text-tinta">Peguem nas fotografias e arrumem-nas à vontade; com um clique, viram-se.</p>
    </motion.div>
  );
}

// a passagem, escrita por baixo do post-it, já no meio da roda
function Passagem({ p }: { p: MotionValue<number> }) {
  const clip = useTransform(p, (v) => `inset(-8px ${((1 - fatia(v, 0.76, 0.83)) * 100).toFixed(1)}% -8px 0)`);
  const transform = useTransform(p, (v) => `translate3d(0, ${(-40 * chegar(fatia(v, 0.845, 0.9))).toFixed(1)}px, 0)`);
  const opacidade = useTransform(p, [0.845, 0.885], [1, 0]);
  return (
    <motion.p aria-hidden className="passagem absolute left-[220px] top-[425px] w-[800px] text-center" style={{ clipPath: clip, transform, opacity: opacidade, zIndex: 18 }}>
      Para a vida inteira é muito tempo.
      <br />
      Há quem queira ajudar a cumpri-lo.
    </motion.p>
  );
}

function PalavraTitulo({ p, i, children }: { p: MotionValue<number>; i: number; children: string }) {
  const a = 0.875 + i * 0.012;
  const k = useTransform(p, (v) => chegar(fatia(v, a, a + 0.07)));
  const transform = useTransform(k, (v) => `translate3d(0, ${((1 - v) * 0.5).toFixed(3)}em, 0)`);
  const Tag = i >= 3 ? motion.em : motion.span;
  return (
    <>
      <Tag aria-hidden style={{ opacity: k, transform, display: 'inline-block' }}>
        {children}
      </Tag>{' '}
    </>
  );
}

// o título da 6, dito no meio da roda, e o lugar vazio a ganhar contorno
function Fecho({ p }: { p: MotionValue<number> }) {
  const [lx, ly] = lugarNaRoda(0);
  const lugarOp = useTransform(p, [0.88, 0.97], [0, 1]);
  const lugarT = useTransform(p, (v) => `rotate(-2deg) scale(${(1.12 - 0.12 * chegar(fatia(v, 0.88, 1))).toFixed(4)})`);
  return (
    <>
      <h2
        id="parte-titulo"
        aria-label={TITULO6.join(' ')}
        className="absolute left-[270px] top-[330px] w-[700px] text-center text-[3.6rem] leading-[1.06]"
        style={{ zIndex: 17 }}
      >
        {TITULO6.map((w, i) => (
          <PalavraTitulo key={i} p={p} i={i}>
            {w}
          </PalavraTitulo>
        ))}
      </h2>
      <motion.span
        aria-hidden
        className="absolute border-2 border-dashed border-cartao/45"
        style={{ left: lx - 108, top: ly - 98, width: 216, height: 196, opacity: lugarOp, transform: lugarT, zIndex: 17 }}
      />
    </>
  );
}

function Escrita({ p, i, vivo, children }: { p: MotionValue<number>; i: number; vivo: boolean; children: string }) {
  const fim = janela(i)[1];
  const clip = useTransform(p, (v) => `inset(-6px ${((1 - fatia(v, fim - 0.06, fim + 0.02)) * 100).toFixed(1)}% -6px 0)`);
  return (
    <motion.span aria-hidden className="inline-block" style={vivo ? { clipPath: clip } : { clipPath: 'none' }}>
      {children}&nbsp;
    </motion.span>
  );
}

function Mesa({ vivo }: { vivo: boolean }) {
  const alvo = useRef<HTMLDivElement>(null);
  const mesa = useRef<HTMLDivElement>(null);
  const p = useProgresso(alvo, 'preso');
  const entrada = useProgresso(alvo, 'entrada');
  const frente = useMotionValue(-1);
  const [escala, setEscala] = useState(1);

  useEffect(() => {
    const medir = () => {
      const largura = Math.min(window.innerWidth, 1320) - 80;
      const alto = vivo ? window.innerHeight - 150 : 10000;
      setEscala(Math.min(1, largura / MESA.w, alto / MESA.h));
    };
    medir();
    return aoMedir(medir);
  }, [vivo]);

  const tabuleiro = (
    <div className="mx-auto" style={{ width: MESA.w * escala, height: MESA.h * escala }}>
      <div ref={mesa} className="relative origin-top-left" style={{ width: MESA.w, height: MESA.h, transform: `scale(${escala})` }}>
        <PostIt p={p} vivo={vivo} />
        {vivo && <Passagem p={p} />}
        {vivo && <Fecho p={p} />}
        {ANIMAIS.map((a, i) => (
          <Fotografia key={a.src} a={a} i={i} p={p} entrada={entrada} mesa={mesa} frente={frente} aFrente={(k) => frente.set(k)} vivo={vivo} />
        ))}
      </div>
    </div>
  );

  if (!vivo) return <div className="mt-12">{tabuleiro}</div>;
  return (
    <div ref={alvo} className="relative h-[310vh]">
      <div className="sticky top-0 flex h-svh items-center justify-center pt-24">{tabuleiro}</div>
    </div>
  );
}

// no telemóvel: as fotografias já arrumadas, uma por baixo da outra, a virar com um toque
function Lista() {
  return (
    <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
      {ANIMAIS.map((a, i) => (
        <CartaoSimples key={a.src} a={a} i={i} />
      ))}
      <div className="bg-postit px-6 py-[22px] text-tinta" style={{ transform: 'rotate(-1.5deg)' }}>
        <p className="font-display text-[1.6rem] leading-[1.25]">Abrigo, amor, uma família, um lar, para a vida inteira.</p>
        <p className="mt-3 text-[0.95rem]">Com um toque, as fotografias viram-se.</p>
      </div>
    </div>
  );
}

function CartaoSimples({ a, i }: { a: Animal; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const r = useRevelacao(ref, { atraso: (i % 2) * 0.04 });
  const transform = useTransform(r, (v) => {
    const k = chegar(v);
    return `translate3d(0, ${((1 - k) * -60).toFixed(1)}px, 0) rotate(${(a.rot + (1 - k) * (i % 2 ? 12 : -12)).toFixed(2)}deg)`;
  });
  const opacidade = useTransform(r, [0, 0.4], [0, 1]);
  const [virada, setVirada] = useState(false);
  return (
    <motion.div ref={ref} style={parado ? { transform: `rotate(${a.rot}deg)`, opacity: 1 } : { transform, opacity: opacidade }} className="[perspective:1200px]">
      <button type="button" aria-pressed={virada} aria-label={`${a.especie}, ${a.palavra}. Virar a fotografia`} onClick={() => setVirada((v) => !v)} className="relative block w-full text-left">
        <div className="relative transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] [transform-style:preserve-3d]" style={{ transform: virada ? 'rotateY(180deg)' : 'none' }}>
          <figure className="foto [backface-visibility:hidden]">
            <div className="relative aspect-[4/3.4] w-full overflow-hidden">
              <Image src={a.src} alt={a.alt} fill sizes="(max-width: 639px) 90vw, 45vw" className="object-cover" style={{ objectPosition: a.foco }} />
            </div>
            <figcaption className="flex items-baseline justify-between gap-2.5">
              <b className="text-[1.45rem] font-normal text-telha">{a.palavra}</b>
              <span className="font-corpo text-[0.74rem] font-semibold uppercase tracking-[0.16em] text-tinta-medio">{a.especie}</span>
            </figcaption>
          </figure>
          <div className="absolute inset-0 bg-[#f1e9da] [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <Verso i={i} />
          </div>
        </div>
      </button>
    </motion.div>
  );
}

/** A mesa fecha-se em roda e diz o título da 6 (só em ecrã largo, com movimento). */
export function useRoda() {
  const parado = useMovimentoReduzido();
  const grande = useMedia('(min-width: 1024px)');
  return grande && !parado;
}

export default function OsDaQuinta() {
  const parado = useMovimentoReduzido();
  const grande = useMedia('(min-width: 1024px)');
  const roda = grande && !parado;

  return (
    <section className={`madeira overflow-x-clip pt-[110px] ${roda ? 'pb-0' : 'pb-[90px]'}`} aria-labelledby="animais-titulo">
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[6fr_5fr] lg:gap-16">
          <div>
            <Revelar>
              <p className="pagina">
                A quinta <span>· os da quinta</span>
              </p>
            </Revelar>
            <TituloDito id="animais-titulo" texto="Abrigo, amor e *um lar para a vida inteira*" className="mt-[18px] text-[2.4rem] leading-[1.04] lg:text-[4rem]" />
          </div>
          <Revelar atraso={0.05}>
            <p>O projeto acolhe animais de quinta de muitas espécies: cabras, ovelhas, porcos, coelhos, patos, póneis, burros, e até um canário. Cada um está ali só para viver, o resto da vida.</p>
            <blockquote className="mt-[18px]">
              <p className="font-display text-[1.2rem] text-ouro">«temos como foco central o acolhimento e não o resgate»</p>
              <cite className="mt-1 block text-[0.78rem] font-semibold not-italic uppercase tracking-[0.16em] text-cartao/75">A Família na Quinta, O Nosso Projeto</cite>
            </blockquote>
          </Revelar>
        </div>
      </div>
      <div className="mx-auto max-w-[1320px] px-5 md:px-10">
        {grande ? <Mesa vivo={!parado} /> : <Lista />}
        {!roda && (
          <Revelar>
            <p className="passagem mt-5">{PASSAGEM}</p>
          </Revelar>
        )}
      </div>
    </section>
  );
}
