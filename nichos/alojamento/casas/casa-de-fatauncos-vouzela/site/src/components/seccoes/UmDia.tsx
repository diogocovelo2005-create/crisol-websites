'use client';

import Image from 'next/image';
import { easeInOut, easeOut, motion, useTransform, type MotionValue } from 'motion/react';
import { useRef } from 'react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { casa } from '@/lib/casa';
import { useProgresso } from '@/lib/useProgresso';
import { useMedia } from '@/lib/usaMedia';
import Revelar from '@/components/Revelar';
import Titulo from '@/components/Titulo';
import ShinyText from '@/components/reactbits/ShinyText';
import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/ssr';

/*
  Ato 3 - O PICO. Sentimento: desejo.

  "E o site onde passas um dia inteiro na casa so com o scroll."

  A pagina prende-se e o scroll passa a ser o dia. Nao ha horas, porque
  quem esta nesta casa nao tem hora: ha tres partes do dia (Manha, Tarde,
  Noite). Cada parte tem duas fotografias (a Tarde tem tres: ha mais para
  fazer a tarde), que caem uma a seguir a outra
  como provas em papel pousadas numa mesa (rodadas, com sombra). Quando
  chega a parte seguinte, as novas caem por cima e as antigas afundam e
  desaparecem por baixo. A cor da propria pagina acompanha a luz, e na base
  corre a linha do dia com o sol a andar.

  E o ato com mais scroll da pagina e antes dele ha um instante de silencio:
  so o titulo, sozinho. O ultimo momento fica parado no fim, a noite, para o
  dia acabar em vez de desaparecer.

  Tudo guiado pelo scroll: nao ha nada para clicar nem arrastar. Com
  movimento reduzido, volta a lista estatica com as fotografias.

  Nota de afinacao: a altura do palco (300vh no telemovel, 380vh no
  computador) e o tempo que a seccao dura no scroll, e da cerca de 560 px
  (telemovel) e 840 px (computador) por parte do dia. Se se mudar a altura,
  as fracoes das duracoes (0.025, 0.115, 0.04, 0.108 e o `t` do Momento) tem
  de mudar na proporcao inversa, senao a queda das fotografias muda de
  velocidade.
*/

// janelas de cada parte do dia no progresso do ato
const JANELAS = [
  { entra: 0.05, sai: 0.38 },
  { entra: 0.38, sai: 0.69 },
  { entra: 0.69, sai: 1.01 },
];

// onde assenta cada foto dentro do palco: a primeira grande, a segunda mais
// pequena e desencontrada. As partes alternam de lado para nao repetir.
// alto: a que altura da mesa assenta. cap: altura maxima, em % da mesa.
type Pose = { lado: 'esq' | 'dir'; largura: number; rot: number; alto: 'topo' | 'meio' | 'base'; cap: number };
const POSE: Pose[][] = [
  [
    { lado: 'esq', largura: 86, rot: -2.5, alto: 'topo', cap: 75 },
    { lado: 'dir', largura: 64, rot: 3.5, alto: 'base', cap: 70 },
  ],
  [
    // tres fotografias: mais pequenas, em escada (direita em cima, esquerda
    // a meio, direita em baixo), cada uma a tapar so um canto da anterior
    { lado: 'dir', largura: 68, rot: 2, alto: 'topo', cap: 56 },
    { lado: 'esq', largura: 54, rot: -4, alto: 'meio', cap: 44 },
    { lado: 'dir', largura: 50, rot: 3.5, alto: 'base', cap: 42 },
  ],
  [
    // a fachada ao anoitecer e panoramica: ocupa a mesa toda
    { lado: 'esq', largura: 100, rot: -1.5, alto: 'topo', cap: 75 },
    { lado: 'dir', largura: 64, rot: 3, alto: 'base', cap: 70 },
  ],
];

// cada foto espera um pouco mais do que a anterior, e as de tras caem mais
// devagar, senao a troca entre elas passa despercebida
const ATRASO = [0, 0.038, 0.076];
const QUEDA = [0.115, 0.145, 0.145];
const APARECE = [0.04, 0.058, 0.058];
const ALTURA = { topo: 'top-[1%]', meio: 'top-[31%]', base: 'bottom-[1%]' };

function Prova({ p, parte, n }: { p: MotionValue<number>; parte: number; n: number }) {
  const foto = casa.fortes.partes[parte].fotos[n];
  const pose = POSE[parte][n];
  const { entra, sai } = JANELAS[parte];
  const ultimo = parte === JANELAS.length - 1;

  // caem quase juntas, so com um desencontro curto. Aparecem cedo (a
  // opacidade fecha em 1/3 do caminho) mas o movimento estende-se para ser
  // suave.
  const cai = entra + ATRASO[n];
  const assenta = cai + QUEDA[n];
  // quando a parte seguinte comeca a cair, esta afunda e apaga-se
  const afunda = sai;
  const some = sai + 0.108;

  const dx = pose.lado === 'esq' ? -40 : 40;
  const keys = ultimo ? [cai, assenta] : [cai, assenta, afunda, some];

  const visivel = cai + APARECE[n];
  const opacidade = useTransform(
    p,
    ultimo ? [cai, visivel] : [cai, visivel, afunda, some],
    ultimo ? [0, 1] : [0, 1, 1, 0],
    { ease: easeInOut },
  );
  // entram de cima, como uma foto pousada na mesa: assim nunca invadem o texto por baixo
  const y = useTransform(p, keys, ultimo ? [-110, 0] : [-110, 0, 0, 20], { ease: easeOut });
  const x = useTransform(p, [cai, assenta], [dx, 0], { ease: easeOut });
  const rot = useTransform(p, keys, ultimo ? [pose.rot * 3.5, pose.rot] : [pose.rot * 3.5, pose.rot, pose.rot, pose.rot * 0.6], { ease: easeOut });
  const escala = useTransform(p, keys, ultimo ? [1.08, 1] : [1.08, 1, 1, 0.92], { ease: easeOut });
  // enquanto cai, a sombra esta longe (foto no ar); ao assentar encosta
  const sombra = useTransform(
    p,
    [cai, assenta],
    ['0 60px 90px -20px rgba(17,26,20,0.35)', '0 18px 40px -18px rgba(17,26,20,0.45)'],
  );

  return (
    <motion.figure
      style={{
        opacity: opacidade,
        y,
        x,
        rotate: rot,
        scale: escala,
        boxShadow: sombra,
        // largura pela pose, mas nunca mais alta do que cabe na mesa: em
        // ecras baixos (320x568) as fotos, medidas so pela largura, saiam da
        // mesa e tapavam o texto. cqw/cqh sao as medidas da mesa.
        width: `min(${pose.largura}cqw, ${pose.cap * foto.aspeto}cqh)`,
        aspectRatio: foto.aspeto,
        zIndex: parte * 3 + n + 1,
      }}
      className={`absolute overflow-hidden rounded-[2px] ${ALTURA[pose.alto]} ${
        pose.lado === 'esq' ? 'left-0' : 'right-0'
      }`}
    >
      <Image src={foto.src} alt={foto.alt} fill quality={86} sizes="(max-width: 1024px) 92vw, 50vw" className="object-cover" />
    </motion.figure>
  );
}

function Momento({ p, i, rapido }: { p: MotionValue<number>; i: number; rapido: boolean }) {
  const f = casa.fortes.partes[i];
  const { entra, sai } = JANELAS[i];
  const ultimo = i === JANELAS.length - 1;
  // no telemovel a seccao e mais curta, por isso a fracao e maior; a curva
  // easeInOut arranca e para devagar, para o texto nao aparecer aos solavancos
  const t = rapido ? 0.11 : 0.095;
  const keys = ultimo ? [entra, entra + t] : [entra, entra + t, sai - t, sai];
  const op = useTransform(p, keys, ultimo ? [0, 1] : [0, 1, 1, 0], { ease: easeInOut });
  const y = useTransform(p, keys, ultimo ? [36, 0] : [36, 0, 0, -36], { ease: easeInOut });
  // os tres momentos estao empilhados; os que estao transparentes ficam
  // escondidos de verdade, senao tapavam a ligacao do momento visivel (e
  // continuavam a apanhar o foco do teclado)
  const visibilidade = useTransform(op, (v) => (v < 0.05 ? 'hidden' : 'visible'));

  return (
    <motion.div style={{ opacity: op, y, visibility: visibilidade }} className="absolute inset-0 flex flex-col justify-center">
      {/* no telemovel o texto e as margens sao um pouco menores: em ecras de
          altura media (ex.: 360x780) o texto da noite passava por cima da
          linha do dia */}
      <p className="font-display text-[3rem] leading-none lg:text-[5rem] max-lg:[@media(max-height:820px)]:text-[2.4rem] max-lg:[@media(max-height:600px)]:text-[2rem]">
        <Titulo texto={`*${f.periodo}*`} />
      </p>
      {/* no iPhone SE (320x568) nao ha altura para tudo: o rotulo sai */}
      <p className="versalete mt-3 opacity-70 lg:mt-4 max-lg:[@media(max-height:820px)]:mt-2 max-lg:[@media(max-height:600px)]:hidden">{f.momento}</p>
      <h3 className="mt-3 text-[1.85rem] lg:mt-5 lg:text-[2.7rem] max-lg:[@media(max-height:820px)]:mt-2 max-lg:[@media(max-height:820px)]:text-[1.6rem] max-lg:[@media(max-height:600px)]:text-[1.4rem]">{f.titulo}</h3>
      <p className="mt-3 max-w-[40ch] lg:mt-4 font-light leading-[1.8] opacity-80 max-lg:[@media(max-height:820px)]:mt-2 max-lg:[@media(max-height:820px)]:text-[0.92rem] max-lg:[@media(max-height:820px)]:leading-[1.6] max-[380px]:leading-[1.6]">
        {/* hifen que nao parte: "pequeno-almoco" nao pode ficar a meio de duas linhas */}
        {f.texto.replaceAll('-', '‑')}
      </p>
      {/* a ligacao: so uma linha fina por baixo (a borda, e nao um
          text-decoration, que o bg-clip-text do ShinyText apagava) e a seta
          de "abre fora". Nada de botao. O brilho (ShinyText) e o zoom
          (.ligacao-zoom em globals.css) chamam o olho; no telemovel o zoom e
          sozinho. No telemovel o tamanho segue a largura do ecra: a frase
          tem de caber numa linha mesmo no zoom de 6% (320 px: 17,5 px de
          letra; a partir de 390 px: 1,4rem) */}
      {'ligacao' in f && (
        <a
          href={f.ligacao.href}
          {...(f.ligacao.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="ligacao-zoom group mt-3 inline-flex items-center gap-1.5 self-start whitespace-nowrap border-b border-ouro-escuro/40 pb-1.5 font-display text-[min(1.4rem,calc((100vw-72px)/14.2))] italic leading-none transition-colors hover:border-ouro-escuro lg:mt-6 lg:gap-2 lg:text-[1.45rem] max-lg:[@media(max-height:820px)]:mt-2.5 max-lg:[@media(max-height:820px)]:text-[min(1.25rem,calc((100vw-72px)/14.2))]"
        >
          <ShinyText text={f.ligacao.texto} speed={3.2} />
          <ArrowUpRightIcon
            size={18}
            weight="bold"
            className="shrink-0 text-ouro-escuro transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      )}
    </motion.div>
  );
}

function Estatico() {
  const { etiqueta, titulo, partes } = casa.fortes;
  return (
    <section className="mx-auto max-w-[1320px] px-6 pt-28 md:px-10 md:pt-36">
      <p className="versalete text-center text-ouro-escuro">{etiqueta}</p>
      <h2 className="mt-5 text-center text-[2.5rem] text-tinta md:text-[3.2rem]">
        <Titulo texto={titulo} />
      </h2>
      <div className="mt-16 space-y-24">
        {partes.map((f) => (
          <Revelar key={f.titulo} className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-[5/4]">
              {f.fotos.map((foto, n) => (
                <figure
                  key={foto.src}
                  className={`absolute overflow-hidden rounded-[2px] shadow-[0_18px_40px_-18px_rgba(17,26,20,0.45)] ${
                    n === 0
                      ? 'left-0 top-0 w-[82%] -rotate-2'
                      : n === 1
                        ? 'bottom-0 right-0 w-[62%] rotate-3'
                        : 'bottom-[6%] left-[4%] w-[46%] -rotate-1'
                  }`}
                  style={{ aspectRatio: foto.aspeto }}
                >
                  <Image src={foto.src} alt={foto.alt} fill quality={86} sizes="(max-width: 768px) 82vw, 42vw" className="object-cover" />
                </figure>
              ))}
            </div>
            <div>
              <p className="font-display text-[3rem] leading-none text-ouro">
                <em>{f.periodo}</em>
              </p>
              <p className="versalete mt-3 text-tinta-medio">{f.momento}</p>
              <h3 className="mt-4 text-[2rem] text-tinta">{f.titulo}</h3>
              <p className="mt-3 max-w-[42ch] font-light leading-[1.8] text-tinta-medio">{f.texto}</p>
              {'ligacao' in f && (
                <a
                  href={f.ligacao.href}
                  {...(f.ligacao.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="mt-5 inline-flex items-center gap-2 border-b border-ouro-escuro/40 pb-1.5 font-display text-[1.35rem] italic leading-none text-ouro-escuro"
                >
                  {f.ligacao.texto}
                  <ArrowUpRightIcon size={16} weight="bold" className="shrink-0" />
                </a>
              )}
            </div>
          </Revelar>
        ))}
      </div>
    </section>
  );
}

export default function UmDia() {
  const parado = useMovimentoReduzido();
  // telemovel deitado: com ~390 px de altura nao ha lugar para as fotos, o
  // texto e a linha do dia no mesmo ecra (as fotos tapavam o texto). Ai
  // mostra-se a versao corrida, a mesma do movimento reduzido.
  const deitado = useMedia('(orientation: landscape) and (max-height: 500px)');
  return parado || deitado ? <Estatico /> : <Palco />;
}

// Componente proprio para o useProgresso so correr com o alvo montado.
function Palco() {
  const alvo = useRef<HTMLDivElement>(null);
  const p = useProgresso(alvo, 'preso');
  const telemovel = useMedia('(max-width: 767px)');

  // a luz do dia: a cor da pagina e do texto seguem a parte do dia
  // comeca na cal do fundo da pagina, passa pelo sol da tarde na cal e na
  // telha, e acaba no verde das portadas, que e a noite desta casa
  const fundo = useTransform(p, [0, 0.36, 0.52, 0.68, 0.8, 1], ['#ecebe4', '#ecebe4', '#eadfcb', '#e6d2ba', '#1b281f', '#1b281f']);
  const tinta = useTransform(p, [0, 0.72, 0.8, 1], ['#1d2220', '#1d2220', '#f7f4ec', '#f7f4ec']);
  const acento = useTransform(p, [0, 0.72, 0.8, 1], ['#533a2c', '#533a2c', '#c9a184', '#c9a184']);

  // silencio antes do pico: so o titulo
  const tituloOp = useTransform(p, [0, 0.015, 0.055], [1, 1, 0], { ease: easeInOut });
  const tituloY = useTransform(p, [0, 0.055], [0, -40], { ease: easeInOut });
  const palcoOp = useTransform(p, [0.02, 0.06], [0, 1], { ease: easeInOut });

  // sem horas: o sol so para no meio de cada parte do dia
  const sol = useTransform(p, [0.05, 0.12, 0.38, 0.46, 0.69, 0.77, 1], ['0%', '16%', '16%', '50%', '50%', '84%', '84%']);

  return (
    <motion.div ref={alvo} style={{ backgroundColor: fundo, color: tinta }} className="h-[300vh] md:h-[380vh]">
      {/* O palco (fotos e texto) mede svh e nao dvh: no telemovel a barra do
          browser esconde-se a meio do scroll e o dvh mudava de tamanho, a
          secao inteira dava um salto. A caixa de fora mede lvh, para a linha
          do dia poder descer ate ao fundo real do ecra quando a barra se
          esconde (ver a linha do dia). */}
      <div className="sticky top-0 h-lvh overflow-hidden">
        {/* o titulo, sozinho */}
        <motion.div
          style={{ opacity: tituloOp, y: tituloY }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-start px-6 pt-[24vh] text-center"
        >
          <motion.p style={{ color: acento }} className="versalete">
            {casa.fortes.etiqueta}
          </motion.p>
          <h2 className="mt-5 text-[3.2rem] md:text-[5rem]">
            <Titulo texto={casa.fortes.titulo} />
          </h2>
        </motion.div>

        {/* o palco do dia. No telemovel a linha de cima e a das fotos, com
            altura propria para cada tipo de ecra: as fotos tem de ficar
            afastadas do cabecalho e o texto tem de caber entre elas e a linha
            do dia (medido de 320x568 a 430x932) */}
        <motion.div
          style={{ opacity: palcoOp }}
          className="mx-auto grid h-svh max-w-[1320px] grid-rows-[minmax(0,41vh)_1fr] gap-6 px-6 pb-[4.5rem] pt-[7.5rem] max-lg:[@media(max-height:820px)]:grid-rows-[minmax(0,33vh)_1fr] max-lg:[@media(max-height:820px)]:gap-3 max-lg:[@media(max-height:820px)]:pt-[6.5rem] [@media(max-width:380px)_and_(min-height:821px)]:grid-rows-[minmax(0,38vh)_1fr] max-lg:[@media(max-height:600px)]:grid-rows-[minmax(0,28vh)_1fr]! md:px-10 lg:grid-cols-12 lg:grid-rows-1 lg:items-center lg:gap-10 lg:pb-24 lg:pt-28"
        >
          {/* a mesa onde as fotos caem */}
          <div className="relative h-full [container-type:size] lg:order-2 lg:col-span-7 lg:col-start-6 lg:h-[70vh]">
            {casa.fortes.partes.map((f, i) => (
              <div key={f.periodo}>
                {f.fotos.map((foto, n) => (
                  <Prova key={foto.src} p={p} parte={i} n={n} />
                ))}
              </div>
            ))}
          </div>
          <div className="relative h-full lg:order-1 lg:col-span-4 lg:h-[60vh]">
            {casa.fortes.partes.map((f, i) => (
              <Momento key={f.titulo} p={p} i={i} rapido={telemovel} />
            ))}
          </div>
        </motion.div>

        {/* a linha do dia. No telemovel fica a 12 px do fundo real do ecra
            (dvh): quando a barra do browser se esconde, so ela desce, e nao
            fica a flutuar a meio com espaco vazio por baixo. Mexe-se so a
            linha, o resto do palco fica parado. */}
        <motion.div style={{ opacity: palcoOp }} className="absolute inset-x-0 top-[calc(100dvh-2.5rem)] mx-auto max-w-[1320px] px-6 md:px-10 lg:top-auto lg:bottom-7">
          <div className="relative h-px w-full bg-current opacity-25" />
          {/* o sol anda por transform, nao por `left`: nao mexe no layout */}
          <motion.div aria-hidden style={{ x: sol }} className="absolute inset-x-6 top-0 h-0 md:inset-x-10">
            <motion.span
              style={{ backgroundColor: acento }}
              className="absolute left-0 top-0 block size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
            />
          </motion.div>
          {/* os nomes das partes do dia em italico Bodoni, como os titulos */}
          <div className="mt-2.5 flex justify-between font-display text-[1.05rem] italic leading-none opacity-70">
            <span>Manhã</span>
            <span>Tarde</span>
            <span>Noite</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
