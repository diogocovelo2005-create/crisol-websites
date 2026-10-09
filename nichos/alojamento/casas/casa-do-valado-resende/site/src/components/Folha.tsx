'use client';

import { motion, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { aoMedir, prender, topoDentro, useMedida } from '@/lib/posicao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  O fio do site: os capítulos pousam uns sobre os outros.

  Cada secção é uma folha. Quando se chega ao fim dela, a passagem (a
  frase que abre a secção seguinte) fica parada a meio do ecrã, e a folha
  seguinte, com a sua cor, sobe por cima. A de baixo recua um pouco e
  escurece enquanto é tapada: vê-se ao mesmo tempo o que sai e o que
  entra, e percebe-se o seguimento.

  Como: `position: sticky` com um `top` negativo, calculado para a última
  passagem ficar a 45% da altura do ecrã. Não acrescenta scroll nenhum,
  não prende a página: só deixa de subir o que já se leu, e o dedo
  continua a mandar. Se voltar atrás, a folha de cima desce e a de baixo
  volta a ser a página.

  - Recuo e sombra só com transform e opacity.
  - Tapada por inteiro, fica com opacidade 0: o browser deixa de a pintar
    por baixo das outras (continua lá para leitores de ecrã).
  - Movimento reduzido: secções normais, umas a seguir às outras.
*/
type Props = {
  id: string;
  rotulo?: string;
  className?: string;
  children: React.ReactNode;
};

const PASSAGEM_NO_ECRA = 0.45;

export default function Folha({ id, rotulo, className = '', children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const parado = useMovimentoReduzido();
  const { pos, medida } = useMedida(ref);
  const [topo, setTopo] = useState<number | null>(null);
  // onde fica o fundo da folha no ecrã quando ela prende (px)
  const fundo = useRef(1);

  useEffect(() => {
    if (parado) return;
    const calcular = () => {
      const el = ref.current;
      if (!el) return;
      const vh = window.innerHeight;
      const altura = el.offsetHeight;
      const passagens = el.querySelectorAll<HTMLElement>('[data-passagem]');
      const ultima = passagens[passagens.length - 1];
      const abaixo = ultima ? altura - (topoDentro(ultima, el) + ultima.offsetHeight / 2) : vh * 0.3;
      fundo.current = Math.min(vh, vh * PASSAGEM_NO_ECRA + abaixo);
      setTopo(Math.round(fundo.current - altura));
    };
    calcular();
    return aoMedir(calcular);
  }, [parado]);

  // 0 enquanto a folha corre normalmente; 1 quando a seguinte já a tapou
  const tapada = useTransform(pos, (v) => prender((fundo.current - (v + medida.current.altura)) / fundo.current));
  const recuo = useTransform(tapada, (t) => (t <= 0 ? 'none' : `scale(${1 - 0.045 * t})`));
  const origem = useTransform(tapada, () => `50% ${Math.round(medida.current.altura - fundo.current / 2)}px`);
  const opacidade = useTransform(tapada, (t) => (t >= 1 ? 0 : 1));
  const sombra = useTransform(tapada, (t) => t * 0.32);

  const pele = `relative shadow-[0_-24px_48px_-30px_rgba(17,22,18,0.3)] ${className}`;

  const vivo = !parado && topo !== null;

  return (
    <motion.section
      ref={ref}
      id={id}
      aria-labelledby={rotulo}
      data-capitulo
      className={pele}
      // em repouso, valores explícitos: tirar só o style deixava o último
      // transform escrito pelo Motion (e remontar a secção perdia quem a
      // observa, como o menu)
      style={vivo ? { position: 'sticky', top: topo, transform: recuo, transformOrigin: origem, opacity: opacidade } : { position: 'relative', top: 'auto', transform: 'none', opacity: 1 }}
    >
      {children}
      {!parado && <motion.div aria-hidden style={{ opacity: sombra }} className="pointer-events-none absolute inset-0 bg-noite" />}
    </motion.section>
  );
}
