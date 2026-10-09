'use client';

import Image from 'next/image';
import { easeInOut, motion, useTransform, type MotionValue } from 'motion/react';
import { useRef, type ReactNode } from 'react';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useMedia } from '@/lib/usaMedia';
import Titulo from '@/components/Titulo';
import { usePico, type Momento as MomentoPico } from './dados';
import PicoEstatico from './Estatico';

/*
  VARIANTE P5 - Livro antigo.

  Um livro antigo aberto sobre uma mesa escura. A primeira folha dupla e a
  folha de rosto: a frase de abertura da forma de contar. Cada troca de
  momento e uma folha que vira em 3D sobre a lombada: a foto aparece como
  uma estampa na pagina da esquerda e o momento na da direita, com
  capitular e numero de pagina.

  Mecanica: as folhas sao metades do livro presas a lombada (origin-left)
  que rodam de 0 a -180 graus. Cada folha tem frente e verso com
  backface-visibility escondida. O z-index troca a meio: antes de virar,
  a primeira folha esta por cima a direita; depois de virada, a ultima
  esta por cima a esquerda.

  No telemovel o livro tem uma pagina so, e as folhas viram da mesma
  maneira, com a foto e o texto na mesma pagina.
*/

type M = MomentoPico;

const ROMANOS = ['I', 'II', 'III'];
// inicio de cada virar de folha no progresso, e quanto dura
const VIRA = [0.1, 0.4, 0.7];
const DURA = 0.17;

const TINTA = '#2b2418';
const SEPIA = '#7a5a2e';

/* Uma pagina de papel velho. As medidas de texto sao em cqw (largura da
   propria pagina), para o livro inteiro crescer e encolher junto. */
function Papel({ lado, children }: { lado: 'esq' | 'dir' | 'unica'; children: ReactNode }) {
  const dobra =
    lado === 'esq'
      ? 'linear-gradient(to left, rgba(70,45,20,.30), rgba(70,45,20,0) 16%)'
      : lado === 'dir'
        ? 'linear-gradient(to right, rgba(70,45,20,.30), rgba(70,45,20,0) 16%)'
        : 'linear-gradient(to right, rgba(70,45,20,.22), rgba(70,45,20,0) 9%)';
  return (
    <div
      className="absolute inset-0 overflow-hidden [container-type:inline-size]"
      style={{ color: TINTA, background: 'radial-gradient(ellipse at 50% 45%, #f6eedb 0%, #efe2c4 55%, #e0cc9f 100%)' }}
    >
      {/* manchas do tempo e a sombra da lombada */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 86% 10%, rgba(150,105,45,.13), transparent 16%), radial-gradient(circle at 10% 92%, rgba(140,100,45,.11), transparent 20%), radial-gradient(circle at 70% 70%, rgba(150,110,50,.06), transparent 12%)',
        }}
      />
      <div className="pointer-events-none absolute inset-0" style={{ background: dobra }} />
      <div className="relative flex h-full flex-col">{children}</div>
    </div>
  );
}

function Ornamento({ tamanho = '4cqw' }: { tamanho?: string }) {
  return (
    <p aria-hidden className="text-center leading-none" style={{ color: SEPIA, fontSize: tamanho }}>
      ❦
    </p>
  );
}

function Numero({ n }: { n: number }) {
  return (
    <p className="mt-auto pb-[5cqw] text-center font-display text-[3cqw] italic opacity-70">{n}</p>
  );
}

function Cabeca() {
  return (
    <p className="pt-[6cqw] text-center text-[2cqw] uppercase tracking-[0.3em] opacity-60">{casa.nome}</p>
  );
}

/* Pagina da esquerda por baixo de tudo: o frontispicio. */
function Frontispicio() {
  return (
    <Papel lado="esq">
      <div className="flex h-full flex-col items-center justify-center px-[12cqw] text-center">
        <p className="text-[2.2cqw] uppercase tracking-[0.35em] opacity-70">Livro da casa</p>
        <div className="my-[5cqw] h-px w-[30cqw]" style={{ background: SEPIA, opacity: 0.5 }} />
        <p className="font-display text-[11cqw] font-semibold leading-[1.02]">{casa.nome}</p>
        <p className="mt-[3cqw] font-display text-[4.5cqw] italic opacity-80">{casa.lugar}</p>
        <div className="relative mt-[6cqw] aspect-[4/3] w-[38cqw] border p-[.8cqw]" style={{ borderColor: 'rgba(90,65,30,.4)', background: '#fbf5e6' }}>
          <div className="relative h-full w-full overflow-hidden">
            <Image src={casa.atmosfera.imagemPequena ?? casa.atmosfera.imagem} alt={casa.atmosfera.altPequena ?? casa.atmosfera.alt} fill sizes="20vw" className="object-cover [filter:sepia(.18)_saturate(.85)]" />
          </div>
        </div>
      </div>
    </Papel>
  );
}

/* A folha de rosto: a frase que abre a seccao. */
function Rosto({ lado, n }: { lado: 'dir' | 'unica'; n: number }) {
  const forma = usePico();
  return (
    <Papel lado={lado}>
      <div className="flex flex-1 flex-col items-center justify-center px-[11cqw] text-center">
        <p className="text-[2.4cqw] uppercase tracking-[0.35em]" style={{ color: SEPIA }}>
          {forma.etiqueta}
        </p>
        <h2 className="mt-[6cqw] font-display text-[12cqw] font-semibold leading-[1.02]" style={{ color: TINTA }}>
          <Titulo texto={forma.titulo} />
        </h2>
        <div className="my-[6cqw]">
          <Ornamento />
        </div>
        <p className="max-w-[66cqw] font-display text-[4.8cqw] italic leading-[1.45] opacity-85">{forma.intro}</p>
      </div>
      <Numero n={n} />
    </Papel>
  );
}

function Estampa({ m, i }: { m: M; i: number }) {
  return (
    <figure className="w-full">
      <div className="relative aspect-[5/4] w-full border p-[.8cqw]" style={{ borderColor: 'rgba(90,65,30,.45)', background: '#fbf5e6' }}>
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={m.imagem}
            alt={m.alt}
            fill
            sizes="(max-width: 1024px) 80vw, 36vw"
            quality={85}
            className="object-cover [filter:sepia(.2)_saturate(.9)_contrast(1.02)]"
          />
        </div>
      </div>
      <figcaption className="mt-[3cqw] text-center">
        <span className="text-[2.2cqw] uppercase tracking-[0.3em]" style={{ color: SEPIA }}>
          Estampa {ROMANOS[i]}
        </span>
        <span className="mt-[1cqw] block font-display text-[3.6cqw] italic opacity-80">{m.momento}</span>
      </figcaption>
    </figure>
  );
}

/* Pagina da esquerda: a estampa sozinha. */
function PaginaEstampa({ m, i, n }: { m: M; i: number; n: number }) {
  return (
    <Papel lado="esq">
      <Cabeca />
      <div className="flex flex-1 items-center px-[7cqw]">
        <Estampa m={m} i={i} />
      </div>
      <Numero n={n} />
    </Papel>
  );
}

function Momento({ m, compacto = false }: { m: M; compacto?: boolean }) {
  const grande = m.marca.length > 6;
  return (
    <>
      <p
        className="font-display italic leading-none"
        style={{ color: SEPIA, fontSize: compacto ? (grande ? '7cqw' : '9cqw') : grande ? '9cqw' : '13cqw' }}
      >
        {m.marca}
      </p>
      <p className={`uppercase tracking-[0.3em] opacity-70 ${compacto ? 'mt-[2cqw] text-[2.4cqw]' : 'mt-[3cqw] text-[2.2cqw]'}`}>
        {m.momento}
      </p>
      <h3 className={`font-display leading-[1.12] ${compacto ? 'mt-[3cqw] text-[6cqw]' : 'mt-[5cqw] text-[6.4cqw]'}`} style={{ color: TINTA }}>
        {m.titulo}
      </h3>
      <div className={compacto ? 'my-[3cqw]' : 'my-[5cqw]'}>
        <div className="h-px w-[16cqw]" style={{ background: SEPIA, opacity: 0.5 }} />
      </div>
      <p
        className={`font-display leading-[1.55] first-letter:float-left first-letter:mr-[0.5cqw] first-letter:mt-[0.6cqw] first-letter:font-display first-letter:leading-[0.8] ${
          compacto ? 'text-[3.9cqw] first-letter:text-[11cqw]' : 'text-[4cqw] first-letter:text-[12cqw]'
        }`}
        style={{ color: TINTA }}
      >
        {m.texto}
      </p>
    </>
  );
}

/* Pagina da direita: o momento. */
function PaginaTexto({ m, n }: { m: M; n: number }) {
  return (
    <Papel lado="dir">
      <Cabeca />
      <div className="flex flex-1 flex-col justify-center px-[12cqw]">
        <Momento m={m} />
      </div>
      <Numero n={n} />
    </Papel>
  );
}

/* Telemovel: estampa e momento na mesma pagina. */
function PaginaUnica({ m, i, n }: { m: M; i: number; n: number }) {
  return (
    <Papel lado="unica">
      <Cabeca />
      <div className="flex flex-1 flex-col justify-center px-[10cqw]">
        <div className="relative aspect-[5/4] w-full border p-[.9cqw]" style={{ borderColor: 'rgba(90,65,30,.45)', background: '#fbf5e6' }}>
          <div className="relative h-full w-full overflow-hidden">
            <Image src={m.imagem} alt={m.alt} fill sizes="80vw" quality={85} className="object-cover [filter:sepia(.2)_saturate(.9)]" />
          </div>
        </div>
        <p className="mt-[2cqw] text-center text-[2.4cqw] uppercase tracking-[0.3em]" style={{ color: SEPIA }}>
          Estampa {ROMANOS[i]}
        </p>
        <div className="mt-[5cqw]">
          <Momento m={m} compacto />
        </div>
      </div>
      <Numero n={n} />
    </Papel>
  );
}

/* Uma folha presa a lombada, com frente e verso. */
function Folha({
  p,
  k,
  frente,
  verso,
  unica = false,
}: {
  p: MotionValue<number>;
  k: number;
  frente: ReactNode;
  verso: ReactNode;
  unica?: boolean;
}) {
  const s = VIRA[k];
  const rot = useTransform(p, [s, s + DURA], [0, -180], { ease: easeInOut });
  // por cima de tudo enquanto vira; parada, a ordem depende do lado
  const z = useTransform(rot, (r) => (r > -0.5 ? 30 - k : r < -179.5 ? 10 + k : 60));
  // a luz: a frente escurece ao levantar, o verso clareia ao pousar
  const sombraFrente = useTransform(rot, [0, -90], [0, 0.4]);
  const sombraVerso = useTransform(rot, [-90, -180], [0.4, 0]);
  // no telemovel a folha virada sai do livro: apaga-se depois de passar o meio
  const opacidade = useTransform(rot, [-110, -170], [1, unica ? 0 : 1]);

  return (
    <motion.div
      style={{ rotateY: rot, zIndex: z, opacity: opacidade, transformStyle: 'preserve-3d' }}
      className={`absolute inset-y-0 origin-left ${unica ? 'left-0 w-full' : 'left-1/2 w-1/2'}`}
    >
      <div className="absolute inset-0 [-webkit-backface-visibility:hidden] [backface-visibility:hidden]">
        {frente}
        <motion.div style={{ opacity: sombraFrente }} className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#1a1208]/70 to-[#1a1208]/10" />
      </div>
      <div className="absolute inset-0 [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [transform:rotateY(180deg)]">
        {verso}
        <motion.div style={{ opacity: sombraVerso }} className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1a1208]/70 to-[#1a1208]/10" />
      </div>
    </motion.div>
  );
}

/* A capa de couro e as orlas das folhas, por tras das paginas. */
function Capa({ unica = false }: { unica?: boolean }) {
  return (
    <>
      <div
        className="absolute -inset-[2.2%] rounded-[6px] shadow-[0_50px_90px_-30px_rgba(0,0,0,.8)]"
        style={{ background: 'radial-gradient(ellipse at 50% 35%, #5a3720 0%, #3a2314 60%, #24150b 100%)' }}
      />
      <div
        className="absolute -inset-y-[0.9%] -right-[0.9%] left-0 rounded-r-[3px]"
        style={{
          background: '#d6c192',
          backgroundImage: 'repeating-linear-gradient(to bottom, rgba(110,80,40,.22) 0 1px, transparent 1px 3px)',
          ...(unica ? {} : { left: '-0.9%', borderRadius: 3 }),
        }}
      />
    </>
  );
}

function Mesa({ children, alvo, altura }: { children: ReactNode; alvo: React.Ref<HTMLElement>; altura: string }) {
  return (
    <section
      ref={alvo}
      className="relative"
      style={{ height: altura, background: 'radial-gradient(ellipse at 50% 40%, #cdbb9d 0%, #ad9776 60%, #887253 100%)' }}
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">{children}</div>
    </section>
  );
}

function LivroAberto() {
  const alvo = useRef<HTMLElement>(null);
  const p = useProgresso(alvo, 'preso');
  const momentos = usePico().momentos;
  // o livro assenta um pouco ao chegar, como se o poisassem na mesa
  const escala = useTransform(p, [0, 0.06], [0.96, 1]);

  return (
    <Mesa alvo={alvo} altura="440vh">
      <motion.div
        style={{ scale: escala, width: 'min(94vw, calc(90vh * 1.46))', aspectRatio: '1.46', perspective: '2600px' }}
        className="relative"
      >
        <Capa />
        <div className="absolute inset-y-0 left-0 w-1/2">
          <Frontispicio />
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2">
          <PaginaTexto m={momentos[2]} n={9} />
        </div>
        <Folha p={p} k={0} frente={<Rosto lado="dir" n={3} />} verso={<PaginaEstampa m={momentos[0]} i={0} n={4} />} />
        <Folha p={p} k={1} frente={<PaginaTexto m={momentos[0]} n={5} />} verso={<PaginaEstampa m={momentos[1]} i={1} n={6} />} />
        <Folha p={p} k={2} frente={<PaginaTexto m={momentos[1]} n={7} />} verso={<PaginaEstampa m={momentos[2]} i={2} n={8} />} />
        {/* a lombada */}
        <div
          className="pointer-events-none absolute inset-y-0 left-1/2 z-[70] w-[3%] -translate-x-1/2"
          style={{ background: 'linear-gradient(to right, transparent, rgba(50,30,12,.22) 50%, transparent)' }}
        />
      </motion.div>
    </Mesa>
  );
}

function LivroPagina() {
  const alvo = useRef<HTMLElement>(null);
  const p = useProgresso(alvo, 'preso');
  const momentos = usePico().momentos;
  const verso = <Papel lado="unica">{null}</Papel>;

  return (
    <Mesa alvo={alvo} altura="380vh">
      <div style={{ width: 'min(91vw, calc(86vh * 0.7))', aspectRatio: '0.7', perspective: '1800px' }} className="relative">
        <Capa unica />
        <div className="absolute inset-0">
          <PaginaUnica m={momentos[2]} i={2} n={9} />
        </div>
        <Folha unica p={p} k={0} frente={<Rosto lado="unica" n={3} />} verso={verso} />
        <Folha unica p={p} k={1} frente={<PaginaUnica m={momentos[0]} i={0} n={5} />} verso={verso} />
        <Folha unica p={p} k={2} frente={<PaginaUnica m={momentos[1]} i={1} n={7} />} verso={verso} />
      </div>
    </Mesa>
  );
}

function LivroAnimado() {
  const largo = useMedia('(min-width: 1024px)');
  return largo ? <LivroAberto /> : <LivroPagina />;
}

/* Com movimento reduzido, o pico e a lista estatica, igual em todas as variantes. */
export default function Livro() {
  const parado = useMovimentoReduzido();
  return parado ? <PicoEstatico /> : <LivroAnimado />;
}
