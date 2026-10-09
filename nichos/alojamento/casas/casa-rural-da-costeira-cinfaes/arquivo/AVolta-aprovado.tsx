'use client';

import Image from 'next/image';
import { motion, useMotionValue, useMotionValueEvent, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import Revelar from '@/components/Revelar';
import { aoMedir } from '@/lib/posicao';
import { useMedia } from '@/lib/usaMedia';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useProgresso } from '@/lib/useProgresso';

/*
  6 · A volta (sequencia). A lista do B, por ordem de distancia, com a
  foto ao lado do texto e a alternar de lado. As fotos sao de terceiros
  (Wikimedia Commons): inteiras, sem recorte, sem texto por cima, com o
  credito colado a cada uma.

  No computador e uma sequencia: a pagina prende e a fila dos quatro
  sitios corre de lado, do mais perto ao mais longe, como uma estrada que
  se afasta da casa. O seguinte espreita sempre a direita, para se saber
  que ha mais. No telemovel, e com movimento reduzido, fica a lista
  vertical, que ja se le ao ritmo do dedo.
*/
type Lugar = {
  nome: string;
  tempo: string;
  frase: string;
  foto: { src: string; largura: number; altura: number; alt: string };
  credito: { antes?: string; autor: string; titulo: string; pagina: string; licenca: string; licencaUrl: string };
};

const lugares: Lugar[] = [
  {
    nome: 'O Douro',
    tempo: 'cerca de 8 a 10 min de carro',
    frase: 'No Carrapatelo, uma das maiores eclusas da Europa.',
    foto: { src: '/fotos/regiao-regiao-03.jpg', largura: 2400, altura: 1800, alt: 'O Douro em Porto Antigo, com a ponte, o cais e as casas à beira-rio' },
    credito: {
      autor: 'ManuelFBorges',
      titulo: 'Porto Antigo - Cinfães',
      pagina: 'https://commons.wikimedia.org/wiki/File:Porto_Antigo_-_Cinf%C3%A3es.jpg',
      licenca: 'CC BY-SA 4.0',
      licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
  {
    nome: 'O Vale do Bestança',
    tempo: 'cerca de 12 min de carro',
    frase: 'Um percurso de cerca de 6,7 km ao longo do rio.',
    foto: { src: '/fotos/regiao-regiao-02.jpg', largura: 2048, altura: 1365, alt: 'A foz do Bestança no Douro, com o viaduto, a povoação e as encostas' },
    credito: {
      antes: 'A foz do Bestança.',
      autor: 'Vitor Oliveira from Torres Vedras, PORTUGAL',
      titulo: 'Foz do Rio Bestança - Portugal',
      pagina: 'https://commons.wikimedia.org/wiki/File:Foz_do_Rio_Bestan%C3%A7a_-_Portugal_(52345064659).jpg',
      licenca: 'CC BY-SA 2.0',
      licencaUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    },
  },
  {
    nome: 'Tarouquela',
    tempo: 'cerca de 14 min de carro',
    frase: 'Igreja românica, Monumento Nacional desde 1945; visita por marcação, pela Rota do Românico.',
    foto: { src: '/fotos/regiao-regiao-01.jpg', largura: 2400, altura: 1590, alt: 'A igreja românica de Tarouquela vista do adro, com a torre sineira' },
    credito: {
      autor: 'Pedro from Maia (Porto), Portugal',
      titulo: 'Igreja de Santa Maria Maior de Tarouquela I',
      pagina: 'https://commons.wikimedia.org/wiki/File:Igreja_de_Santa_Maria_Maior_de_Tarouquela_I_(36411616644).jpg',
      licenca: 'CC BY 2.0',
      licencaUrl: 'https://creativecommons.org/licenses/by/2.0',
    },
  },
  {
    nome: 'Os Passadiços do Paiva',
    tempo: 'cerca de 32 min de carro',
    frase: 'Um passadiço de madeira ao longo do rio, exigente.',
    foto: { src: '/fotos/regiao-regiao-05.jpg', largura: 2400, altura: 1594, alt: 'O passadiço de madeira sobre o rio Paiva, entre rochas e vegetação' },
    credito: {
      autor: 'Joseolgon',
      titulo: 'Passadiço do Paiva (10)',
      pagina: 'https://commons.wikimedia.org/wiki/File:Passadi%C3%A7o_do_Paiva_(10).JPG',
      licenca: 'CC BY-SA 4.0',
      licencaUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    },
  },
];

function Credito({ l }: { l: Lugar }) {
  return (
    <figcaption className="mt-2.5 max-w-[60ch] text-[0.78rem] leading-[1.45] text-tinta-medio">
      {l.credito.antes ? `${l.credito.antes} ` : ''}Foto: {l.credito.autor} /{' '}
      <a href={l.credito.pagina} target="_blank" rel="noopener noreferrer" className="underline">
        Wikimedia Commons, «{l.credito.titulo}»
      </a>
      ,{' '}
      <a href={l.credito.licencaUrl} target="_blank" rel="noopener noreferrer" className="underline">
        {l.credito.licenca}
      </a>
    </figcaption>
  );
}

function Lista() {
  return (
    <ol className="mt-12 list-none border-b border-linha p-0 md:mt-16">
      {lugares.map((l, i) => (
        <li key={l.nome} className="grid gap-6 border-t border-linha py-8 md:grid-cols-2 md:items-center md:gap-12 lg:grid-cols-[28rem_1fr] lg:gap-16">
          <figure className={`m-0 ${i % 2 ? 'lg:order-2 lg:justify-self-end' : ''}`}>
            <Image
              src={l.foto.src}
              alt={l.foto.alt}
              width={l.foto.largura}
              height={l.foto.altura}
              sizes="(min-width: 1024px) 448px, (min-width: 768px) 45vw, 100vw"
              className="h-auto w-full lg:w-[28rem]"
            />
            <Credito l={l} />
          </figure>
          <div className={i % 2 ? 'lg:order-1 lg:pl-0' : ''}>
            <h3 className="text-[2rem] uppercase leading-[0.95] md:text-[2.4rem]">{l.nome}</h3>
            <p className="versalete mt-3 text-tinta-medio">{l.tempo}</p>
            <p className="mt-4 max-w-[44ch] text-[1.0625rem] leading-[1.6]">{l.frase}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* A estrada: palco preso, a fila corre de lado tanto quanto e larga. */
function Estrada() {
  const alvo = useRef<HTMLDivElement>(null);
  const fila = useRef<HTMLOListElement>(null);
  const janela = useRef<HTMLDivElement>(null);
  const [distancia, setDistancia] = useState(0);
  const p = useProgresso(alvo, 'preso');
  const largura = useMotionValue(0);
  const transform = useTransform([p, largura], ([v, d]: number[]) => `translate3d(${(-v * d).toFixed(1)}px, 0, 0)`);

  // o texto de cada sitio so se acende quando o sitio esta quase todo na
  // janela: a meio da beira ve-se a foto a espreitar, sem letras cortadas
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
  }, [largura]);

  return (
    <div ref={alvo} className="relative mt-12 md:mt-16" style={{ height: `calc(100lvh + ${distancia}px)` }}>
      <div className="sticky top-0 flex h-lvh items-center overflow-hidden pt-16">
        {/* a janela da estrada: alinhada com a grelha, os sitios entram e
            saem pelas margens dela, nao pela beira do ecra */}
        <div className="mx-auto w-full max-w-[1320px] px-10">
        <div ref={janela} className="overflow-hidden">
        <motion.ol
          ref={fila}
          style={{ transform }}
          className="m-0 flex w-max list-none gap-24 p-0 will-change-transform"
        >
          {lugares.map((l) => (
            <li key={l.nome} className="w-[min(37vw,72lvh)] flex-none border-t border-linha pt-6">
              <figure className="m-0">
                <Image
                  src={l.foto.src}
                  alt={l.foto.alt}
                  width={l.foto.largura}
                  height={l.foto.altura}
                  sizes="(min-width: 1024px) 46vw, 100vw"
                  className="h-auto w-full"
                />
                <div data-texto>
                  <Credito l={l} />
                </div>
              </figure>
              <div data-texto className="mt-6 grid grid-cols-[1fr_1.15fr] items-start gap-8">
                <div>
                  <h3 className="text-[2.4rem] uppercase leading-[0.95]">{l.nome}</h3>
                  <p className="versalete mt-3 text-tinta-medio">{l.tempo}</p>
                </div>
                <p className="m-0 text-[1.0625rem] leading-[1.6]">{l.frase}</p>
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

export default function AVolta() {
  const parado = useMovimentoReduzido();
  const largo = useMedia('(min-width: 1024px)');
  const estrada = largo && !parado;

  return (
    <section id="volta" className="scroll-mt-20 bg-linho py-20 md:py-28">
      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <h2 className="titulo-seccao">
            À <em>volta</em>
          </h2>
          <p className="max-w-[48ch] text-[1.0625rem] leading-[1.6]">
            A casa fica em Cinfães, a cerca de 1,5 km do centro da vila e dos restaurantes.
          </p>
        </div>

        {!estrada && <Lista />}
      </div>

      {estrada && <Estrada />}

      <div className="mx-auto max-w-[1320px] px-6 md:px-10">
        <p className="mt-6 max-w-[60ch] text-base text-tinta-medio min-[1100px]:text-[0.95rem]">
          Tempos de carro aproximados, sem trânsito. Fontes: Rota do Românico e município de Arouca.
        </p>

        <Revelar className="mt-14 md:mt-20">
          <p className="passagem text-tinta">Ao fim do dia, volta-se para a piscina.</p>
        </Revelar>
      </div>
    </section>
  );
}
