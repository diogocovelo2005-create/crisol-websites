'use client';

import Image from 'next/image';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { prender, useMedida } from '@/lib/posicao';
import { useMedia } from '@/lib/usaMedia';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  BounceCards, do React Bits (DavidHDev/react-bits, Components).

  As fotos dos quartos em leque, como provas soltas em cima da mesa: cada
  cartão é uma polaroid com a legenda na margem de baixo (cada foto leva
  sempre o que a prova). Ao entrar, os cartões crescem com mola, um a um;
  ao passar o rato (ou tocar, no telemóvel) o cartão endireita-se e
  levanta-se, e os vizinhos afastam-se.

  O que mudou em relação ao original:
  - a entrada não corre sozinha depois do gesto (o original dispara uma
    animação elastic com atraso): a mola está desenhada na curva do
    scroll (cresce, passa um pouco e assenta), um cartão a seguir ao
    outro; o dedo marca o ritmo nos dois sentidos;
  - o afastar e o levantar são transições CSS com overshoot ("back"),
    interrompíveis, sem GSAP;
  - nunca a partir de scale(0): de 0.6, com opacidade;
  - o leque encolhe no telemóvel para caber no ecrã, e o toque abre e
    fecha o cartão;
  - movimento reduzido: as três fotos paradas, em grelha.
*/
export type CartaoFoto = { src: string; alt: string; legenda: string; foco?: string };

type Leque = { largura: number; abre: number; empurra: number; rot: number[] };
const PC: Leque = { largura: 236, abre: 196, empurra: 50, rot: [-7, 2, 8] };
const TEL: Leque = { largura: 140, abre: 94, empurra: 22, rot: [-7, 2, 8] };

// a mola desenhada: sobe, passa ~8% e assenta (back.out)
const mola = (r: number) => {
  const c1 = 1.9;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(r - 1, 3) + c1 * Math.pow(r - 1, 2);
};

function Cartao({
  c,
  i,
  total,
  t,
  leque,
  ativo,
  setAtivo,
  telemovel,
}: {
  c: CartaoFoto;
  i: number;
  total: number;
  t: MotionValue<number>;
  leque: Leque;
  ativo: number | null;
  setAtivo: (i: number | null) => void;
  telemovel: boolean;
}) {
  // cada cartão entra num terço desencontrado do percurso
  const r = useTransform(t, (v) => prender((v - i * 0.16) / 0.6));
  const escala = useTransform(r, (k) => (k >= 1 ? 'none' : `scale(${(0.6 + 0.4 * mola(k)).toFixed(4)})`));
  const opacidade = useTransform(r, (k) => prender(k * 2.2));

  const meio = (total - 1) / 2;
  let x = (i - meio) * leque.abre;
  let rot = leque.rot[i] ?? 0;
  let y = 0;
  let s = 1;
  if (ativo !== null) {
    if (i === ativo) {
      rot = 0;
      y = -14;
      s = 1.04;
    } else {
      x += i < ativo ? -leque.empurra : leque.empurra;
    }
  }

  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: leque.largura,
        marginLeft: -leque.largura / 2,
        transform: `translate(${x}px, calc(-50% + ${y}px)) rotate(${rot}deg) scale(${s})`,
        transition: 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        zIndex: ativo === i ? 10 : i === Math.round(meio) ? 2 : 1,
      }}
      onMouseEnter={telemovel ? undefined : () => setAtivo(i)}
      onMouseLeave={telemovel ? undefined : () => setAtivo(null)}
      onClick={() => setAtivo(ativo === i ? null : i)}
    >
      <motion.figure
        style={{ transform: escala, opacity: opacidade }}
        className="origin-bottom cursor-pointer bg-cartao p-2.5 pb-0 shadow-[0_2px_4px_rgba(28,35,30,0.14),0_10px_18px_-10px_rgba(28,35,30,0.4)] md:p-3 md:pb-0"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-linho-escuro">
          <Image src={c.src} alt={c.alt} fill sizes={`${leque.largura}px`} quality={99} className="object-cover" style={{ objectPosition: c.foco ?? '50% 50%' }} />
        </div>
        <figcaption className="px-0.5 py-2.5 text-[0.78rem] leading-snug text-ardosia md:py-3 md:text-[0.85rem]">{c.legenda}</figcaption>
      </motion.figure>
    </div>
  );
}

export default function BounceCards({ cartoes, className = '' }: { cartoes: CartaoFoto[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const parado = useMovimentoReduzido();
  const telemovel = useMedia('(max-width: 767px)');
  const [ativo, setAtivo] = useState<number | null>(null);
  const { pos, medida } = useMedida(ref);
  // do topo do leque a 95% do ecrã até 45%
  const t = useTransform(pos, (v) => {
    const vh = medida.current.vh;
    return prender((vh * 0.95 - v) / (vh * 0.5));
  });

  // tocar fora fecha o cartão aberto (telemóvel)
  useEffect(() => {
    if (ativo === null) return;
    const fora = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setAtivo(null);
    };
    document.addEventListener('pointerdown', fora);
    return () => document.removeEventListener('pointerdown', fora);
  }, [ativo]);

  if (parado) {
    return (
      <ul className={`grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 ${className}`}>
        {cartoes.map((c) => (
          <li key={c.src}>
            <figure className="bg-cartao p-2.5 pb-0">
              <div className="relative aspect-[4/5] overflow-hidden bg-linho-escuro">
                <Image src={c.src} alt={c.alt} fill sizes="(max-width: 767px) 45vw, 260px" quality={99} className="object-cover" style={{ objectPosition: c.foco ?? '50% 50%' }} />
              </div>
              <figcaption className="py-2.5 text-[0.85rem] leading-snug text-ardosia">{c.legenda}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    );
  }

  const leque = telemovel ? TEL : PC;
  return (
    <div ref={ref} className={`relative overflow-x-clip ${telemovel ? 'h-[300px]' : 'h-[400px]'} ${className}`}>
      {cartoes.map((c, i) => (
        <Cartao key={c.src} c={c} i={i} total={cartoes.length} t={t} leque={leque} ativo={ativo} setAtivo={setAtivo} telemovel={telemovel} />
      ))}
    </div>
  );
}
