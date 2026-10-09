'use client';

import { motion, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { prender, useMedida } from '@/lib/posicao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  ScrollStack, do React Bits (DavidHDev/react-bits, Components).

  Os cartões empilham-se com o scroll: cada um sobe, fica preso um momento
  um pouco abaixo do anterior, e o seguinte sobe por cima dele; os de
  baixo encolhem um pouco, e a pilha lê-se como um maço de cartões.

  O que mudou em relação ao original:
  - o motor: o original cria uma instância própria de Lenis e mede os
    cartões no ecrã a cada frame; aqui os cartões são sticky (o browser
    prende-os, sem scroll sequestrado) e a escala vem da posição natural
    de um marcador antes de cada cartão (lib/posicao: a secção à volta
    também fica presa no fim);
  - só escala, sem rotação nem desfocagem, e nada de cor: as fotos dos
    cartões são de terceiros e não podem mudar;
  - movimento reduzido: os cartões em coluna, sem prender.

  `topo`: onde o primeiro cartão prende (px); `degrau`: quanto cada
  cartão seguinte prende mais abaixo; `espaco`: scroll a mais entre
  cartões (por defeito nenhum: cada um fica preso o tempo da sua altura,
  e a página não passa o limite de ecrãs).
*/
type Props = {
  children: React.ReactNode[];
  topo?: number;
  degrau?: number;
  espaco?: string;
  className?: string;
};

function Cartao({
  i,
  total,
  chegadas,
  passado,
  topo,
  degrau,
  espaco,
  children,
}: {
  i: number;
  total: number;
  chegadas: MotionValue<number>[];
  passado: MotionValue<number>;
  topo: number;
  degrau: number;
  espaco: string;
  children: React.ReactNode;
}) {
  // encolhe um pouco por cada cartão que já chegou por cima dele
  const fontes = [passado, ...(chegadas.slice(i + 1).length ? chegadas.slice(i + 1) : [chegadas[i]])];
  const escala = useTransform(fontes, ([fora, ...vs]: number[]) => {
    // com a pilha já fora do ecrã por cima, volta a 'none': camadas com
    // transform presas por baixo das secções seguintes davam frames longos
    if (i === total - 1 || fora >= 1) return 'none';
    const tapado = vs.reduce((a, v) => a + v, 0);
    const s = 1 - 0.04 * tapado;
    return s >= 1 ? 'none' : `scale(${s.toFixed(4)})`;
  });
  return (
    <motion.div
      style={{ top: topo + i * degrau, transform: escala, marginBottom: i === total - 1 ? 0 : espaco }}
      className="sticky origin-top"
    >
      {children}
    </motion.div>
  );
}

function useChegada(ref: React.RefObject<HTMLElement | null>, alvo: number) {
  const { pos, medida } = useMedida(ref);
  // 0 quando o cartão entra por baixo; 1 quando chega ao sítio onde prende
  return useTransform(pos, (v) => {
    const vh = medida.current.vh;
    const r = prender((vh - v) / Math.max(1, vh - alvo));
    return r * r * (3 - 2 * r);
  });
}

function Marcador({ refEl }: { refEl: React.RefObject<HTMLDivElement | null> }) {
  return <div ref={refEl} aria-hidden className="h-0" />;
}

export default function ScrollStack({ children, topo = 112, degrau = 22, espaco = '0px', className = '' }: Props) {
  const parado = useMovimentoReduzido();
  const total = children.length;
  // até 6 cartões: os hooks têm de ser sempre os mesmos
  const r0 = useRef<HTMLDivElement>(null);
  const r1 = useRef<HTMLDivElement>(null);
  const r2 = useRef<HTMLDivElement>(null);
  const r3 = useRef<HTMLDivElement>(null);
  const r4 = useRef<HTMLDivElement>(null);
  const r5 = useRef<HTMLDivElement>(null);
  const refs = [r0, r1, r2, r3, r4, r5];
  const c0 = useChegada(r0, topo);
  const c1 = useChegada(r1, topo + degrau);
  const c2 = useChegada(r2, topo + 2 * degrau);
  const c3 = useChegada(r3, topo + 3 * degrau);
  const c4 = useChegada(r4, topo + 4 * degrau);
  const c5 = useChegada(r5, topo + 5 * degrau);
  const chegadas = [c0, c1, c2, c3, c4, c5].slice(0, total);
  // 1 quando o fim da pilha já subiu acima do ecrã (com folga)
  const rFim = useRef<HTMLDivElement>(null);
  const { pos: posFim } = useMedida(rFim);
  const passado = useTransform(posFim, (v): number => (v < -200 ? 1 : 0));

  if (parado) {
    return <div className={`grid gap-8 ${className}`}>{children}</div>;
  }

  return (
    <div className={`relative ${className}`}>
      {children.slice(0, 6).map((c, i) => (
        <div key={i} className="contents">
          <Marcador refEl={refs[i]} />
          <Cartao i={i} total={total} chegadas={chegadas} passado={passado} topo={topo} degrau={degrau} espaco={espaco}>
            {c}
          </Cartao>
        </div>
      ))}
      <div ref={rFim} aria-hidden className="h-0" />
    </div>
  );
}
