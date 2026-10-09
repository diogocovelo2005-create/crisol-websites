'use client';

import Image from 'next/image';
import { motion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import Foto from '@/components/Foto';
import LinhaDoDia from '@/components/LinhaDoDia';
import { prender, useMedida } from '@/lib/posicao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  Um dia no jardim: a piscina, o deck, a churrasqueira.

  As fotos são o palco: enchem o ecrã de ponta a ponta (por baixo do
  cabeçalho) enquanto o palco fica preso (sticky, sem scroll sequestrado:
  é a página que corre e o dedo manda). A foto seguinte já espreita numa
  faixa estreita à direita; com o scroll, essa faixa alarga até a cobrir
  toda, e a de baixo cresce um pouco, a recuar. Vê-se sempre o que vem.

  Por cima da foto, no canto inferior esquerdo e só com véu atrás dele, o
  bloco do momento: os três ícones numa régua fina, com um sol pequeno a
  correr de um para o outro (o dia a passar), o título, o texto, a voz do
  deck e a legenda da foto. Trocam no sítio, com a foto.

  Não se inventam horas nem luz: as fotos são todas de dia; o sol só
  marca a ordem ("um dia inteiro sem sair do jardim", do BRIEF). Sem
  contador numérico: só números que estão no BRIEF.

  - Só transform e opacity. A cortina de cada foto é a camada a deslizar
    e a imagem lá dentro a deslizar ao contrário (fica parada no ecrã).
  - Telemóvel: o mesmo, com a foto em altura e o bloco a toda a largura,
    preso ao dedo: para quando ele para, recua se voltar atrás.
  - Movimento reduzido: a linha do dia estática, com tudo à vista.
  - Altura: um ecrã mais PERCURSO px (1595: o Diogo pediu bem mais lento;
    a altura saiu dos respiros das outras secções).
*/

// o percurso em px, por partes: a primeira e a última foto param menos
// (já se veem enquanto o palco entra e sai), as do meio param o bastante
// para ler o texto e a legenda, e cada troca é longa
const PARA_PONTA = 140;
const PARA_MEIO = 290;
const TROCA = 245;
const PERCURSO = 2 * PARA_PONTA + 2 * PARA_MEIO + 3 * TROCA;
// trocas de foto: piscina → deck, deck → pérgola, pérgola → churrasqueira
const TROCAS = [0, 1, 2].map((i) => (PARA_PONTA + i * (TROCA + PARA_MEIO) + TROCA / 2) / PERCURSO);
// meia troca: cada troca dura 0.18 do percurso (~190 px), com pausas entre elas
const MEIA = TROCA / 2 / PERCURSO;
// largura da faixa da foto seguinte a espreitar (% da largura)
const ESPREITA = 7;

const traco = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.3,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function IconePiscina() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...traco}>
      <path d="M4 26c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2" />
      <path d="M4 32c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2 3-2 6-2" />
      <path d="M12 22V8a3 3 0 0 1 6 0M24 22V8a3 3 0 0 1 6 0M12 13h12M12 18h12" />
    </svg>
  );
}

function IconeDeck() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...traco}>
      <path d="M5 12h30M7 9h26M9 12v22M31 12v22M15 12v4M20 12v4M25 12v4" />
      <path d="M4 34h32" />
      <path d="M14 27h12M16 27v7M24 27v7" />
    </svg>
  );
}

function IconeChurrasqueira() {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" {...traco}>
      <path d="M6 16 20 6l14 10" />
      <path d="M10 14v20h20V14" />
      <path d="M15 34v-9h10v9" />
      <path d="M17 21c0-2 2-2 2-4M22 21c0-2 2-2 2-4" />
      <path d="M6 34h28" />
    </svg>
  );
}

const fotos = [
  {
    src: '/fotos/piscina-02.jpg',
    alt: 'A piscina turquesa com a fachada de granito da casa ao fundo, entre relva e sebes',
    foco: '50% 70%',
    legenda: 'Relva à volta, e mais ninguém.',
  },
  {
    src: '/fotos/jardim-02.jpg',
    alt: 'O deck de madeira com pérgola entre relva e sebes, com mesa, cadeiras e as colinas ao fundo',
    foco: '50% 50%',
    legenda: 'O deck e, à frente, o vale.',
  },
  {
    src: '/fotos/jardim-01.jpg',
    alt: 'O deck de madeira com pérgola cinzenta, sofás azuis e uma mesa, com a piscina e a relva ao fundo',
    foco: '50% 45%',
    legenda: 'Pérgola, sombra e o jardim à volta.',
  },
  {
    src: '/fotos/jardim-03.jpg',
    alt: 'A churrasqueira coberta de tijolo com telhado de telha, junto ao pátio de lajes e à trepadeira florida',
    foco: '65% 55%',
    legenda: 'A churrasqueira coberta, entre lajes e flores.',
  },
];

const momentos = [
  { icone: <IconePiscina />, titulo: 'A piscina', texto: 'Ao ar livre, com relva à volta e um pátio de lajes. E só vossa: ninguém mais a usa.' },
  { icone: <IconeDeck />, titulo: 'O deck', texto: 'Um deck de madeira com pérgola, virado ao vale. A mesa põe-se lá fora.' },
  { icone: <IconeChurrasqueira />, titulo: 'A churrasqueira', texto: 'Coberta, no jardim: o almoço faz-se cá fora.' },
];

const VOZ_DECK = { texto: 'Espaço exterior com óptima paisagem e um deck muito bom para fazer refeições.', quem: 'Nuno Besteiro · Google' };

// smootherstep: arranca e pousa sem degrau (derivadas nulas nas pontas)
const suave = (r: number) => r * r * r * (r * (r * 6 - 15) + 10);
// 0 → 1 ao longo da troca i (antes da primeira, já "aconteceu")
const troca = (t: number, i: number) => (i < 0 ? 1 : suave(prender((t - (TROCAS[i] - MEIA)) / (2 * MEIA))));
// o que sai apaga-se na primeira metade, o que entra aparece na segunda
const entra = (r: number) => prender(2 * r - 1);
const sai = (r: number) => 1 - prender(2 * r);

/* ---------- a versão parada: a linha do dia, com tudo à vista ---------- */

function LinhaParada() {
  const fotoMomento = '(max-width: 767px) 80vw, 380px';
  return (
    <LinhaDoDia className="mx-auto max-w-[1280px] px-5 pb-20 sm:px-8 md:pb-24 lg:px-16" lista="grid gap-16 md:grid-cols-3 md:gap-10 lg:gap-14">
      <li className="relative pl-20 md:pl-0">
        <span className="absolute left-0 top-0 block size-14 bg-salvia p-2 text-tinta md:relative">{momentos[0].icone}</span>
        <h3 className="text-[1.75rem] leading-tight md:mt-6 md:text-[2rem]">{momentos[0].titulo}</h3>
        <p className="mt-2 max-w-[34ch]">{momentos[0].texto}</p>
        <Foto className="mt-7" {...fotos[0]} recorte="aspect-[4/3] md:aspect-[4/5]" sizes={fotoMomento} />
      </li>
      <li className="relative pl-20 md:pl-0">
        <span className="absolute left-0 top-0 block size-14 bg-salvia p-2 text-tinta md:relative">{momentos[1].icone}</span>
        <h3 className="text-[1.75rem] leading-tight md:mt-6 md:text-[2rem]">{momentos[1].titulo}</h3>
        <p className="mt-2 max-w-[34ch]">{momentos[1].texto}</p>
        <figure className="mt-5 max-w-[34ch]">
          <blockquote>
            <p className="voz text-[1.2rem] leading-[1.45]">“{VOZ_DECK.texto}”</p>
          </blockquote>
          <figcaption className="versalete mt-4 text-ardosia">{VOZ_DECK.quem}</figcaption>
        </figure>
        <Foto className="mt-8" {...fotos[1]} recorte="aspect-[4/3]" sizes={fotoMomento} />
        <Foto className="ml-auto mt-6 w-[72%]" {...fotos[2]} recorte="aspect-[4/3]" sizes="(max-width: 767px) 58vw, 280px" />
      </li>
      <li className="relative pl-20 md:pl-0">
        <span className="absolute left-0 top-0 block size-14 bg-salvia p-2 text-tinta md:relative">{momentos[2].icone}</span>
        <h3 className="text-[1.75rem] leading-tight md:mt-6 md:text-[2rem]">{momentos[2].titulo}</h3>
        <p className="mt-2 max-w-[34ch]">{momentos[2].texto}</p>
        <Foto className="mt-7 md:mt-16" {...fotos[3]} recorte="aspect-[4/5]" sizes={fotoMomento} />
      </li>
    </LinhaDoDia>
  );
}

/* ---------- as peças do palco ---------- */

// onde está a camada i (translateX em %): escondida à direita (100), a
// espreitar (100 - ESPREITA) quando a anterior acabou de entrar, cheia (0)
// depois da sua troca
const posicaoCamada = (v: number, i: number) => (i === 0 ? 0 : 100 - ESPREITA * troca(v, i - 2) - (100 - ESPREITA) * troca(v, i - 1));

function Camada({ t, i, children }: { t: MotionValue<number>; i: number; children: React.ReactNode }) {
  const fora = useTransform(t, (v) => {
    const x = posicaoCamada(v, i);
    return x <= 0 ? 'none' : `translateX(${x.toFixed(2)}%)`;
  });
  // a imagem desliza ao contrário (fica parada no ecrã) e, quando a
  // seguinte a cobre, cresce um pouco
  const dentro = useTransform(t, (v) => {
    const x = -posicaoCamada(v, i);
    const s = 1 + 0.05 * (i < fotos.length - 1 ? troca(v, i) : 0);
    return x === 0 && s === 1 ? 'none' : `translateX(${x.toFixed(2)}%) scale(${s.toFixed(4)})`;
  });
  return (
    <motion.div style={{ transform: fora }} className="absolute inset-0 overflow-hidden shadow-[-18px_0_36px_-12px_rgba(17,22,18,0.45)]">
      <motion.div style={{ transform: dentro }} className="absolute inset-0">
        {children}
      </motion.div>
    </motion.div>
  );
}

function Legenda({ t, i, texto }: { t: MotionValue<number>; i: number; texto: string }) {
  const o = useTransform(t, (v) => (i === 0 ? 1 : entra(troca(v, i - 1))) * (i < fotos.length - 1 ? sai(troca(v, i)) : 1));
  return (
    <motion.p style={{ opacity: o }} className="col-start-1 row-start-1 text-[0.85rem] leading-snug text-osso/80 md:text-[0.9rem]">
      {texto}
    </motion.p>
  );
}

// momento m: 0 piscina, 1 deck (duas fotos), 2 churrasqueira
const entraMomento = (v: number, m: number) => (m === 0 ? 1 : entra(troca(v, m === 1 ? 0 : 2)));
const saiMomento = (v: number, m: number) => (m === 2 ? 1 : sai(troca(v, m === 0 ? 0 : 2)));

function Momento({ t, m }: { t: MotionValue<number>; m: number }) {
  const o = useTransform(t, (v) => entraMomento(v, m) * saiMomento(v, m));
  const y = useTransform(o, (k) => (k >= 1 ? 'none' : `translateY(${((1 - k) * 10).toFixed(1)}px)`));
  const { titulo, texto } = momentos[m];
  return (
    <motion.div style={{ opacity: o, transform: y }} className="col-start-1 row-start-1 self-end">
      <h3 className="text-[1.9rem] leading-tight text-osso md:text-[3rem]">{titulo}</h3>
      <p className="mt-2 max-w-[38ch] text-[0.98rem] leading-relaxed text-osso/90 md:text-[1.0625rem]">{texto}</p>
      {m === 1 && (
        <figure className="mt-4 max-w-[38ch] md:mt-5">
          <blockquote>
            <p className="voz text-[1.08rem] leading-[1.4] text-osso md:text-[1.35rem]">“{VOZ_DECK.texto}”</p>
          </blockquote>
          <figcaption className="versalete mt-2 text-osso/75">{VOZ_DECK.quem}</figcaption>
        </figure>
      )}
    </motion.div>
  );
}

function Icone({ t, m }: { t: MotionValue<number>; m: number }) {
  // aceso enquanto o momento dele está no ecrã
  const o = useTransform(t, (v) => {
    const a = m === 0 ? 1 - troca(v, 0) : m === 1 ? troca(v, 0) * (1 - troca(v, 2)) : troca(v, 2);
    return 0.42 + 0.58 * a;
  });
  return (
    <motion.span style={{ opacity: o }} className="block size-8 text-osso md:size-9">
      {momentos[m].icone}
    </motion.span>
  );
}

// a régua do dia: três ícones e um sol pequeno a correr entre eles
function Regua({ t }: { t: MotionValue<number> }) {
  // sobre a piscina no começo, sobre a churrasqueira no fim
  const sol = useTransform(t, (v) => `translateX(${(prender((v - 0.15) / 0.7) * 100).toFixed(2)}%)`);
  return (
    <div className="w-[13rem] md:w-[15rem]">
      <div className="flex items-center justify-between">
        {momentos.map((_, m) => (
          <Icone key={m} t={t} m={m} />
        ))}
      </div>
      {/* a linha e o sol vão do centro do primeiro ícone ao do último */}
      <div className="relative mx-4 mt-3 h-px md:mx-[1.125rem]">
        <span aria-hidden className="absolute inset-0 bg-osso/35" />
        <motion.span aria-hidden style={{ transform: sol }} className="absolute inset-0 block">
          <span className="absolute -top-[4.5px] left-0 block size-[10px] -translate-x-1/2 rounded-full bg-barro-claro shadow-[0_0_0_4px_rgba(235,198,166,0.25)]" />
        </motion.span>
      </div>
    </div>
  );
}

/* ---------- o palco ---------- */

const VEU =
  'bg-[linear-gradient(to_top,rgba(17,22,18,0.72)_0%,rgba(17,22,18,0.56)_45%,rgba(17,22,18,0)_100%)] md:bg-[radial-gradient(ellipse_at_0%_100%,rgba(17,22,18,0.68)_0%,rgba(17,22,18,0.55)_38%,rgba(17,22,18,0)_72%)]';

export default function DiaNoJardim() {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const { pos } = useMedida(ref);
  // 0 quando o palco chega ao topo; 1 ao fim do percurso
  const bruto = useTransform(pos, (v) => prender(-v / PERCURSO));
  // uma mola curta por cima do scroll: tira os degraus da roda sem deixar
  // o palco a correr sozinho (assenta em ~0,2 s, colado ao dedo)
  const t = useSpring(bruto, { stiffness: 260, damping: 42, mass: 0.6, restDelta: 0.0005 });

  if (parado) return <LinhaParada />;

  return (
    <div ref={ref} className="relative" style={{ height: `calc(100svh + ${PERCURSO}px)` }}>
      <div className="sticky top-0 h-svh">
        <div className="absolute inset-x-0 bottom-0 top-20 overflow-hidden bg-floresta">
          {fotos.map((f, i) => (
            <Camada key={f.src} t={t} i={i}>
              <Image src={f.src} alt={f.alt} fill sizes="100vw" quality={99} className="object-cover" style={{ objectPosition: f.foco }} />
            </Camada>
          ))}

          {/* o véu só atrás do bloco de texto */}
          <div aria-hidden className={`pointer-events-none absolute bottom-0 left-0 h-[68%] w-full md:h-[80%] md:w-[min(64rem,80%)] ${VEU}`} />

          <div className="absolute inset-x-0 bottom-0 px-5 pb-6 sm:px-8 md:pb-12 lg:px-16">
            {/* o texto cresce para cima (self-end): a legenda e a régua ficam
                sempre no mesmo sítio, colados ao fundo */}
            <div className="grid">
              {momentos.map((m, i) => (
                <Momento key={m.titulo} t={t} m={i} />
              ))}
            </div>
            <div className="mt-4 grid md:mt-5">
              {fotos.map((f, i) => (
                <Legenda key={f.src} t={t} i={i} texto={f.legenda} />
              ))}
            </div>
            <div className="mt-5 md:mt-7">
              <Regua t={t} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
