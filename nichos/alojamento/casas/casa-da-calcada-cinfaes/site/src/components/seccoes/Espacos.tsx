'use client';

import Image from 'next/image';
import { easeInOut, motion, useTransform } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { useMedia } from '@/lib/usaMedia';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import Revelar from '@/components/Revelar';
import Titulo from '@/components/Titulo';

/*
  Os espacos.

  O titulo e a introducao passam primeiro, a rolar como qualquer texto. So
  depois a faixa se prende, e o que fica preso e so a fotografia com o
  nome e a nota por baixo: tem o ecra inteiro para si.

  A faixa nao desliza cartao a cartao: anda de pagina em pagina, e cada
  pagina e exactamente a largura do ecra com tres cartoes inteiros la
  dentro. Em nenhum momento ha meia fotografia cortada pela borda, que era
  o defeito da variante E1 do catalogo e o que fazia a seccao parecer
  travada a meio.

  Tudo o que esta preso escala com a altura do ecra (clamp em vh): numa
  janela baixa a fotografia encolhe e o texto acompanha, em vez de ficar
  cortado por baixo.

  No telemovel e com movimento reduzido nao ha prisao nenhuma: a faixa
  anda com o dedo e com as setas.
*/

const ESPACOS = casa.visita.espacos;
const POR_PAGINA = 3;

function Cartao({ e, presa }: { e: (typeof ESPACOS)[number]; presa?: boolean }) {
  return (
    <li className={presa ? '' : 'w-[78vw] shrink-0 snap-start sm:w-[42vw]'}>
      <div
        className={presa ? 'relative w-full overflow-hidden' : 'relative aspect-[4/5] w-full overflow-hidden'}
        // presa: a fotografia fica com a altura que sobra do ecra depois
        // do texto do cartao e das margens
        style={presa ? { height: 'clamp(8rem, calc(100dvh - 19rem), 28rem)' } : undefined}
      >
        <Image
          src={e.imagem}
          alt={e.alt}
          fill
          quality={86}
          sizes="(max-width: 640px) 78vw, 30vw"
          className="object-cover"
        />
      </div>
      <h3 className="mt-[clamp(0.5rem,1.6vh,1rem)] text-[clamp(1rem,2.2vh,1.3rem)] text-tinta">{e.nome}</h3>
      <p className="mt-1.5 text-[clamp(0.76rem,1.6vh,0.9rem)] font-light leading-[1.55] text-tinta-medio">{e.nota}</p>
    </li>
  );
}

function Cabeca({ setas }: { setas?: React.ReactNode }) {
  const v = casa.visita;
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-6 md:flex-row md:items-end md:justify-between md:px-10">
      <Revelar className="max-w-[46ch]">
        <p className="versalete text-ouro-escuro">{v.etiqueta}</p>
        <h2 className="mt-4 text-[2.1rem] text-tinta md:text-[2.6rem]">
          <Titulo texto={v.titulo} />
        </h2>
        <p className="mt-4 text-[0.95rem] font-light leading-[1.7] text-tinta-medio">{v.intro}</p>
      </Revelar>
      {setas}
    </div>
  );
}

/* A faixa presa, so no computador. */
function Presa() {
  const alvo = useRef<HTMLDivElement>(null);
  const [largura, setLargura] = useState(0);

  useEffect(() => {
    const medir = () => setLargura(document.documentElement.clientWidth);
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  const paginas = Math.ceil(ESPACOS.length / POR_PAGINA);
  const saltos = Math.max(1, paginas - 1);

  const p = useProgresso(alvo, 'preso');

  // anda de pagina em pagina e descansa em cada uma: 55% do troco a andar,
  // 45% parado com a pagina inteira no sitio
  const inicio = 0.12;
  const fim = 0.88;
  const troco = (fim - inicio) / saltos;
  const entrada: number[] = [0];
  const saida: number[] = [0];
  for (let i = 0; i < saltos; i += 1) {
    const t = inicio + troco * i;
    entrada.push(t, t + troco * 0.55);
    saida.push(-largura * i, -largura * (i + 1));
  }
  entrada.push(1);
  saida.push(-largura * saltos);

  const x = useTransform(p, entrada, saida, { ease: easeInOut });

  return (
    <div ref={alvo} style={{ height: `calc(100dvh + ${saltos * 900}px)` }}>
      <div className="sticky top-0 flex h-lvh items-center overflow-hidden pt-20">
        <motion.div style={{ x }} className="flex">
          {Array.from({ length: paginas }, (_, pagina) => (
            <ul
              key={pagina}
              className="grid shrink-0 grid-cols-3 gap-6 px-6 md:px-10"
              style={{ width: largura || undefined }}
            >
              {ESPACOS.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA).map((e) => (
                <Cartao key={e.nome} e={e} presa />
              ))}
            </ul>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* Telemovel e movimento reduzido: faixa livre, com o dedo e com setas. */
function Livre() {
  const pista = useRef<HTMLUListElement>(null);
  const [pontas, setPontas] = useState({ inicio: true, fim: false });

  const medir = useCallback(() => {
    const el = pista.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setPontas({ inicio: el.scrollLeft <= 4, fim: el.scrollLeft >= max - 4 });
  }, []);

  useEffect(() => {
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [medir]);

  const andar = (sentido: 1 | -1) => {
    const el = pista.current;
    if (!el) return;
    const cartao = el.querySelector('li');
    const passo = cartao ? cartao.getBoundingClientRect().width + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: passo * sentido, behavior: 'smooth' });
  };

  const seta = (ligado: boolean) =>
    `grid size-12 place-items-center border border-linha text-tinta transition-colors ${
      ligado ? 'hover:bg-tinta hover:text-osso' : 'opacity-35'
    }`;

  return (
    <>
      <Cabeca
        setas={
          <div className="flex gap-2">
            <button type="button" onClick={() => andar(-1)} disabled={pontas.inicio} aria-label="Espaço anterior" className={seta(!pontas.inicio)}>
              <CaretLeftIcon size={18} weight="light" />
            </button>
            <button type="button" onClick={() => andar(1)} disabled={pontas.fim} aria-label="Espaço seguinte" className={seta(!pontas.fim)}>
              <CaretRightIcon size={18} weight="light" />
            </button>
          </div>
        }
      />
      <ul
        ref={pista}
        onScroll={medir}
        tabIndex={0}
        aria-label="Os espaços da quinta"
        className="sem-barra mt-10 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-2 md:px-10"
      >
        {ESPACOS.map((e) => (
          <Cartao key={e.nome} e={e} />
        ))}
      </ul>
    </>
  );
}

export default function Espacos() {
  const parado = useMovimentoReduzido();
  const telemovel = useMedia('(max-width: 1023px)');
  const livre = parado || telemovel;

  return (
    <section id="espacos" className="scroll-mt-20 border-b border-linha bg-linho-escuro pb-20 pt-20 md:pt-24">
      {livre ? (
        <Livre />
      ) : (
        <>
          <Cabeca />
          <div className="mt-12">
            <Presa />
          </div>
        </>
      )}
    </section>
  );
}
