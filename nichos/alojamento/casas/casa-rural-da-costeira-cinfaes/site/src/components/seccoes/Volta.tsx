'use client';

import Image from 'next/image';
import { motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import Passagem from '@/components/movimento/Passagem';
import { aoMedir } from '@/lib/posicao';
import { useMedia } from '@/lib/usaMedia';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useProgresso } from '@/lib/useProgresso';

/* 6. À volta (B): lista por ordem de distância, foto inteira sem recorte.
   Fotos de licença livre, com crédito.

   No computador (a partir de 1024 px) é a estrada do site anterior, que o
   Diogo aprovou (arquivo/AVolta-aprovado.tsx): a página prende e a fila
   dos cinco sítios corre de lado, do mais perto ao mais longe, como uma
   estrada que se afasta da casa; o seguinte espreita sempre à direita. O
   texto de cada sítio só acende quando o sítio está quase todo na janela.
   No telemóvel, e com movimento reduzido, fica a lista do B, parada. */
type Lugar = {
  foto: string;
  largura: number;
  altura: number;
  alt: string;
  credito: React.ReactNode;
  nome: string;
  tempo: string;
  frase: string;
};

const lugares: Lugar[] = [
  {
    foto: '/fotos/regiao-regiao-03.jpg',
    largura: 2400,
    altura: 1800,
    alt: 'O Douro em Porto Antigo, com a ponte, o cais e as casas à beira-rio',
    credito: (
      <>
        Foto: ManuelFBorges / <a href="https://commons.wikimedia.org/wiki/File:Porto_Antigo_-_Cinf%C3%A3es.jpg">Wikimedia Commons, «Porto Antigo - Cinfães»</a>,{' '}
        <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>
      </>
    ),
    nome: 'O Douro em Porto Antigo e no Carrapatelo',
    tempo: 'cerca de 8 a 10 min de carro',
    frase: 'A barragem do Carrapatelo, inaugurada em 1972, tem uma das maiores eclusas da Europa, com 35 m de desnível.',
  },
  {
    foto: '/fotos/regiao-regiao-02.jpg',
    largura: 2048,
    altura: 1365,
    alt: 'A foz do Bestança no Douro, com o viaduto, a povoação e as encostas',
    credito: (
      <>
        A foz do Bestança. Foto: Vitor Oliveira from Torres Vedras, PORTUGAL /{' '}
        <a href="https://commons.wikimedia.org/wiki/File:Foz_do_Rio_Bestan%C3%A7a_-_Portugal_(52345064659).jpg">Wikimedia Commons, «Foz do Rio Bestança - Portugal»</a>,{' '}
        <a href="https://creativecommons.org/licenses/by-sa/2.0">CC BY-SA 2.0</a>
      </>
    ),
    nome: 'O Vale do Bestança',
    tempo: 'cerca de 12 min de carro',
    frase: 'Um percurso circular de cerca de 6,7 km ao longo do rio, por Vila de Muros, Covelas e Vale Verde.',
  },
  {
    foto: '/fotos/regiao-regiao-01.jpg',
    largura: 2400,
    altura: 1590,
    alt: 'A igreja românica de Tarouquela vista do adro, com a torre sineira',
    credito: (
      <>
        Foto: Pedro from Maia (Porto), Portugal /{' '}
        <a href="https://commons.wikimedia.org/wiki/File:Igreja_de_Santa_Maria_Maior_de_Tarouquela_I_(36411616644).jpg">Wikimedia Commons, «Igreja de Santa Maria Maior de Tarouquela I»</a>,{' '}
        <a href="https://creativecommons.org/licenses/by/2.0">CC BY 2.0</a>
      </>
    ),
    nome: 'A igreja de Tarouquela',
    tempo: 'cerca de 14 min de carro',
    frase:
      'Românica, fundada no século XII, Monumento Nacional desde 1945. No portal, os «cães de Tarouquela», que, diz a tradição, afastam o mal. Visita por marcação, pela Rota do Românico.',
  },
  {
    foto: '/fotos/regiao-regiao-04.jpg',
    largura: 2400,
    altura: 1600,
    alt: 'A serra de Montemuro, com socalcos verdes e a encosta em cores de outono',
    credito: (
      <>
        Serra de Montemuro. Foto: C.felix / <a href="https://commons.wikimedia.org/wiki/File:IMG_montemuro.JPG">Wikimedia Commons, «IMG montemuro»</a>,{' '}
        <a href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>
      </>
    ),
    nome: 'As Portas de Montemuro',
    tempo: 'cerca de 22 min de carro, por estrada de serra',
    frase: 'Um miradouro a 1220 m, junto à Capela do Senhor do Amparo, em zona da Rede Natura 2000. É aqui que nasce o Bestança.',
  },
  {
    foto: '/fotos/regiao-regiao-05.jpg',
    largura: 2400,
    altura: 1594,
    alt: 'O passadiço de madeira sobre o rio Paiva, entre rochas e vegetação',
    credito: (
      <>
        Foto: Joseolgon / <a href="https://commons.wikimedia.org/wiki/File:Passadi%C3%A7o_do_Paiva_(10).JPG">Wikimedia Commons, «Passadiço do Paiva (10)»</a>,{' '}
        <a href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>
      </>
    ),
    nome: 'Os Passadiços do Paiva',
    tempo: 'cerca de 32 min de carro, até à entrada de Espiunca',
    frase: 'Um passadiço de madeira ao longo do Paiva, exigente, por praias fluviais e geossítios do Arouca Geopark.',
  },
];

const creditoClasse =
  'mt-2.5 text-[0.8rem] leading-[1.45] text-tinta-medio [&_a]:underline [&_a]:underline-offset-[3px] [&_a:hover]:text-tinta';

function Lista() {
  return (
    <ol className="m-0 list-none p-0">
      {lugares.map((l, i) => {
        const par = i % 2 === 1;
        return (
          <li
            key={l.foto}
            className="grid gap-6 border-t border-linha py-7 lg:grid-cols-[minmax(0,15rem)_1fr_minmax(0,15rem)] lg:items-start lg:gap-12"
          >
            <figure className={`m-0 ${par ? 'lg:col-start-3 lg:row-start-1' : ''}`}>
              <Image
                src={l.foto}
                alt={l.alt}
                width={l.largura}
                height={l.altura}
                sizes="(min-width: 1024px) 240px, 100vw"
                className="h-auto w-full"
              />
              <figcaption className={creditoClasse}>
                {l.credito}
              </figcaption>
            </figure>
            <div className={par ? 'lg:col-span-2 lg:col-start-1 lg:row-start-1' : ''}>
              <h3 className="mb-1.5 mt-0 text-[clamp(1.75rem,2.6vw,2.5rem)] uppercase leading-[0.95]">{l.nome}</h3>
              <p className="mb-3.5 mt-0 text-base font-semibold text-tinta-medio md:text-[0.8rem] md:uppercase md:tracking-[0.2em] [@media(max-height:500px)]:!text-base [@media(max-height:500px)]:!normal-case [@media(max-height:500px)]:!tracking-normal">{l.tempo}</p>
              <p className="m-0 max-w-[46ch]">{l.frase}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* A estrada: palco preso, a fila corre de lado tanto quanto é larga. */
function Estrada() {
  const alvo = useRef<HTMLDivElement>(null);
  const fila = useRef<HTMLOListElement>(null);
  const janela = useRef<HTMLDivElement>(null);
  const [distancia, setDistancia] = useState(0);
  const p = useProgresso(alvo, 'preso');
  const largura = useMotionValue(0);
  const transform = useTransform([p, largura], ([v, d]: number[]) => `translate3d(${(-v * d).toFixed(1)}px, 0, 0)`);

  // o texto de cada sítio só se acende quando o sítio está quase todo na
  // janela: à beira vê-se a foto a espreitar, sem letras cortadas
  const acender = () => {
    const el = fila.current;
    const w = janela.current?.clientWidth ?? 0;
    if (!el || !w) return;
    const dx = p.get() * largura.get();
    el.querySelectorAll<HTMLElement>(':scope > li').forEach((li) => {
      const esq = li.offsetLeft - dx;
      const frac = Math.max(0, Math.min(esq + li.offsetWidth, w) - Math.max(esq, 0)) / li.offsetWidth;
      const o = Math.max(0, Math.min(1, (frac - 0.8) / 0.18)).toFixed(2);
      li.querySelectorAll<HTMLElement>('[data-texto]').forEach((t) => {
        if (t.style.opacity !== o) t.style.opacity = o;
      });
    });
  };
  useMotionValueEvent(transform, 'change', acender);

  useEffect(() => {
    const medir = () => {
      const el = fila.current;
      if (!el) return;
      const d = Math.max(0, el.scrollWidth - (janela.current?.clientWidth ?? window.innerWidth));
      largura.set(d);
      setDistancia(d);
      acender();
    };
    medir();
    return aoMedir(medir);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [largura]);

  return (
    <div ref={alvo} className="relative" style={{ height: `calc(100lvh + ${distancia}px)` }}>
      <div className="sticky top-0 flex h-lvh items-center overflow-hidden pt-20">
        {/* a janela da estrada, alinhada com a moldura: os sítios entram e
            saem pelas margens dela, não pela beira do ecrã */}
        <div className="mx-auto w-full max-w-[1760px] px-5 md:px-6 lg:px-6">
          <div ref={janela} className="overflow-hidden">
            <motion.ol ref={fila} style={{ transform }} className="m-0 flex w-max list-none gap-24 p-0 will-change-transform">
              {lugares.map((l) => (
                <li key={l.foto} className="w-[min(37vw,68lvh)] flex-none border-t border-linha pt-6">
                  <figure className="m-0">
                    <Image src={l.foto} alt={l.alt} width={l.largura} height={l.altura} sizes="(min-width: 1024px) 37vw, 100vw" className="h-auto w-full" />
                    <figcaption data-texto className={creditoClasse}>
                      {l.credito}
                    </figcaption>
                  </figure>
                  <div data-texto className="mt-5">
                    <h3 className="mb-1.5 mt-0 text-[clamp(1.75rem,2.6vw,2.5rem)] uppercase leading-[0.95]">{l.nome}</h3>
                    <p className="mb-3 mt-0 text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-tinta-medio">{l.tempo}</p>
                    <p className="m-0 max-w-[46ch]">{l.frase}</p>
                  </div>
                </li>
              ))}
            </motion.ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Volta() {
  const parado = useMovimentoReduzido();
  const largo = useMedia('(min-width: 1024px)');
  const estrada = largo && !parado;

  return (
    <section id="volta" className="scroll-mt-20 border-t border-linha pt-[72px]">
      <div className="moldura">
        <div className="grid gap-7 pb-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div>
            <p className="rotulo">Por ordem de distância</p>
            <h2 className="titulo mt-[18px]" style={{ ['--titulo' as string]: 'clamp(2.6rem, 5.6vw, 5.8rem)' }}>
              O Douro, a serra e <em>o românico</em>
            </h2>
          </div>
          <p className="m-0 max-w-[40ch]">
            A casa fica na Calçada de Medados, em Cinfães, a cerca de 1,5 km do centro da vila e dos restaurantes.
          </p>
        </div>

        {!estrada && <Lista />}
      </div>

      {estrada && <Estrada />}

      <div className="mx-auto max-w-[1440px] px-6 pb-[72px] pt-16 text-center md:px-10">
        <Passagem className="passagem">Ao fim do dia, volta-se para a piscina. Falta só escolher as datas.</Passagem>
      </div>
    </section>
  );
}
