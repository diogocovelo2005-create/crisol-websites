'use client';

import Image from 'next/image';
import { motion, useTransform } from 'motion/react';
import { useEffect, useRef } from 'react';
import { prender, useMedida } from '@/lib/posicao';
import { useMedia } from '@/lib/usaMedia';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  Abre-se a janela, como fundo de uma secção (pedido do Diogo: a piscina
  com a casa ao fundo, em "Escolher as datas").

  A foto vive numa camada de fundo, numa caixa sticky do tamanho do ecrã,
  presa dentro da secção. Quando a secção entra, a foto é uma janela
  estreita sobre o verde e abre-se até encher o ecrã enquanto o topo da
  secção sobe; depois fica aberta, como fundo, e o conteúdo sobe por cima
  dela. A foto não estica: a moldura cresce (scale) e a imagem lá dentro
  faz a escala inversa, a recuar um pouco.

  O conteúdo começa um respiro (10svh) abaixo do topo, para a janela ter
  onde abrir; o conteúdo sobe por cima enquanto ela abre. Sem véu sobre a
  foto (o Diogo não quis a mancha escura): quem usa o Janela dá fundo
  próprio ao texto (em Reservar, um painel verde-sombra sólido). A legenda da foto, discreta, no canto inferior
  esquerdo, num fundo próprio pequeno, só no computador (no telemóvel
  ficava debaixo do texto).

  Preso ao scroll, sem prender a página: no telemóvel anda com o dedo e
  volta a fechar se ele subir. Só transform e opacity.
  Movimento reduzido: a foto aberta como fundo, sem respiro, tudo à vista.
*/
type Props = {
  id: string;
  rotulo: string;
  src: string;
  alt: string;
  foco: string;
  legenda: string;
  className?: string;
  children: React.ReactNode;
};


export default function Janela({ id, rotulo, src, alt, foco, legenda, className = '', children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const parado = useMovimentoReduzido();
  const telemovel = useMedia('(max-width: 767px)');
  const { pos, medida } = useMedida(ref);

  // por ref: a função do useTransform pode ficar com o valor do 1.º render
  const partida = useRef<[number, number]>([0.42, 0.72]);
  useEffect(() => {
    partida.current = telemovel ? [0.6, 0.78] : [0.42, 0.72];
  }, [telemovel]);

  // de o topo da secção entrar por baixo (0) até chegar ao topo do ecrã (1)
  const aberto = useTransform(pos, (v) => {
    const vh = medida.current.vh;
    return prender(((vh - v) / vh - 0.08) / 0.84);
  });
  const moldura = useTransform(aberto, (t) => {
    const [x0, y0] = partida.current;
    return t >= 1 ? 'none' : `scale(${x0 + (1 - x0) * t}, ${y0 + (1 - y0) * t})`;
  });
  const foto = useTransform(aberto, (t) => {
    const [x0, y0] = partida.current;
    const sx = x0 + (1 - x0) * t;
    const sy = y0 + (1 - y0) * t;
    const recuo = 1 + 0.1 * (1 - t);
    return t >= 1 ? 'none' : `scale(${recuo / sx}, ${recuo / sy})`;
  });
  const depois = useTransform(aberto, (t) => prender((t - 0.72) / 0.28));

  const imagem = <Image src={src} alt={alt} fill sizes="100vw" quality={99} className="object-cover" style={{ objectPosition: foco }} />;
  const textoLegenda = (
    <p className="m-6 inline-block bg-floresta/90 px-3 py-1.5 text-[0.82rem] leading-snug text-osso lg:m-8">{legenda}</p>
  );

  return (
    <section ref={ref} id={id} aria-labelledby={rotulo} className={`relative isolate ${className}`}>
      {/* o fundo: a foto num ecrã preso dentro da secção */}
      <div className="absolute inset-0 -z-10">
        {parado ? (
          <div className="absolute inset-0 overflow-hidden">{imagem}</div>
        ) : (
          <div className="sticky top-0 h-svh">
            <motion.div style={{ transform: moldura }} className="absolute inset-0 overflow-hidden">
              <motion.div style={{ transform: foto }} className="absolute inset-0">
                {imagem}
              </motion.div>
            </motion.div>
            <motion.figure style={{ opacity: depois }} className="absolute bottom-0 left-0 hidden md:block">
              <figcaption>{textoLegenda}</figcaption>
            </motion.figure>
          </div>
        )}
      </div>

      {!parado && <div aria-hidden className="h-[10svh]" />}

      {/* o conteúdo não desvanece: com o respiro curto entrava a meio do
          desvanecer, translúcido sobre a janela a abrir; o painel opaco de
          quem usa o Janela sobe inteiro por cima da foto */}
      <div className="relative">
        {children}
      </div>

      {parado && (
        <figure className="absolute bottom-0 left-0 hidden md:block">
          <figcaption>{textoLegenda}</figcaption>
        </figure>
      )}
    </section>
  );
}
