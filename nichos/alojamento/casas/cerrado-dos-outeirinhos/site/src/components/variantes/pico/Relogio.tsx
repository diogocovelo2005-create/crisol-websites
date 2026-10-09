'use client';

import Image from 'next/image';
import { easeInOut, motion, useTransform, type MotionValue } from 'motion/react';

type M = Momento;
import { useRef } from 'react';
import { usePico, type Momento } from './dados';
import PicoEstatico from './Estatico';
import { useProgresso } from '@/lib/useProgresso';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useMedia } from '@/lib/usaMedia';
import Titulo from '@/components/Titulo';

/*
  VARIANTE P1 - Relogio (era seccoes/UmDia.tsx). Le os textos de casa.pico
  (ver dados.tsx), por isso serve qualquer forma de contar.

  Ato 3 - O PICO. Sentimento: desejo.

  "E o site onde passas um dia inteiro na casa so com o scroll."

  A pagina prende-se e o scroll passa a ser o relogio. Amanhece a janela,
  poe-se a mesa, anoitece a lareira. A cor da propria pagina acompanha a
  luz: linho de manha, dourado a meio do dia, verde-floresta a noite. Na
  base corre a linha do dia com o sol a andar.

  E o ato com mais scroll da pagina (380vh) e com as melhores fotografias.
  Antes dele ha um instante de silencio: so o titulo, sozinho, antes da
  primeira hora. E o ultimo momento fica parado no fim, a noite, para o
  dia acabar em vez de desaparecer.

  Os pontos fortes deixam de ser uma lista: sao o que acontece ao longo
  do dia. Com movimento reduzido, volta a lista estatica com as tres fotos.
*/

// Telemoveis de ecra baixo (ate 740px de altura, ex.: iPhone SE): foto mais
// baixa e texto mais pequeno, senao a hora sobrepunha a foto e a ultima linha
// passava por baixo da linha do dia. Os outros ecras ficam iguais.

// janelas de cada momento no progresso do ato
const JANELAS = [
  { entra: 0.05, sai: 0.42 },
  { entra: 0.42, sai: 0.71 },
  { entra: 0.71, sai: 1.01 },
];

function Momento({ f, p, i, rapido }: { f: M; p: MotionValue<number>; i: number; rapido: boolean }) {
  const { entra, sai } = JANELAS[i];
  const ultimo = i === JANELAS.length - 1;
  // no telemovel as transicoes sao mais curtas: o texto aparece logo
  // no telemovel a seccao e mais curta, por isso a fracao e maior (0.1 de
  // 1850px da uns 185px); a curva easeInOut arranca e para devagar, para o
  // texto nao aparecer aos solavancos
  const t = rapido ? 0.1 : 0.08;
  const op = useTransform(p, ultimo ? [entra, entra + t] : [entra, entra + t, sai - t, sai], ultimo ? [0, 1] : [0, 1, 1, 0], { ease: easeInOut });
  const y = useTransform(p, ultimo ? [entra, entra + t] : [entra, entra + t, sai - t, sai], ultimo ? [36, 0] : [36, 0, 0, -36], { ease: easeInOut });

  return (
    <motion.div style={{ opacity: op, y }} className="absolute inset-0 flex flex-col justify-center">
      <p className="font-display text-[3rem] leading-none lg:text-[5.2rem] max-lg:[@media(max-height:820px)]:text-[2.4rem] max-lg:[@media(max-height:600px)]:text-[2rem]">
        <span className="tabular-nums" style={f.marca.length > 6 ? { fontSize: '0.72em' } : undefined}>{f.marca}</span>
      </p>
      <p className="versalete mt-3 opacity-70 lg:mt-4 max-lg:[@media(max-height:820px)]:mt-2 max-lg:[@media(max-height:600px)]:hidden">{f.momento}</p>
      <h3 className="mt-3 text-[1.85rem] lg:mt-5 lg:text-[2.7rem] max-lg:[@media(max-height:820px)]:mt-2 max-lg:[@media(max-height:820px)]:text-[1.6rem] max-lg:[@media(max-height:600px)]:text-[1.4rem]">{f.titulo}</h3>
      {/* O corpo desce para 0.95rem no telemovel: o texto e comprido e o
          espaco entre as fotos e a linha do dia e pouco. */}
      <p className="mt-3 max-w-[40ch] text-[0.95rem] font-light leading-[1.7] opacity-80 lg:mt-4 lg:text-[1rem] lg:leading-[1.8] max-lg:[@media(max-height:820px)]:mt-2 max-lg:[@media(max-height:820px)]:text-[0.9rem] max-lg:[@media(max-height:820px)]:leading-[1.6] max-lg:[@media(max-height:600px)]:text-[0.82rem] max-lg:[@media(max-height:600px)]:leading-[1.4]">{f.texto}</p>
    </motion.div>
  );
}

function Foto({ f, p, i, rapido }: { f: M; p: MotionValue<number>; i: number; rapido: boolean }) {
  const { entra, sai } = JANELAS[i];
  // a primeira aparece; as seguintes sobem por cima da anterior, como
  // uma pagina de album a ser virada
  const clip = useTransform(
    p,
    rapido ? [entra - 0.03, entra + 0.12] : [entra - 0.03, entra + 0.11],
    ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
    { ease: easeInOut },
  );
  const escala = useTransform(p, [entra, sai], [1.12, 1]);

  return (
    <motion.div style={{ clipPath: clip }} className="absolute inset-0 overflow-hidden rounded-[10px]">
      <motion.div style={{ scale: escala }} className="absolute inset-0">
        <Image src={f.imagem} alt={f.alt} fill quality={88} sizes="(max-width: 1024px) 165vw, 75vw" className="object-cover" />
      </motion.div>
    </motion.div>
  );
}

// Componente proprio para o useScroll so correr com o alvo montado.
function RelogioAnimado() {
  const forma = usePico();
  const momentos = forma.momentos;
  const alvo = useRef<HTMLDivElement>(null);
  const p = useProgresso(alvo, 'preso');
  // no telemovel a seccao dura menos scroll (320vh em vez de 380vh) e as
  // transicoes sao mais curtas, para o conteudo acompanhar o dedo
  const telemovel = useMedia('(max-width: 767px)');

  // a luz do dia: a cor da pagina e do texto seguem a hora
  // O arco de cor mantem o sentido do molde (granito claro -> luz quente ->
  // noite) com as cores desta casa: acaba na lousa, que e o escuro do tema.
  const fundo = useTransform(p, [0, 0.4, 0.58, 0.74, 0.84, 1], ['#f1ece2', '#f1ece2', '#ece0cd', '#e6cfb4', '#232c36', '#232c36']);
  const tinta = useTransform(p, [0, 0.76, 0.84, 1], ['#23272c', '#23272c', '#f7f3ec', '#f7f3ec']);
  const acento = useTransform(p, [0, 0.76, 0.84, 1], ['#9a4528', '#9a4528', '#e09873', '#e09873']);

  // silencio antes do pico: so o titulo
  // o silencio e curto: o titulo sai logo que a seccao prende e o primeiro
  // momento entra a seguir, antes de o titulo ja ter subido demasiado
  const tituloOp = useTransform(p, [0, 0.015, 0.055], [1, 1, 0], { ease: easeInOut });
  const tituloY = useTransform(p, [0, 0.055], [0, -40], { ease: easeInOut });
  const palcoOp = useTransform(p, [0.02, 0.06], [0, 1], { ease: easeInOut });

  // o sol na linha do dia, das 07:00 as 23:00, anda ate a hora de cada
  // momento e para la: 07:30 = 3%, 10:00 = 19%, 21:00 = 87%
  const sol = useTransform(
    p,
    [0.05, 0.13, 0.42, 0.5, 0.71, 0.8, 1],
    ['0%', forma.sol[0], forma.sol[0], forma.sol[1], forma.sol[1], forma.sol[2], forma.sol[2]],
  );

  return (
    <motion.div ref={alvo} style={{ backgroundColor: fundo, color: tinta }} className="h-[320vh] md:h-[380vh]">
      {/* O palco mede svh e a caixa de fora lvh: no telemovel a barra do
          browser esconde-se a meio do scroll, o dvh mudava de tamanho e a
          seccao inteira dava um salto. So a linha do dia segue o fundo
          real do ecra. Mesma solucao que a Casa de Fatauncos. */}
      <div className="sticky top-0 h-lvh overflow-hidden">
        {/* o titulo, sozinho */}
        <motion.div
          style={{ opacity: tituloOp, y: tituloY }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-start px-6 pt-[24vh] text-center"
        >
          <motion.p style={{ color: acento }} className="versalete">
            {forma.etiqueta}
          </motion.p>
          <h2 className="mt-5 text-[3.2rem] md:text-[5rem]">
            <Titulo texto={forma.titulo} />
          </h2>
          <p className="mt-6 max-w-[44ch] font-light leading-[1.8] opacity-75">{forma.intro}</p>
        </motion.div>

        {/* o palco do dia */}
        <motion.div
          style={{ opacity: palcoOp }}
          className="mx-auto grid h-svh max-w-[1320px] grid-rows-[minmax(0,41vh)_1fr] gap-6 px-6 pb-[4.5rem] pt-24 max-lg:[@media(max-height:820px)]:grid-rows-[minmax(0,33vh)_1fr] max-lg:[@media(max-height:820px)]:gap-3 max-lg:[@media(max-height:820px)]:pt-[6.5rem] [@media(max-width:380px)_and_(min-height:821px)]:grid-rows-[minmax(0,38vh)_1fr] max-lg:[@media(max-height:600px)]:grid-rows-[minmax(0,24vh)_1fr]! md:px-10 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-10 lg:pb-24 lg:pt-28"
        >
          <div className="relative h-full lg:order-2 lg:col-span-7 lg:col-start-6 lg:h-[70vh]">
            {momentos.map((f, i) => (
              <Foto key={f.titulo} f={f} p={p} i={i} rapido={telemovel} />
            ))}
          </div>
          <div className="relative h-full lg:order-1 lg:col-span-4 lg:h-[60vh]">
            {momentos.map((f, i) => (
              <Momento key={f.titulo} f={f} p={p} i={i} rapido={telemovel} />
            ))}
          </div>
        </motion.div>

        {/* a linha do dia */}
        {/* A linha do dia fica a 12 px do fundo real do ecra (dvh): quando a
            barra do browser se esconde, so ela desce, e nao fica a meio com
            espaco vazio por baixo. O resto do palco nao se mexe. */}
        <motion.div style={{ opacity: palcoOp }} className="absolute inset-x-0 top-[calc(100dvh-2.5rem)] mx-auto max-w-[1320px] px-6 md:px-10 lg:top-auto lg:bottom-7">
          <div className="relative h-px w-full bg-current opacity-25" />
          {/* o sol anda por transform, nao por `left`: nao mexe no layout */}
          <motion.div aria-hidden style={{ x: sol }} className="absolute inset-x-6 top-0 h-0 md:inset-x-10">
            <motion.span
              style={{ backgroundColor: acento }}
              className="absolute left-0 top-0 block size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            />
          </motion.div>
          <div className="versalete mt-3 flex justify-between opacity-60">
            {forma.linha.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* Com movimento reduzido, o pico e a lista estatica, igual em todas as variantes. */
export default function Relogio() {
  const parado = useMovimentoReduzido();
  return parado ? <PicoEstatico /> : <RelogioAnimado />;
}
