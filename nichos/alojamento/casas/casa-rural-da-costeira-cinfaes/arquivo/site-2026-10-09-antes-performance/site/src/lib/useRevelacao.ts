'use client';

import { useMotionValue, useTransform, type MotionValue } from 'motion/react';
import { useEffect, type RefObject } from 'react';
import { prender, useMedida } from '@/lib/posicao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  O tempo de uma revelação ligada ao scroll, sem aspeto nenhum: devolve o
  progresso de 0 (escondido) a 1 (revelado), e quem o usa decide o que
  isso é (clip-path, opacidade, deslize, escala).

  Começa quando o topo do elemento entra pelo fundo do ecrã e acaba quando
  o centro dele chega ao meio do ecrã. Contar a altura do próprio elemento
  é o que impede uma foto alta de chegar já aberta (com metade ainda fora
  do ecrã, o fim já tinha passado). Mede a posição natural (lib/posicao):
  dentro de uma secção presa continua certo.

  `atraso` (fração do ecrã) atrasa as duas pontas, para irmãos da mesma
  linha entrarem desencontrados.

  Põe o progresso no próprio elemento, em `data-revelacao` (de 0 a 1, com
  três casas): o verificar-prototipo.mjs lê-o para apanhar revelações
  cedo demais (acima de 0.5 com o topo a 90% do ecrã) ou incompletas
  (abaixo de 0.9 com o centro a meio do ecrã). Com movimento reduzido fica
  em 1, sem esperar pelo scroll.

  O progresso é linear; para suavizar, aplica `suave` no transform de quem
  o usa (o atributo fica linear, que é o que o verificador espera).
*/
export function useRevelacao(ref: RefObject<HTMLElement | null>, { atraso = 0 }: { atraso?: number } = {}): MotionValue<number> {
  const parado = useMovimentoReduzido();
  const { pos, medida } = useMedida(ref);
  const fixo = useMotionValue(1);

  const vivo = useTransform(pos, (v) => {
    const { vh, altura } = medida.current;
    const passo = atraso * vh;
    const inicio = vh - passo;
    const fim = vh / 2 - altura / 2 - passo;
    return prender((inicio - v) / Math.max(1, inicio - fim));
  });
  const progresso = parado ? fixo : vivo;

  useEffect(() => {
    const escrever = (v: number) => {
      ref.current?.setAttribute('data-revelacao', v.toFixed(3));
    };
    escrever(progresso.get());
    return progresso.on('change', escrever);
  }, [ref, progresso]);

  return progresso;
}

/** Curva suave (smoothstep) para o visual; o progresso fica linear. */
export const suave = (r: number) => r * r * (3 - 2 * r);
