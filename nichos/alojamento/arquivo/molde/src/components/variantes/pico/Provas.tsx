'use client';

import Image from 'next/image';
import { easeInOut, easeOut, motion, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { useProgresso } from '@/lib/useProgresso';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useMedia } from '@/lib/usaMedia';
import { usePico } from './dados';
import PicoEstatico from './Estatico';
import Titulo from '@/components/Titulo';

/*
  VARIANTE P2 - Provas em papel (era o prototipo UmDiaPilha). Le os textos
  de casa.pico (ver dados.tsx), por isso serve qualquer forma de contar.

  Variante do "Um dia na casa" com pilha de fotografias.

  Mesmo palco preso e mesma luz do dia que o UmDia original, mas sem horas:
  Manha, Tarde, Noite. Cada parte do dia tem DUAS fotos, que caem uma a
  seguir a outra como provas em papel pousadas numa mesa (moldura clara,
  sombra, rodadas). Quando chega a parte seguinte, as fotos novas caem por
  cima e as antigas afundam e desaparecem por baixo.

  Tudo guiado pelo scroll: nao ha nada para clicar nem arrastar.
  Conteudo e fotos sao provisorios (Casa de Fatauncos), so para avaliar o efeito.
*/

type Foto = { src: string; alt: string; aspeto: number };
type Parte = { periodo: string; momento: string; titulo: string; texto: string; fotos: [Foto, Foto] };
type Dia = { etiqueta: string; titulo: string; intro: string; linha: readonly string[]; partes: Parte[] };

/* O conteudo vem da forma de contar escolhida. Cada momento pousa a sua
   foto e uma segunda (m.par), recortada em quadrado. Sem par, repete a
   primeira. */
function useDia(): Dia {
  const forma = usePico();
  const momentos = forma.momentos;
  return {
    etiqueta: forma.etiqueta,
    titulo: forma.titulo,
    intro: forma.intro,
    linha: forma.linha,
    partes: momentos.map((m) => ({
      periodo: m.marca,
      momento: m.momento,
      titulo: m.titulo,
      texto: m.texto,
      fotos: [
        { src: m.imagem, alt: m.alt, aspeto: m.aspeto ?? 4 / 3 },
        { src: m.par?.imagem ?? m.imagem, alt: m.par?.alt ?? m.alt, aspeto: 1 },
      ],
    })),
  };
}

// janelas de cada parte do dia no progresso do ato
const JANELAS = [
  { entra: 0.05, sai: 0.38 },
  { entra: 0.38, sai: 0.69 },
  { entra: 0.69, sai: 1.01 },
];

// onde assenta cada foto dentro do palco: a primeira grande, a segunda mais
// pequena e desencontrada. As partes alternam de lado para nao repetir.
const POSE = [
  [
    { lado: 'esq', largura: 86, rot: -2.5 },
    { lado: 'dir', largura: 64, rot: 3.5 },
  ],
  [
    { lado: 'dir', largura: 86, rot: 2 },
    { lado: 'esq', largura: 64, rot: -4 },
  ],
  [
    { lado: 'esq', largura: 86, rot: -1.5 },
    { lado: 'dir', largura: 64, rot: 3 },
  ],
] as const;

function Prova({ dia, p, parte, n }: { dia: Dia; p: MotionValue<number>; parte: number; n: 0 | 1 }) {
  const foto = dia.partes[parte].fotos[n];
  const pose = POSE[parte][n];
  const { entra, sai } = JANELAS[parte];
  const ultimo = parte === JANELAS.length - 1;

  // as duas caem quase juntas, so com um desencontro curto. Aparecem cedo (a
  // opacidade fecha em 1/3 do caminho) mas o movimento estende-se para ser suave.
  const cai = entra + (n === 0 ? 0 : 0.031);
  const assenta = cai + 0.145;
  // quando a parte seguinte comeca a cair, esta afunda e apaga-se
  const afunda = sai;
  const some = sai + 0.136;

  const dx = pose.lado === 'esq' ? -40 : 40;
  const keys = ultimo ? [cai, assenta] : [cai, assenta, afunda, some];

  const visivel = cai + 0.051;
  const opacidade = useTransform(
    p,
    ultimo ? [cai, visivel] : [cai, visivel, afunda, some],
    ultimo ? [0, 1] : [0, 1, 1, 0],
    { ease: easeInOut },
  );
  // entram de cima, como uma foto pousada na mesa: assim nunca invadem o texto por baixo
  const y = useTransform(p, keys, ultimo ? [-110, 0] : [-110, 0, 0, 20], { ease: easeOut });
  const x = useTransform(p, [cai, assenta], [dx, 0], { ease: easeOut });
  const rot = useTransform(p, keys, ultimo ? [pose.rot * 3.5, pose.rot] : [pose.rot * 3.5, pose.rot, pose.rot, pose.rot * 0.6], { ease: easeOut });
  const escala = useTransform(p, keys, ultimo ? [1.08, 1] : [1.08, 1, 1, 0.92], { ease: easeOut });
  // enquanto cai, a sombra esta longe (foto no ar); ao assentar encosta
  const sombra = useTransform(
    p,
    [cai, assenta],
    ['0 60px 90px -20px rgba(20,18,12,0.35)', '0 18px 40px -18px rgba(20,18,12,0.45)'],
  );

  return (
    <motion.figure
      style={{
        opacity: opacidade,
        y,
        x,
        rotate: rot,
        scale: escala,
        boxShadow: sombra,
        width: `${pose.largura}%`,
        aspectRatio: foto.aspeto,
        zIndex: parte * 2 + n + 1,
      }}
      className={`absolute overflow-hidden rounded-[2px] ${n === 0 ? 'top-[1%]' : 'bottom-[1%]'} ${
        pose.lado === 'esq' ? 'left-0' : 'right-0'
      }`}
    >
      <Image src={foto.src} alt={foto.alt} fill quality={86} sizes="(max-width: 1024px) 92vw, 50vw" className="object-cover" />
    </motion.figure>
  );
}

function Momento({ dia, p, i, rapido }: { dia: Dia; p: MotionValue<number>; i: number; rapido: boolean }) {
  const f = dia.partes[i];
  const { entra, sai } = JANELAS[i];
  const ultimo = i === JANELAS.length - 1;
  const t = rapido ? 0.14 : 0.12;
  const keys = ultimo ? [entra, entra + t] : [entra, entra + t, sai - t, sai];
  const op = useTransform(p, keys, ultimo ? [0, 1] : [0, 1, 1, 0], { ease: easeInOut });
  const y = useTransform(p, keys, ultimo ? [36, 0] : [36, 0, 0, -36], { ease: easeInOut });

  return (
    <motion.div style={{ opacity: op, y }} className="absolute inset-0 flex flex-col justify-center">
      <p className="font-display text-[3.4rem] leading-none lg:text-[5rem] max-lg:[@media(max-height:740px)]:text-[2.4rem]">
        <span style={f.periodo.length > 6 ? { fontSize: '0.72em' } : undefined}>
          <Titulo texto={`*${f.periodo}*`} />
        </span>
      </p>
      <p className="versalete mt-4 opacity-70 max-lg:[@media(max-height:740px)]:mt-2">{f.momento}</p>
      <h3 className="mt-5 text-[2.1rem] lg:text-[2.7rem] max-lg:[@media(max-height:740px)]:mt-2 max-lg:[@media(max-height:740px)]:text-[1.6rem]">{f.titulo}</h3>
      <p className="mt-4 max-w-[40ch] font-light leading-[1.8] opacity-80 max-lg:[@media(max-height:740px)]:mt-2 max-lg:[@media(max-height:740px)]:text-[0.92rem] max-lg:[@media(max-height:740px)]:leading-[1.6]">
        {f.texto}
      </p>
    </motion.div>
  );
}

function ProvasAnimado() {
  const dia = useDia();
  const alvo = useRef<HTMLDivElement>(null);
  const p = useProgresso(alvo, 'preso');
  const telemovel = useMedia('(max-width: 767px)');

  // a luz do dia, igual ao original
  const fundo = useTransform(p, [0, 0.36, 0.52, 0.68, 0.8, 1], ['#f5f0e7', '#f5f0e7', '#efe2c6', '#e7d2ad', '#1f291c', '#1f291c']);
  const tinta = useTransform(p, [0, 0.72, 0.8, 1], ['#22261f', '#22261f', '#f7f2e9', '#f7f2e9']);
  const acento = useTransform(p, [0, 0.72, 0.8, 1], ['#8c6a36', '#8c6a36', '#c9a36a', '#c9a36a']);

  const tituloOp = useTransform(p, [0, 0.015, 0.055], [1, 1, 0], { ease: easeInOut });
  const tituloY = useTransform(p, [0, 0.055], [0, -40], { ease: easeInOut });
  const palcoOp = useTransform(p, [0.02, 0.06], [0, 1], { ease: easeInOut });

  // sem horas: o sol so para no meio de cada parte do dia
  const sol = useTransform(p, [0.05, 0.12, 0.38, 0.46, 0.69, 0.77, 1], ['0%', '16%', '16%', '50%', '50%', '84%', '84%']);

  return (
    <motion.div ref={alvo} style={{ backgroundColor: fundo, color: tinta }} className="h-[240vh] md:h-[300vh]">
      <div className="sticky top-0 h-lvh overflow-hidden">
        <motion.div
          style={{ opacity: tituloOp, y: tituloY }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-start px-6 pt-[24vh] text-center"
        >
          <motion.p style={{ color: acento }} className="versalete">
            {dia.etiqueta}
          </motion.p>
          <h2 className="mt-5 text-[3.2rem] md:text-[5rem]">
            <Titulo texto={dia.titulo} />
          </h2>
          <p className="mt-6 max-w-[44ch] font-light leading-[1.8] opacity-75">{dia.intro}</p>
        </motion.div>

        <motion.div
          style={{ opacity: palcoOp }}
          className="mx-auto grid h-svh max-w-[1320px] grid-rows-[minmax(0,46vh)_1fr] gap-6 px-6 pb-[4.5rem] pt-24 max-lg:[@media(max-height:740px)]:grid-rows-[minmax(0,34vh)_1fr] max-lg:[@media(max-height:740px)]:gap-3 max-lg:[@media(max-height:740px)]:pt-[5.5rem] md:px-10 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-10 lg:pb-24 lg:pt-28"
        >
          {/* a mesa onde as fotos caem */}
          <div className="relative h-full lg:order-2 lg:col-span-7 lg:col-start-6 lg:h-[70vh]">
            {dia.partes.map((_, i) => (
              <div key={i}>
                <Prova dia={dia} p={p} parte={i} n={0} />
                <Prova dia={dia} p={p} parte={i} n={1} />
              </div>
            ))}
          </div>
          <div className="relative h-full lg:order-1 lg:col-span-4 lg:h-[60vh]">
            {dia.partes.map((f, i) => (
              <Momento key={f.titulo} dia={dia} p={p} i={i} rapido={telemovel} />
            ))}
          </div>
        </motion.div>

        <motion.div style={{ opacity: palcoOp }} className="absolute inset-x-0 top-[calc(100dvh-2.5rem)] mx-auto max-w-[1320px] px-6 md:px-10 lg:top-auto lg:bottom-7">
          <div className="relative h-px w-full bg-current opacity-25" />
          <motion.div aria-hidden style={{ x: sol }} className="absolute inset-x-6 top-0 h-0 md:inset-x-10">
            <motion.span
              style={{ backgroundColor: acento }}
              className="absolute left-0 top-0 block size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            />
          </motion.div>
          <div className="versalete mt-3 flex justify-between opacity-60">
            {dia.linha.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* Com movimento reduzido, o pico e a lista estatica, igual em todas as variantes. */
export default function Provas() {
  const parado = useMovimentoReduzido();
  return parado ? <PicoEstatico /> : <ProvasAnimado />;
}
