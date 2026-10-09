'use client';

import Image from 'next/image';
import { motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { aoMedir, prender } from '@/lib/posicao';
import { suave } from '@/lib/useRevelacao';
import AcoesReserva from '@/components/AcoesReserva';
import Botao from '@/components/Botao';
import Titulo from '@/components/Titulo';

/*
  O primeiro ecrã, formato fixo de todas as casas: a foto aérea a ecrã
  inteiro, e alinhados à esquerda e em cima a etiqueta, o título, o texto e
  as duas ações.

  Ao descer (pedido do Diogo, 2026-10-09; corrigido no mesmo dia): a câmara
  desce até à piscina. A aérea aproxima-se da piscina (só até 4×, para não
  se verem os píxeis) e, ao mesmo tempo, roda e inclina-se: a piscina, que
  na aérea está de viés (o lado comprido a ~55° da horizontal), deita-se
  quase na horizontal e encurta em perspetiva, e desliza para o sítio onde
  a água da piscina-03 vai aparecer. Aí a piscina-03 (vista do chão) entra
  por cima, a cobrir o ecrã, e encolhe até ao lugar dela no "Cá fora", ao
  lado do título "O dia passa-se cá fora." e da frase "A piscina.", com o
  linho a aparecer à volta. Não precisa de bater certo: é a ideia de
  continuidade, a mesma água vista de cima e depois do chão. Serve a
  passagem "Mas o melhor da casa está cá fora".

  A voz do Rui (o segundo tempo do esqueleto) saiu, a pedido do Diogo.

  Tudo preso ao scroll: no telemóvel acompanha o dedo. Com movimento
  reduzido não há prisão: o primeiro ecrã parado e, a seguir, o bloco da
  piscina no seu lugar.
*/
const facil = [0.22, 0.61, 0.36, 1] as const;

// a piscina na foto do primeiro ecrã (vista-02-hero.jpg, 2528×1684): centro
// em fração da foto, e o lado comprido a descer para a direita a ~55°
// (cantos medidos: 1497,728 · 1613,718 · 1726,867 · 1594,882 em píxeis).
const FOTO = { w: 2528, h: 1684, piscinaX: 0.639, piscinaY: 0.4715 };
// a piscina na piscina-03 (2400×1600): centro da água e o lado comprido
// quase na horizontal (a borda da frente sobe ~4° para a direita).
const FOTO3 = { w: 2400, h: 1600, piscinaX: 0.39, piscinaY: 0.75 };
// o recorte da aérea (object-position): no telemóvel puxa para a direita,
// para a piscina não ficar colada à margem (tem de bater com RECORTE_FOTO)
const recorteX = (vw: number) => (vw < 768 ? 0.6 : 0.5);
const RECORTE_FOTO = 'object-cover object-[60%_50%] md:object-[50%_50%]';
// o recorte da piscina-03 no bloco preso: abaixo de lg a foto enche a
// altura que sobra e fica mais alta do que larga; puxa para a esquerda,
// para a água caber (tem de bater com RECORTE_P3)
const recorte3X = (vw: number) => (vw < 1024 ? 0.4 : 0.5);
const RECORTE_P3 = 'object-cover object-[40%_50%] lg:object-[50%_50%]';

const ZOOM = 4; // até onde a aérea se aproxima (era 10: viam-se os píxeis)
const ZOOM_TELEMOVEL = 3; // no telemóvel a piscina já enche a largura a 3×
const RODA = -59; // graus: deita o lado comprido da piscina (55° → -4°)
const INCLINA = 34; // graus: a câmara levanta o olhar para o horizonte

// as fases do progresso preso (0 a 1)
const MERGULHO = [0.02, 0.44] as const; // a aérea aproxima-se, roda e inclina
const TROCA = [0.3, 0.44] as const; // a piscina-03 entra por cima
const POUSO = [0.3, 0.5] as const; // a piscina-03 acaba de assentar
const ENCAIXE = [0.46, 0.84] as const; // encolhe até ao lugar dela
const TEXTO = [0.74, 0.94] as const; // o título e a frase ao lado

const fase = (v: number, [a, b]: readonly [number, number]) => prender((v - a) / (b - a));

/* A piscina dentro da caixa da foto inteira (a origem das transformações). */
function origemAerea({ vw, vh, ox, oy }: Geo) {
  const iw = Math.max(vw, (vh * FOTO.w) / FOTO.h);
  const ih = (iw * FOTO.h) / FOTO.w;
  return `${(ox - (vw - iw) * recorteX(vw)).toFixed(1)}px ${(oy - (vh - ih) / 2).toFixed(1)}px`;
}

/* A escala mínima da aérea para os quatro cantos do ecrã ainda caírem
   dentro da foto, com a piscina em (px, py) no ecrã, rodada `roda` graus
   e inclinada `inclina` graus com perspetiva `d`. Desfaz-se a inclinação
   (exata, com a perspetiva) e a rotação de cada canto e compara-se com a
   distância da piscina a cada borda da foto. */
function cobrir(g: Geo, e: number, roda: number, inclina: number, d: number) {
  const { vw, vh, ox, oy, tx, ty } = g;
  const s = Math.max(vw / FOTO.w, vh / FOTO.h);
  const esq = ox - (vw - FOTO.w * s) * recorteX(vw);
  const dir = FOTO.w * s - esq;
  const cima = oy - (vh - FOTO.h * s) / 2;
  const baixo = FOTO.h * s - cima;
  const px = ox + (tx - ox) * e;
  const py = oy + (ty - oy) * e;
  const fi = (inclina * Math.PI) / 180;
  const a = (-roda * Math.PI) / 180;
  let z = 1;
  for (const [cx, cy] of [[0, 0], [vw, 0], [0, vh], [vw, vh]]) {
    const X = cx - px;
    const Y = cy - py;
    const den = d * Math.cos(fi) + Y * Math.sin(fi);
    if (den <= 1) return 50; // acima do horizonte: nunca acontece com estes ângulos
    const y = (Y * d) / den;
    const x = (X * (d - y * Math.sin(fi))) / d;
    const u = Math.cos(a) * x - Math.sin(a) * y;
    const w = Math.sin(a) * x + Math.cos(a) * y;
    z = Math.max(z, u < 0 ? -u / esq : u / dir, w < 0 ? -w / cima : w / baixo);
  }
  return z;
}

type Geo = {
  vw: number;
  vh: number;
  ox: number; // a piscina na aérea, no ecrã
  oy: number;
  tx: number; // a água da piscina-03 no ecrã, quando ela entra
  ty: number;
  bx: number; // a água da piscina-03 dentro da caixa dela
  by: number;
  x: number; // a caixa final da piscina-03
  y: number;
  w: number;
  h: number;
};

const PISCINA = {
  src: '/fotos/piscina-03.jpg',
  alt: 'Piscina de água turquesa com espreguiçadeiras e chapéus-de-sol, e os socalcos de vinha na encosta atrás',
};

function Cabeca({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      <p className="marca-pequena text-[0.9rem] lg:text-[1rem]">Mas o melhor da casa está cá fora.</p>
      <h2 className="mt-4 max-w-[10ch] text-[3.3rem] leading-[1] lg:mt-5 lg:text-[clamp(3rem,4.3vw,4.6rem)]">
        O dia passa-se <em>cá fora.</em>
      </h2>
      <p className="mt-4 max-w-[32ch] text-[1.22rem] leading-snug lg:mt-6 lg:text-[1.32rem]">
        A piscina é só da casa, e o jardim também, com entrada própria e duche ao ar livre.
      </p>
    </div>
  );
}

/* O lugar final da piscina-03: no computador, oito colunas com o título e
   "A piscina." ao lado; no telemóvel, o título por cima e a foto a toda a
   largura ("A piscina." fica logo a seguir, no CaFora). Preso, no
   telemóvel, a foto enche a altura que sobra (sem faixa vazia por cima). */
function BlocoPiscina({
  preso,
  lugar,
  textoStyle,
  children,
}: {
  preso: boolean;
  lugar?: React.Ref<HTMLDivElement>;
  textoStyle?: React.ComponentProps<typeof motion.div>['style'];
  children: React.ReactNode;
}) {
  return (
    <div className={preso ? 'absolute inset-0 flex flex-col justify-end pb-8 pt-[92px] lg:pb-10 lg:pt-[100px]' : 'pt-20 md:pt-28 lg:pb-0'}>
      <div className={preso ? 'flex min-h-0 flex-1 flex-col lg:grid lg:flex-none lg:grid-cols-12' : 'lg:grid lg:grid-cols-12'}>
        <motion.div style={textoStyle} className="lg:hidden">
          <Cabeca className="caixa" />
        </motion.div>
        <div
          ref={lugar}
          className={
            preso
              ? 'relative mt-6 min-h-[220px] w-full flex-1 lg:col-[1/9] lg:mt-0 lg:h-[min(80svh,50vw)] lg:min-h-[520px] lg:flex-none'
              : 'relative mt-7 aspect-[3/2] w-full lg:col-[1/9] lg:mt-0 lg:aspect-auto lg:h-[min(80svh,50vw)] lg:min-h-[520px]'
          }
        >
          {children}
        </div>
        <motion.div style={textoStyle} className="hidden flex-col justify-between px-8 pb-3 lg:col-[9/13] lg:flex xl:px-10">
          <Cabeca />
          <div>
            <h3 className="text-[clamp(2rem,3.4vw,3rem)] italic">A piscina.</h3>
            <p className="mt-3.5 max-w-[30ch] text-[1.05rem]">Água turquesa, espreguiçadeiras e os socalcos logo atrás.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Promessa() {
  const { etiqueta, titulo, texto } = casa.hero;
  return (
    <>
      <p className="versalete text-osso">{etiqueta}</p>
      <h1 className="mt-5 max-w-[15ch] text-[2.9rem] leading-[1.02] tracking-[-0.02em] text-osso sm:text-[4.2rem] lg:text-[5.75rem]">
        <Titulo texto={titulo} />
      </h1>
      <p className="mt-6 max-w-[46ch] text-[1.02rem] leading-relaxed text-osso md:text-[1.12rem]">{texto}</p>
      <div className="mt-9 flex flex-wrap gap-3">
        <AcoesReserva claro limite={1} />
        <Botao href={casa.navegacao[0]?.href ?? '#conteudo'} tom="contorno-claro">
          Conhecer a casa
        </Botao>
      </div>
    </>
  );
}

export default function Hero() {
  const parado = useMovimentoReduzido();
  return parado ? <HeroParado /> : <HeroMergulho />;
}

function HeroParado() {
  const { imagem, alt } = casa.hero;
  return (
    <>
      <section className="relative isolate h-lvh min-h-[560px] w-full overflow-hidden">
        <Image src={imagem} alt={alt} fill priority unoptimized sizes="100vw" className={`-z-10 ${RECORTE_FOTO}`} />
        <div className="veu-hero absolute inset-0 -z-10" />
        <div className="relative mx-auto flex h-full max-w-[1320px] flex-col justify-start px-6 pb-16 pt-32 md:px-10 md:pt-36 lg:pt-40">
          <Promessa />
        </div>
      </section>
      <BlocoPiscina preso={false}>
        <Image src={PISCINA.src} alt={PISCINA.alt} fill sizes="(min-width: 1024px) 67vw, 100vw" quality={88} className="object-cover" />
      </BlocoPiscina>
    </>
  );
}

function HeroMergulho() {
  const alvo = useRef<HTMLDivElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const lugar = useRef<HTMLDivElement>(null);
  const { imagem, alt } = casa.hero;

  const [geo, setGeo] = useState<Geo>({ vw: 1440, vh: 900, ox: 920, oy: 422, tx: 560, ty: 700, bx: 374, by: 540, x: 0, y: 140, w: 960, h: 720 });
  const geoRef = useRef(geo);
  const versao = useMotionValue(0);

  useEffect(() => {
    // O palco tem 100lvh: a barra do browser a esconder-se não lhe muda a
    // altura, e o aoMedir já ignora esse resize no telemóvel.
    const medir = () => {
      const p = palco.current;
      const l = lugar.current;
      if (!p || !l) return;
      const vw = p.clientWidth;
      const vh = p.clientHeight;
      // a piscina na aérea (object-cover com o recorte dela)
      const s = Math.max(vw / FOTO.w, vh / FOTO.h);
      const ox = (vw - FOTO.w * s) * recorteX(vw) + FOTO.piscinaX * FOTO.w * s;
      const oy = (vh - FOTO.h * s) / 2 + FOTO.piscinaY * FOTO.h * s;
      // a caixa final da piscina-03 e a água dentro dela
      const rp = p.getBoundingClientRect();
      const rl = l.getBoundingClientRect();
      const x = rl.left - rp.left;
      const y = rl.top - rp.top;
      const w = rl.width;
      const h = rl.height;
      const s3 = Math.max(w / FOTO3.w, h / FOTO3.h);
      const bx = (w - FOTO3.w * s3) * recorte3X(vw) + FOTO3.piscinaX * FOTO3.w * s3;
      const by = (h - FOTO3.h * s3) / 2 + FOTO3.piscinaY * FOTO3.h * s3;
      // onde essa água fica no ecrã quando a foto entra a cobrir o ecrã
      const cobre = Math.max(vw / w, vh / h);
      const tx = vw / 2 + (bx - w / 2) * cobre;
      const ty = vh / 2 + (by - h / 2) * cobre;
      const g = { vw, vh, ox, oy, tx, ty, bx, by, x, y, w, h };
      geoRef.current = g;
      setGeo(g);
      versao.set(versao.get() + 1);
    };
    medir();
    return aoMedir(medir);
  }, [versao]);

  const p = useProgresso(alvo, 'preso');

  // a aérea: aproxima-se da piscina (zoom exponencial: cada passo de scroll
  // aproxima o mesmo tanto), roda e inclina-se à volta dela, e leva-a até
  // onde a água da piscina-03 vai aparecer
  const aerea = useTransform([p, versao], ([v]: number[]) => {
    const { vw, vh, ox, oy, tx, ty } = geoRef.current;
    const e = suave(fase(v, MERGULHO));
    const zoomMax = vw < 768 ? ZOOM_TELEMOVEL : ZOOM;
    const zDesejado = 1.02 * Math.pow(zoomMax / 1.02, e);
    const d = Math.max(vw, vh) * 1.6;
    const inclina = INCLINA * e;
    const roda = RODA * e;
    // ao rodar e inclinar, os cantos do ecrã podiam ficar sem foto: a
    // escala nunca desce abaixo da que ainda cobre o ecrã todo
    const z = Math.max(zDesejado, cobrir(geoRef.current, e, roda, inclina, d) * 1.03);
    return (
      `translate(${((tx - ox) * e).toFixed(1)}px, ${((ty - oy) * e).toFixed(1)}px) ` +
      `perspective(${d.toFixed(0)}px) rotateX(${inclina.toFixed(2)}deg) ` +
      `rotate(${roda.toFixed(2)}deg) scale(${z.toFixed(4)})`
    );
  });
  const veuHero = useTransform(p, [0.02, 0.18], [1, 0]);
  const saiOp = useTransform(p, [0.02, 0.12], [1, 0]);
  const saiY = useTransform(p, [0.02, 0.12], [0, -50]);
  const saiToque = useTransform(p, (v) => (v > 0.09 ? 'none' : 'auto'));
  const aereaVisivel = useTransform(p, (v) => (v > TROCA[1] + 0.02 ? 'hidden' : 'visible'));

  // a piscina-03: entra a cobrir o ecrã, um pouco maior, e assenta à volta
  // da água; depois encolhe até ao lugar dela
  const piscinaOp = useTransform(p, (v) => suave(fase(v, TROCA)));
  const queda = useTransform(p, (v) => `scale(${(1 + 0.12 * (1 - suave(fase(v, POUSO)))).toFixed(4)})`);
  const piscinaT = useTransform([p, versao], ([v]: number[]) => {
    const { vw, vh, x, y, w, h } = geoRef.current;
    const cobre = Math.max(vw / w, vh / h);
    const e = suave(fase(v, ENCAIXE));
    const escala = Math.pow(cobre, 1 - e);
    const tx = (vw / 2 - (x + w / 2)) * (1 - e);
    const ty = (vh / 2 - (y + h / 2)) * (1 - e);
    return `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${escala.toFixed(4)})`;
  });

  // o véu de cima, para o menu claro se ler sobre as fotos, até o
  // cabeçalho ganhar fundo de linho
  const veuTopo = useTransform(p, [0.5, 0.58], [1, 0]);
  const textoOp = useTransform(p, (v) => suave(fase(v, TEXTO)));
  const textoT = useTransform(p, (v) => `translateY(${((1 - suave(fase(v, TEXTO))) * 24).toFixed(1)}px)`);

  const entrada = (atraso: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: atraso, ease: facil },
  });
  const { etiqueta, titulo, texto } = casa.hero;

  return (
    <div ref={alvo} className="relative h-[190lvh] md:h-[220lvh]">
      <div ref={palco} className="sticky top-0 isolate h-lvh min-h-[560px] w-full overflow-hidden bg-linho">
        <BlocoPiscina preso lugar={lugar} textoStyle={{ opacity: textoOp, transform: textoT }}>
          <motion.div className="absolute inset-0 z-20 will-change-transform" style={{ opacity: piscinaOp, transform: piscinaT }}>
            <motion.div className="absolute inset-0" style={{ transform: queda, transformOrigin: `${geo.bx}px ${geo.by}px` }}>
              <Image src={PISCINA.src} alt={PISCINA.alt} fill sizes="(min-width: 1024px) 67vw, 100vw" quality={88} className={RECORTE_P3} />
            </motion.div>
          </motion.div>
        </BlocoPiscina>

        {/* a aérea e a promessa, por cima do bloco até a piscina-03 a tapar */}
        <motion.section className="absolute inset-0 z-10" style={{ visibility: aereaVisivel }}>
          <div className="absolute inset-0 -z-10 bg-noite" />
          {/* A foto inteira, do tamanho com que cobre o ecrã (o mesmo
              recorte do RECORTE_FOTO): ao rodar, o que estava fora do ecrã
              entra nos cantos, em vez de um vazio. */}
          <div
            className="absolute left-[60%] top-1/2 -z-10 -translate-x-[60%] -translate-y-1/2 md:left-1/2 md:-translate-x-1/2"
            style={{ width: `max(100%, calc(max(100lvh, 560px) * ${(FOTO.w / FOTO.h).toFixed(5)}))`, aspectRatio: `${FOTO.w} / ${FOTO.h}` }}
          >
            <motion.div className="absolute inset-0 will-change-transform" style={{ transform: aerea, transformOrigin: origemAerea(geo) }}>
              {/* sem recompressão (pedido do Diogo): o ficheiro tal como veio */}
              <Image src={imagem} alt={alt} fill priority unoptimized sizes="100vw" className="object-cover" />
            </motion.div>
          </div>
          <motion.div className="veu-hero absolute inset-0 -z-10" style={{ opacity: veuHero }} />

          <div className="relative mx-auto h-svh max-w-[1320px] px-6 md:h-full md:px-10">
            <motion.div style={{ opacity: saiOp, y: saiY, pointerEvents: saiToque }} className="flex h-full flex-col justify-start pb-16 pt-32 md:pt-36 lg:pt-40">
              <motion.p {...entrada(0.1)} className="versalete text-osso">
                {etiqueta}
              </motion.p>
              <motion.h1 {...entrada(0.2)} className="mt-5 max-w-[15ch] text-[2.9rem] leading-[1.02] tracking-[-0.02em] text-osso sm:text-[4.2rem] lg:text-[5.75rem]">
                <Titulo texto={titulo} />
              </motion.h1>
              <motion.p {...entrada(0.35)} className="mt-6 max-w-[46ch] text-[1.02rem] leading-relaxed text-osso md:text-[1.12rem]">
                {texto}
              </motion.p>
              <motion.div {...entrada(0.5)} className="mt-9 flex flex-wrap gap-3">
                <AcoesReserva claro limite={1} />
                <Botao href={casa.navegacao[0]?.href ?? '#conteudo'} tom="contorno-claro">
                  Conhecer a casa
                </Botao>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        <motion.div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-30 h-36 bg-[linear-gradient(180deg,rgba(36,26,20,.42),rgba(36,26,20,0))]" style={{ opacity: veuTopo }} />
      </div>
    </div>
  );
}
