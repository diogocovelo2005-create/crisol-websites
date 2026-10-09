'use client';

import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { prender, useMedida } from '@/lib/posicao';
import { useRevelacao } from '@/lib/useRevelacao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  Os sítios à volta como postais em leque (o Bounce Cards do React Bits,
  adaptado, pedido do Diogo a 2026-10-09). Serve "estas são sugestões de
  passeio, para escolher ao sabor de cada dia": os quatro postais dão-se
  em leque, do mais perto (à esquerda) ao mais longe, e o que se escolhe
  vem à frente, direito, e afasta os outros.

  - Entrada: os postais saem do monte para o lugar no leque, com o
    pequeno ressalto do original, mas presos ao scroll (no original
    arrancam sozinhos com o tempo): no telemóvel acompanham o dedo.
  - Escolher, no computador: passar o rato (ou o foco do teclado) por um
    postal ou pelo texto dele. Mola do original (rigidez 210, 0.72 de
    amortecimento).
  - No telemóvel o leque fica preso por cima da lista enquanto ela passa,
    e vem à frente o postal do sítio que está a ser lido, preso ao scroll.

  As fotos são de terceiros: cada postal leva a foto inteira na proporção
  dela, sem texto por cima; o crédito fica no texto do sítio.

  Com movimento reduzido: o leque parado, sem molas.
*/

export type Sitio = {
  nome: string;
  distancia: string;
  texto: string;
  foto: { src: string; alt: string; largura: number; altura: number };
  credito: React.ReactNode;
};

const ROT = [-9, -3, 3, 9];
const MOLA = { stiffness: 210, damping: 2 * 0.72 * Math.sqrt(210) };

// o ressalto do original, como curva do progresso (easeOutBack)
const ressalto = (k: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2);
};

type Medidas = { cartao: number; afasta: number; empurra: number; arco: number };
const LARGO: Medidas = { cartao: 230, afasta: 80, empurra: 56, arco: 16 };
const ESTREITO: Medidas = { cartao: 160, afasta: 50, empurra: 22, arco: 10 };

function Postal({
  sitio,
  i,
  n,
  m,
  entrada,
  focos,
  onEscolher,
}: {
  sitio: Sitio;
  i: number;
  n: number;
  m: Medidas;
  entrada: MotionValue<number>;
  focos: MotionValue<number>[];
  onEscolher: (i: number | null) => void;
}) {
  const meio = (n - 1) / 2;
  const desvio = i - meio;
  const slot = { x: desvio * m.afasta, y: m.arco * (desvio / Math.max(1, meio)) ** 2, r: ROT[i % ROT.length] };
  const altura = (m.cartao * sitio.foto.altura) / sitio.foto.largura;

  const transform = useTransform([entrada, ...focos], (vals: number[]) => {
    const [e, ...f] = vals;
    // cada postal tem o seu tempo dentro da entrada (escalonados)
    const k = prender((e - i * 0.12) / 0.64);
    const d = ressalto(k);
    const meu = f[i];
    let empurrao = 0;
    f.forEach((fj, j) => {
      if (j !== i) empurrao += fj * Math.sign(i - j) * m.empurra;
    });
    const x = slot.x * d + empurrao;
    const y = 50 * (1 - d) + slot.y * d - meu * m.cartao * 0.06;
    const r = slot.r * d * (1 - meu);
    const s = (0.86 + 0.14 * d) * (1 + 0.06 * meu);
    return `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  });
  const opacity = useTransform(entrada, (e) => prender((e - i * 0.12) / 0.16));
  const zIndex = useTransform(focos[i], (f) => (f > 0.5 ? 20 : i + 1));

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 overflow-hidden rounded-[3px] border-[5px] border-cartao bg-cartao shadow-[0_1px_2px_rgba(0,0,0,.12),0_10px_28px_-6px_rgba(33,31,25,.32)] will-change-transform"
      style={{ width: m.cartao, height: altura + 10, transform, opacity, zIndex }}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onEscolher(i)}
    >
      <Image src={sitio.foto.src} alt={sitio.foto.alt} fill sizes={`${Math.round(m.cartao * 1.3)}px`} className="pointer-events-none select-none object-cover" draggable={false} />
    </motion.div>
  );
}

/* Um sítio da lista; no telemóvel diz quanto está a ser lido (0 a 1). */
function Entrada({ sitio, i, foco, ativo, onEscolher, distancia }: { sitio: Sitio; i: number; foco: MotionValue<number>; ativo: boolean; onEscolher: (i: number | null) => void; distancia: string }) {
  const ref = useRef<HTMLLIElement>(null);
  const { pos, medida } = useMedida(ref);

  useEffect(() => {
    if (!ativo) return;
    const escrever = (v: number) => {
      const { vh, altura } = medida.current;
      // a linha de leitura fica a 62% do ecrã, abaixo do leque preso
      const centro = v + altura / 2;
      foco.set(prender(1 - Math.abs(centro - vh * 0.62) / Math.max(1, altura * 0.8)));
    };
    escrever(pos.get());
    return pos.on('change', escrever);
  }, [ativo, pos, medida, foco]);

  return (
    <li ref={ref} onPointerEnter={(e) => e.pointerType === 'mouse' && onEscolher(i)} onFocus={() => onEscolher(i)}>
      <h3 className="text-[1.45rem]">{sitio.nome}</h3>
      <p className={distancia}>{sitio.distancia}</p>
      <p className="text-[0.98rem] leading-[1.6]">{sitio.texto}</p>
      <p className="mt-3 text-base leading-[1.45] text-tinta-medio [@media(hover:hover)]:md:text-[0.9375rem] [&_a]:underline [&_a]:underline-offset-2">{sitio.credito}</p>
    </li>
  );
}

export default function CartoesVolta({ sitios, distancia }: { sitios: Sitio[]; distancia: string }) {
  const parado = useMovimentoReduzido();
  const leque = useRef<HTMLDivElement>(null);
  const [largo, setLargo] = useState(true);
  const [escolhido, setEscolhido] = useState<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const ver = () => setLargo(mq.matches);
    ver();
    mq.addEventListener('change', ver);
    return () => mq.removeEventListener('change', ver);
  }, []);

  const entrada = useRevelacao(leque);
  // escolha pelo rato: mola; leitura no telemóvel: valor direto do scroll
  const alvos = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];
  const molas = [useSpring(alvos[0], MOLA), useSpring(alvos[1], MOLA), useSpring(alvos[2], MOLA), useSpring(alvos[3], MOLA)];
  const lidos = [useMotionValue(0), useMotionValue(0), useMotionValue(0), useMotionValue(0)];

  useEffect(() => {
    alvos.forEach((a, i) => a.set(!parado && largo && escolhido === i ? 1 : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escolhido, largo, parado]);

  const focos = parado ? alvos : largo ? molas : lidos;
  const m = largo ? LARGO : ESTREITO;
  const maxAltura = Math.max(...sitios.map((s) => (m.cartao * s.foto.altura) / s.foto.largura));

  return (
    <div className="caixa grid gap-8 pb-20 pt-12 md:pb-[104px] md:pt-16 lg:grid-cols-12 lg:items-center lg:gap-10">
      {/* o leque: no telemóvel fica preso por baixo do cabeçalho enquanto a lista passa */}
      <div className="sticky top-20 z-10 -mx-6 overflow-x-clip bg-linho px-6 py-3 lg:static lg:col-[1/6] lg:m-0 lg:bg-transparent lg:p-0" onPointerLeave={() => setEscolhido(null)}>
        <div
          ref={leque}
          className="relative mx-auto touch-pan-y"
          style={{ height: maxAltura + m.arco + 40, maxWidth: m.cartao + 3 * m.afasta + 2 * m.empurra }}
        >
          {sitios.map((s, i) => (
            <Postal key={s.nome} sitio={s} i={i} n={sitios.length} m={m} entrada={entrada} focos={focos} onEscolher={setEscolhido} />
          ))}
        </div>
      </div>

      <ol className="m-0 grid list-none gap-11 p-0 md:grid-cols-2 lg:col-[6/13] lg:gap-x-10 lg:gap-y-12" onPointerLeave={() => setEscolhido(null)} onBlur={() => setEscolhido(null)}>
        {sitios.map((s, i) => (
          <Entrada key={s.nome} sitio={s} i={i} foco={lidos[i]} ativo={!parado && !largo} onEscolher={setEscolhido} distancia={distancia} />
        ))}
      </ol>
    </div>
  );
}
