'use client';

import Image from 'next/image';
import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform, type MotionValue } from 'motion/react';
import { useLenis } from 'lenis/react';
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { casa } from '@/lib/casa';
import { galerias } from '@/lib/galerias';
import { caixa, ecopista, limites, pontos, porKm, ribeiras, rios, rotulosRios } from '@/lib/mapa';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useProgresso } from '@/lib/useProgresso';
import { useMedia } from '@/lib/usaMedia';
import Titulo from '@/components/Titulo';

/*
  Ato 4b - A volta. Sentimento: situar-se. Pequena, entre a visita e as
  opinioes.

  Um mapa desenhado a tinta de madeira (o `ouro-escuro`), como uma carta
  antiga: so tracos finos, sem preenchimentos. Rios, ribeiras, os limites
  dos concelhos em pontilhado e a Ecopista a tracejado, tudo do
  OpenStreetMap (lib/mapa.ts). Um pino por sitio; o da casa e o unico
  cheio.

  O gesto: o mapa revela-se a partir da casa, num circulo que alarga com o
  scroll, como tinta a espalhar-se no papel. Os pinos aparecem quando o
  circulo lhes chega. Nao prende a pagina e nao ha mais nada a mexer.
  Com movimento reduzido o mapa aparece inteiro.

  Passar ou tocar num sitio (no mapa ou na lista) troca a fotografia
  pousada no canto do mapa, como as provas do "Um dia na casa".
*/

type Lugar = (typeof casa.aVolta.lugares)[number];
type Id = Lugar['id'];

const FOTO_MOVEL = 0.32;
const VIAGEM_MOVEL = 0.24;
const TOTAL_MOVEL = casa.aVolta.lugares.length * FOTO_MOVEL + (casa.aVolta.lugares.length - 1) * VIAGEM_MOVEL;
const inicioFoto = (i: number) => i * (FOTO_MOVEL + VIAGEM_MOVEL);
const inicioViagem = (i: number) => inicioFoto(i) + FOTO_MOVEL;
const suave = (v: number) => {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
};

function viagemEm(u: number) {
  for (let i = 0; i < casa.aVolta.lugares.length - 1; i++) {
    const t = (u - inicioViagem(i)) / VIAGEM_MOVEL;
    if (t >= 0 && t <= 1) return { i, t };
  }
  return null;
}

function cameraEm(p: number) {
  const u = Math.min(1, Math.max(0, p)) * TOTAL_MOVEL;
  const viagem = viagemEm(u);
  const i = viagem?.i ?? Math.min(casa.aVolta.lugares.length - 1, Math.floor(u / (FOTO_MOVEL + VIAGEM_MOVEL)));
  const de = pontos[casa.aVolta.lugares[i].id];
  const ate = viagem ? pontos[casa.aVolta.lugares[i + 1].id] : de;
  const caminho = viagem ? suave((viagem.t - 0.12) / 0.7) : 0;
  const focoX = (de.x + (ate.x - de.x) * caminho) / caixa.largura - 0.5;
  const focoY = (de.y + (ate.y - de.y) * caminho) / caixa.altura - 0.5;
  // A escala fica fixa: chega ao destino e permanece la, sem recuar.
  return { x: -focoX * 114, y: -focoY * 114 };
}

function useProgressoMovel(ref: RefObject<HTMLDivElement | null>, ligado: boolean) {
  const progresso = useMotionValue(0);
  useEffect(() => {
    const el = ref.current;
    const palco = el?.firstElementChild as HTMLElement | null;
    if (!ligado || !el || !palco) return;
    let inicio = 0;
    let curso = 1;
    const atualizar = () => progresso.set(Math.min(1, Math.max(0, (window.scrollY - inicio) / curso)));
    const medir = () => {
      inicio = el.getBoundingClientRect().top + window.scrollY;
      // svh fica estavel quando a barra do browser altera innerHeight.
      curso = Math.max(1, el.offsetHeight - palco.offsetHeight);
      atualizar();
    };
    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(el);
    observer.observe(palco);
    observer.observe(document.body);
    window.addEventListener('scroll', atualizar, { passive: true });
    window.addEventListener('resize', medir);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', atualizar);
      window.removeEventListener('resize', medir);
    };
  }, [ligado, progresso, ref]);
  return progresso;
}

// o raio que cobre o mapa todo, a partir da casa
const RAIO_MAX = Math.max(
  ...[
    [0, 0],
    [caixa.largura, 0],
    [0, caixa.altura],
    [caixa.largura, caixa.altura],
  ].map(([x, y]) => Math.hypot(x - pontos.casa.x, y - pontos.casa.y)),
);

// os sitios afastados tem sempre o nome; os do grupo junto a casa so
// quando estao escolhidos, senao os nomes tapavam-se uns aos outros
const SEMPRE_NOME: Id[] = ['macario', 'caramulo', 'viseu'];
// o nome fica a esquerda do pino (Viseu esta encostado a direita)
const NOME_A_ESQUERDA: Id[] = ['viseu', 'vouzela'];

// a cor da agua no mapa: o cinza-azulado da cantaria, mais verde
const AGUA = '#4d6f6c';
// o papel da seccao: a cal aquecida, um pouco mais de cor que o resto
const PAPEL = '#e8e0cc';
// o pino da casa: o vermelho da telha dos telhados, para se destacar de tudo
const TELHA = '#a63d2a';

const pct = (x: number, y: number) => ({ left: `${(x / caixa.largura) * 100}%`, top: `${(y / caixa.altura) * 100}%` });

// dois aneis de tinta que alargam a partir do ponto, quando o sitio muda
function Onda() {
  return (
    <span aria-hidden className="pointer-events-none absolute left-0 top-0">
      {[0, 0.35].map((atraso) => (
        <motion.span
          key={atraso}
          className="absolute -left-4 -top-4 block size-8 rounded-full border border-ouro-escuro"
          initial={{ scale: 0.2, opacity: 0.8 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 1.4, delay: atraso, ease: [0.22, 0.61, 0.36, 1] }}
        />
      ))}
    </span>
  );
}

function Pino({
  id,
  nome,
  ativo,
  raio,
  escolher,
  quieto = false,
}: {
  id: Exclude<Id, 'ecopista'>;
  nome: string;
  ativo: boolean;
  raio: MotionValue<number>;
  escolher: (id: Id) => void;
  quieto?: boolean;
}) {
  const { x, y } = pontos[id];
  const d = Math.hypot(x - pontos.casa.x, y - pontos.casa.y);
  // aparece quando o circulo de tinta lhe chega
  const op = useTransform(raio, (r) => Math.min(1, Math.max(0, (r - d) / 70)));
  const sobe = useTransform(op, [0, 1], [6, 0]);
  const esquerda = NOME_A_ESQUERDA.includes(id);
  const reduzido = useMovimentoReduzido();

  return (
    <motion.div style={{ ...pct(x, y), opacity: op, y: sobe }} className="absolute">
      <button
        type="button"
        onClick={() => escolher(id)}
        aria-label={nome}
        aria-pressed={ativo}
        className="absolute bottom-0 left-0 block -translate-x-1/2 p-1.5 outline-none"
      >
        {/* ao ficar escolhido o pino salta e assenta, como uma tacha espetada */}
        <motion.svg
          width="20"
          height="27"
          viewBox="0 0 14 19"
          aria-hidden
          className="block origin-bottom overflow-visible"
          animate={reduzido || quieto ? { y: 0, scale: 1 } : ativo ? { y: [0, -12, 0], scale: [1, 1.22, 1.18] } : { y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.45, 0, 0.2, 1], times: [0, 0.45, 1] }}
        >
          <path
            d="M7 18C7 18 1.2 11.4 1.2 7.1a5.8 5.8 0 0 1 11.6 0C12.8 11.4 7 18 7 18Z"
            className={`stroke-ouro-escuro transition-colors duration-500 ${ativo ? 'fill-ouro-escuro' : 'fill-[var(--papel)]'}`}
            strokeWidth="1.1"
          />
          <circle cx="7" cy="7" r="2" className={`transition-colors duration-500 ${ativo ? 'fill-[var(--papel)]' : 'fill-ouro-escuro'}`} />
        </motion.svg>
      </button>
      {ativo && !reduzido && !quieto && <Onda />}
      <span
        aria-hidden
        className={`pointer-events-none absolute -top-[30px] whitespace-nowrap font-display text-[clamp(0.62rem,2.8vw,0.92rem)] italic leading-none text-ouro-escuro transition-opacity duration-300 [text-shadow:0_0_4px_var(--papel),0_0_4px_var(--papel),0_0_2px_var(--papel)] md:text-[1.02rem] ${
          esquerda ? 'right-[16px]' : 'left-[16px]'
        } ${ativo || SEMPRE_NOME.includes(id) ? 'opacity-100' : 'opacity-0'}`}
      >
        {nome}
      </span>
    </motion.div>
  );
}

function Mapa({
  ativo,
  escolher,
  entrada,
  quieto = false,
  idPrefix,
  className = '',
}: {
  ativo: Id | 'casa';
  escolher: (id: Id) => void;
  // 0 quando a seccao entra por baixo, 1 quando chega ao topo do ecra
  entrada: MotionValue<number>;
  quieto?: boolean;
  idPrefix: string;
  className?: string;
}) {
  const parado = useMovimentoReduzido();
  const p = entrada;
  // depois de desenhado, fica desenhado: ao voltar a subir nao se apaga
  const maximo = useRef(0);
  const raio = useTransform(p, (v) => {
    if (parado) return RAIO_MAX;
    maximo.current = Math.max(maximo.current, Math.min(1, Math.max(0, (v - 0.15) / 0.75)) * RAIO_MAX);
    return maximo.current;
  });
  const lugares = casa.aVolta.lugares;
  const eco = ativo === 'ecopista';
  // a escala e o norte so aparecem quando o desenho chega ao fim
  const fim = useTransform(raio, [RAIO_MAX * 0.75, RAIO_MAX], [0, 1]);

  return (
    <div
      className={`relative mx-auto w-full ${className}`}
      style={{ aspectRatio: `${caixa.largura} / ${caixa.altura}` }}
    >
      {/* os tracos dissolvem-se nas bordas: sem moldura, como desenhado no papel */}
      <svg
        viewBox={`0 0 ${caixa.largura} ${caixa.altura}`}
        aria-hidden
        className="absolute inset-0 h-full w-full [transform:translateZ(0)]"
      >
        <defs>
          {/* o circulo de tinta: cheio por dentro, a esbater-se na borda */}
          <radialGradient id={`${idPrefix}-tinta`}>
            <stop offset="0.82" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id={`${idPrefix}-revelar`} maskUnits="userSpaceOnUse" x="0" y="0" width={caixa.largura} height={caixa.altura}>
            <motion.circle cx={pontos.casa.x} cy={pontos.casa.y} r={raio} fill={`url(#${idPrefix}-tinta)`} />
          </mask>
        </defs>
        <g mask={`url(#${idPrefix}-revelar)`} fill="none" className="stroke-ouro-escuro" strokeLinecap="round" strokeLinejoin="round">
          <path d={limites} strokeWidth="0.9" strokeDasharray="0.1 4" opacity="0.4" vectorEffect="non-scaling-stroke" />
          {/* a agua no verde-azulado do granito; o resto na tinta de madeira */}
          <path d={ribeiras} strokeWidth="0.6" opacity="0.4" stroke={AGUA} vectorEffect="non-scaling-stroke" />
          <path d={rios} strokeWidth="1.5" opacity="0.85" stroke={AGUA} vectorEffect="non-scaling-stroke" />
          <path
            d={ecopista}
            strokeDasharray="5 4"
            vectorEffect="non-scaling-stroke"
            className="transition-[opacity,stroke-width] duration-500"
            strokeWidth={eco ? 2 : 1.2}
            opacity={eco ? 0.95 : 0.6}
          />
          {Object.entries(rotulosRios).map(([nome, r]) => (
            <text
              key={nome}
              x={r.x}
              y={r.y}
              transform={`rotate(${r.angulo} ${r.x} ${r.y})`}
              textAnchor="middle"
              fill={AGUA}
              className="stroke-none font-display italic"
              fontSize="24"
              opacity="0.75"
            >
              {nome.replace('Rio ', 'rio ')}
            </text>
          ))}
        </g>
      </svg>

      {/* as bordas esbatem-se na cor do papel. Era uma mask-image no SVG, mas
          obrigava o browser a refazer o mapa inteiro sempre que um pino se
          mexia por cima (~80 ms por troca de sitio, medido): uma camada por
          cima da o mesmo efeito sem custo nenhum. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 62% 60% at 50% 50%, transparent 58%, var(--papel) 100%)' }}
      />

      {/* o nome da Ecopista, junto ao traco, quando esta escolhida */}
      <span
        aria-hidden
        style={pct(pontos.ecopista.x, pontos.ecopista.y)}
        className={`pointer-events-none absolute -translate-x-1/2 translate-y-[45%] whitespace-nowrap font-display text-[clamp(0.62rem,2.8vw,0.92rem)] italic leading-none text-ouro-escuro transition-opacity duration-300 [text-shadow:0_0_4px_var(--papel),0_0_4px_var(--papel)] md:text-[1.02rem] ${
          eco ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Ecopista do Vouga
      </span>
      {eco && !parado && !quieto && (
        <div style={pct(pontos.ecopista.x, pontos.ecopista.y)} className="absolute">
          <Onda />
        </div>
      )}

      {/* a casa: o unico pino cheio, sempre com nome */}
      <div style={pct(pontos.casa.x, pontos.casa.y)} className="absolute">
        <svg width="27" height="37" viewBox="0 0 14 19" aria-hidden className="absolute bottom-0 left-0 block -translate-x-1/2">
          <path d="M7 18C7 18 1.2 11.4 1.2 7.1a5.8 5.8 0 0 1 11.6 0C12.8 11.4 7 18 7 18Z" fill={TELHA} stroke={TELHA} strokeWidth="1" />
          <circle cx="7" cy="7" r="2.1" className="fill-[var(--papel)]" />
        </svg>
        <span style={{ color: TELHA }} className="versalete absolute left-[17px] top-[3px] whitespace-nowrap text-[clamp(0.54rem,2.5vw,0.72rem)] font-medium [text-shadow:0_0_4px_var(--papel),0_0_4px_var(--papel)] lg:text-[0.72rem]">
          A casa
        </span>
      </div>

      {lugares.map((l) =>
        l.id === 'ecopista' ? null : (
          <Pino key={l.id} id={l.id} nome={l.nome.replace('Termas de S. Pedro do Sul', 'Termas')} ativo={ativo === l.id} raio={raio} escolher={escolher} quieto={quieto} />
        ),
      )}

      {/* escala e norte, discretos, como numa carta */}
      <motion.div aria-hidden className="absolute bottom-[3%] right-[8%] text-right text-ouro-escuro/70" style={{ opacity: fim, width: `${((5 * porKm) / caixa.largura) * 100}%` }}>
        <div className="h-[5px] border-x border-b border-current" />
        <p className="versalete mt-1.5 text-[0.62rem]">5 km</p>
      </motion.div>
      <motion.div aria-hidden style={{ opacity: fim }} className="absolute right-[6%] top-[2%] flex flex-col items-center text-ouro-escuro/70">
        <span className="versalete text-[0.62rem]">N</span>
        <span className="mt-1 h-6 w-px bg-current" />
      </motion.div>
    </div>
  );
}

function Prova({ l }: { l: Lugar }) {
  const g = galerias.avolta.fotos;
  const lugares = casa.aVolta.lugares;
  return (
    // as provas ocupam todas a mesma celula da grelha: a caixa fica com a
    // altura da maior e nada salta
    <div className="grid">
      {lugares.map((x, i) => {
        const f = g.find((q) => q.src === x.foto) ?? g[0];
        const este = x.id === l.id;
        // cada prova assenta com uma inclinacao sua, para se ver que e outra
        const girar = [-1.5, 1.2, -0.8, 1.6, -1.2, 0.9][i] ?? -1;
        return (
          <motion.figure
            key={x.id}
            aria-hidden={!este}
            initial={false}
            animate={este ? { opacity: 1, y: 0, rotate: girar, scale: 1 } : { opacity: 0, y: 28, rotate: -girar, scale: 0.97 }}
            transition={este ? { duration: 0.7, ease: [0.22, 0.61, 0.36, 1] } : { duration: 0.4, ease: [0.55, 0, 0.75, 0.2] }}
            style={{ zIndex: este ? 2 : 1, pointerEvents: este ? 'auto' : 'none' }}
            // no telemovel a prova fica deitada (foto a esquerda): o mapa e ela
            // tem de caber os dois no ecra preso
            className="grid grid-cols-[52%_1fr] gap-3 bg-cartao p-2 shadow-[0_18px_40px_-18px_rgba(17,26,20,0.45)] [grid-area:1/1] lg:block lg:p-3 lg:pb-5"
          >
            <div className="relative aspect-[4/5] overflow-hidden lg:aspect-square [@media(max-height:820px)]:lg:aspect-[5/4]">
              <Image src={f.src} alt={este ? f.alt : ''} fill quality={85} sizes="(max-width: 1024px) 52vw, 480px" className="object-cover" />
            </div>
            <figcaption className="py-1 pr-1 lg:px-1.5 lg:pb-0 lg:pt-3.5">
              <p className="flex items-baseline justify-between gap-3">
                <span className="font-display text-[1.15rem] leading-tight text-tinta lg:text-[1.5rem]">{x.nome}</span>
                <span className="versalete shrink-0 text-ouro-escuro">{x.distancia}</span>
              </p>
              <p className="mt-1.5 text-[0.85rem] font-light leading-snug text-tinta-medio lg:text-[0.9rem] lg:leading-relaxed">{x.nota}</p>
              {f.credito && (
                <a
                  href={f.credito.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={este ? 0 : -1}
                  className="mt-2 block text-[0.7rem] text-tinta-medio/70 underline-offset-2 hover:underline"
                >
                  Foto: {f.credito.texto}
                </a>
              )}
            </figcaption>
          </motion.figure>
        );
      })}
    </div>
  );
}

function FotografiaMovel({ l, abertura = false, focavel = true }: { l: Lugar; abertura?: boolean; focavel?: boolean }) {
  const foto = galerias.avolta.fotos.find((f) => f.src === l.foto) ?? galerias.avolta.fotos[0];
  return (
    <figure className={abertura ? 'w-full max-w-[480px]' : 'grid w-full max-w-[480px] grid-cols-[42%_1fr] gap-3 bg-cartao p-2 shadow-[0_12px_28px_-15px_rgba(17,26,20,0.38)]'}>
      <div className={`relative overflow-hidden bg-cartao ${abertura ? 'aspect-[4/5] max-h-[62svh]' : 'aspect-[4/5]'}`}>
        <Image src={foto.src} alt={foto.alt} fill quality={75} sizes={abertura ? '(max-width: 767px) calc(100vw - 48px), 480px' : '(max-width: 767px) 42vw, 200px'} className="object-cover" />
      </div>
      <figcaption className={abertura ? 'pt-4' : 'min-w-0 self-center pr-1'}>
        <div className="flex items-baseline justify-between gap-2">
          <h3 className={`font-display leading-tight text-tinta ${abertura ? 'text-[1.6rem]' : 'text-[1.2rem]'}`}>{l.nome}</h3>
          <span className="versalete shrink-0 text-ouro-escuro">{l.distancia}</span>
        </div>
        <p className={`font-light leading-snug text-tinta-medio ${abertura ? 'mt-2 text-[0.95rem]' : 'mt-1.5 text-[0.78rem] sm:text-[0.88rem]'}`}>{l.nota}</p>
        {foto.credito && (
          <a href={foto.credito.href} target="_blank" rel="noopener noreferrer" tabIndex={focavel ? 0 : -1} className="mt-2 inline-block text-[0.66rem] leading-tight text-tinta-medio/75 underline-offset-2 hover:underline">
            Foto: {foto.credito.texto}
          </a>
        )}
      </figcaption>
    </figure>
  );
}

function CenaFotoMovel({ l, indice, progresso, acessivel }: { l: Lugar; indice: number; progresso: MotionValue<number>; acessivel: boolean }) {
  const foto = galerias.avolta.fotos.find((f) => f.src === l.foto) ?? galerias.avolta.fotos[0];
  const opacidade = useTransform(progresso, (p) => {
    const u = p * TOTAL_MOVEL;
    const inicio = inicioFoto(indice);
    const fim = inicio + FOTO_MOVEL;
    if (u < inicio) return suave((u - (inicio - VIAGEM_MOVEL * 0.24)) / (VIAGEM_MOVEL * 0.24));
    if (u <= fim || indice === casa.aVolta.lugares.length - 1) return 1;
    return 1 - suave((u - fim) / (VIAGEM_MOVEL * 0.2));
  });

  return (
    <motion.div data-testid={`avolta-photo-${indice}`} aria-hidden={!acessivel} inert={!acessivel} style={{ opacity: opacidade }} className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-5 pb-7 pt-24">
      <figure className={`w-full max-w-[540px] bg-cartao p-3 shadow-[0_18px_40px_-20px_rgba(17,26,20,0.35)] ${acessivel ? 'pointer-events-auto' : ''}`}>
        <div className="relative h-[min(58svh,calc(100svh-19rem))] min-h-[120px] w-full overflow-hidden bg-cartao">
          <Image src={foto.src} alt={foto.alt} fill quality={75} sizes="(max-width: 767px) calc(100vw - 48px), 540px" className="object-cover" />
        </div>
        <figcaption className="px-1 pb-1 pt-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-[1.6rem] leading-tight text-tinta sm:text-[1.85rem]">{l.nome}</h3>
            <span className="versalete shrink-0 text-ouro-escuro">{l.distancia}</span>
          </div>
          <p className="mt-2 font-light leading-snug text-tinta-medio">{l.nota}</p>
          {foto.credito && (
            <a href={foto.credito.href} target="_blank" rel="noopener noreferrer" tabIndex={acessivel ? 0 : -1} className="mt-2 inline-block text-[0.7rem] text-tinta-medio/75 underline-offset-2 hover:underline">Foto: {foto.credito.texto}</a>
          )}
        </figcaption>
      </figure>
    </motion.div>
  );
}

// Cada lugar ocupa o ecra. O mapa so entra na travessia entre duas fotos.
function AVoltaMovel({ cabeca }: { cabeca: React.ReactNode }) {
  const lugares = casa.aVolta.lugares;
  const [ativo, setAtivo] = useState<Id>(lugares[0].id);
  const [fotoIndex, setFotoIndex] = useState(0);
  const [cenaAcessivel, setCenaAcessivel] = useState<number | null>(0);
  const [mapaInterativo, setMapaInterativo] = useState(false);
  const pista = useRef<HTMLDivElement>(null);
  const estado = useRef({ ativo: lugares[0].id as Id, cena: 0 as number | null, mapa: false });
  const entrada = useMotionValue(1);
  const reduzido = useMovimentoReduzido();
  const largo = useMedia('(min-width: 1024px)');
  const cru = useProgressoMovel(pista, !reduzido && !largo);
  const progresso = useSpring(cru, { stiffness: 300, damping: 25, mass: 0.5 });
  const lenis = useLenis();
  const opacidadeMapa = useTransform(progresso, (p) => {
    const viagem = viagemEm(p * TOTAL_MOVEL);
    if (!viagem) return 0;
    return Math.min(suave(viagem.t / 0.2), suave((1 - viagem.t) / 0.24));
  });
  const camera = useTransform(progresso, cameraEm);
  const xMapa = useTransform(camera, (c) => `${c.x}%`);
  const yMapa = useTransform(camera, (c) => `${c.y}%`);

  useMotionValueEvent(progresso, 'change', (p) => {
    if (reduzido || largo) return;
    const u = Math.min(1, Math.max(0, p)) * TOTAL_MOVEL;
    const viagem = viagemEm(u);
    const i = viagem ? viagem.i : Math.min(lugares.length - 1, Math.floor(u / (FOTO_MOVEL + VIAGEM_MOVEL)));
    const novoAtivo = viagem && viagem.t >= 0.6 ? lugares[i + 1].id : lugares[i].id;
    const novaCena = viagem ? viagem.t < 0.2 ? i : viagem.t > 0.76 ? i + 1 : null : i;
    const novoMapa = Boolean(viagem && viagem.t >= 0.2 && viagem.t <= 0.76);
    if (estado.current.ativo !== novoAtivo) {
      estado.current.ativo = novoAtivo;
      setAtivo(novoAtivo);
    }
    if (estado.current.cena !== novaCena) {
      estado.current.cena = novaCena;
      setCenaAcessivel(novaCena);
    }
    if (estado.current.mapa !== novoMapa) {
      estado.current.mapa = novoMapa;
      setMapaInterativo(novoMapa);
    }
  });

  const escolher = (id: Id) => {
    const i = lugares.findIndex((l) => l.id === id);
    if (i < 0) return;
    if (reduzido) {
      setAtivo(id);
      setFotoIndex(i);
      return;
    }
    const el = pista.current;
    if (!el) return;
    const topo = el.getBoundingClientRect().top + window.scrollY;
    const curso = el.offsetHeight - (el.firstElementChild as HTMLElement).offsetHeight;
    const y = topo + curso * ((inicioFoto(i) + FOTO_MOVEL * 0.4) / TOTAL_MOVEL);
    if (lenis) lenis.scrollTo(y, { duration: 0.65 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  if (reduzido) {
    return (
      <div className="mx-auto max-w-[760px] px-6 pb-20 pt-20 lg:hidden">
        {cabeca}
        <div className="mx-auto mt-8 max-w-[390px]">
          <Mapa ativo={ativo} escolher={escolher} entrada={entrada} idPrefix="avolta-movel" />
          <p className="mt-1 text-center text-[0.66rem] text-tinta-medio/60">Dados © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">OpenStreetMap</a></p>
        </div>
        <div className="mx-auto mt-5 max-w-[480px]"><FotografiaMovel l={lugares[fotoIndex]} /></div>
      </div>
    );
  }

  return (
    <div className="lg:hidden">
      <div className="mx-auto max-w-[760px] px-6 pt-20 md:px-10">{cabeca}</div>
      <div ref={pista} data-testid="avolta-timeline" className="relative mt-8" style={{ height: `calc(100svh + ${TOTAL_MOVEL * 100}svh)` }}>
        <div className="sticky top-0 h-svh overflow-hidden">
          {lugares.map((l, i) => <CenaFotoMovel key={l.id} l={l} indice={i} progresso={progresso} acessivel={cenaAcessivel === i} />)}
          <motion.div data-testid="avolta-map-stage" aria-hidden={!mapaInterativo} inert={!mapaInterativo} style={{ opacity: opacidadeMapa }} className="absolute inset-0 flex items-center justify-center px-4 pb-7 pt-24">
            <div className="w-[min(calc(100vw-2rem),calc((100svh-8rem)*0.758),540px)]">
              <motion.div data-testid="avolta-map-camera" style={{ scale: 1.14, x: xMapa, y: yMapa }} className="origin-center">
                <Mapa ativo={ativo} escolher={escolher} entrada={entrada} quieto idPrefix="avolta-movel" />
              </motion.div>
              <p className="mt-2 text-center text-[0.66rem] text-tinta-medio/60">Dados © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">OpenStreetMap</a></p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Quanto scroll cada lugar dura no percurso de escritorio.
const POR_SITIO = 60; // svh

export default function AVolta() {
  const v = casa.aVolta;
  const parado = useMovimentoReduzido();
  const [ativo, setAtivo] = useState<Id>(v.lugares[0].id);
  const lugar = v.lugares.find((l) => l.id === ativo) ?? v.lugares[0];
  const n = v.lugares.length;
  const largo = useMedia('(min-width: 1024px)');

  /*
    O ecra prende-se e o scroll percorre os sitios, um a um, pela ordem da
    lista (pedido do Diogo, 2026-10-01). O mapa desenha-se enquanto a seccao
    entra; depois de presa, cada fatia de scroll e um sitio. Passar o rato
    ou tocar num sitio continua a escolhe-lo; clicar na lista leva o scroll
    ate ele, para o scroll e a escolha nao se contradizerem.
  */
  const pista = useRef<HTMLDivElement>(null);
  const entrada = useProgresso(pista, 'entrada');
  const preso = useProgresso(pista, 'preso');
  const lenis = useLenis();
  const ultimo = useRef(-1);
  useMotionValueEvent(preso, 'change', (p) => {
    if (parado || !largo) return;
    const i = Math.min(n - 1, Math.floor(p * n));
    if (i !== ultimo.current) {
      ultimo.current = i;
      setAtivo(v.lugares[i].id);
    }
  });

  const irPara = (id: Id) => {
    setAtivo(id);
    const el = pista.current;
    if (parado || !el) return;
    const i = v.lugares.findIndex((l) => l.id === id);
    const topo = el.getBoundingClientRect().top + window.scrollY;
    const curso = el.offsetHeight - window.innerHeight;
    const y = topo + ((i + 0.5) / n) * curso;
    ultimo.current = i;
    if (lenis) lenis.scrollTo(y, { duration: 1 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const cabeca = (
    <>
      <p className="versalete text-ouro-escuro">{v.etiqueta}</p>
      <h2 className="mt-4 text-[2.5rem] text-tinta md:text-[3rem] [@media(max-height:820px)]:lg:text-[2.6rem]">
        <Titulo texto={v.titulo} />
      </h2>
      <p className="mt-4 max-w-[44ch] font-light leading-[1.75] text-tinta-medio [@media(max-height:760px)]:lg:hidden">{v.texto}</p>
    </>
  );

  return (
    <section id="a-volta" style={{ background: PAPEL, ['--papel' as string]: PAPEL }}>
      <AVoltaMovel cabeca={cabeca} />

      <div ref={pista} className="relative hidden lg:block" style={{ height: parado ? undefined : `calc(100svh + ${n * POR_SITIO}svh)` }}>
        <div className={parado ? '' : 'sticky top-0 h-svh overflow-hidden'}>
          <div className="mx-auto flex h-full max-w-[1320px] flex-col justify-center gap-4 px-6 pb-6 pt-[5.5rem] md:px-10 lg:grid lg:grid-cols-[30fr_37fr_33fr] lg:items-center lg:gap-10 lg:pb-8 lg:pt-24">
            {/* computador: o titulo e a lista, a esquerda */}
            <div className="hidden lg:block">
              {cabeca}
              <div className="mt-7 [@media(max-height:820px)]:mt-5">
                <Lista ativo={ativo} ir={irPara} />
              </div>
            </div>

            <div className="min-h-0">
              <Mapa
                ativo={ativo}
                escolher={irPara}
                entrada={entrada}
                idPrefix="avolta-desktop"
                className="max-w-[calc((100svh-26rem)*0.758)] lg:max-w-[calc(min(100svh-9rem,860px)*0.758)]"
              />
              {/* obrigatorio pela licenca dos dados (ODbL) */}
              <p className="mt-1 text-center text-[0.66rem] text-tinta-medio/60">
                Dados ©{' '}
                <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">
                  OpenStreetMap
                </a>
              </p>
            </div>

            {/* a fotografia do sitio, maior, a entrar um pouco no mapa (na
                borda, onde o desenho ja se esbateu) */}
            <div className="lg:-ml-12">
              <Prova l={lugar} />
              {/* no telemovel nao ha lista no ecra preso: so os pontos, para
                  se saber quantos faltam */}
              <div className="mt-3 flex justify-center gap-2 lg:hidden" aria-hidden>
                {v.lugares.map((l) => (
                  <span key={l.id} className={`size-1.5 rounded-full transition-colors ${l.id === ativo ? 'bg-ouro-escuro' : 'bg-ouro-escuro/25'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden pb-16 lg:block" />
    </section>
  );
}

function Lista({ ativo, ir }: { ativo: Id; ir: (id: Id) => void }) {
  const v = casa.aVolta;
  const lista = useRef<HTMLUListElement>(null);
  const i = v.lugares.findIndex((l) => l.id === ativo);

  /*
    A linha escolhida: uma so barra (fundo de madeira, traco grosso a
    esquerda, filetes em cima e em baixo) que fica parada na linha do sitio
    enquanto ele estiver escolhido e, quando o sitio muda, desliza devagar
    ate a linha seguinte. Mede-se a linha de verdade, para acertar mesmo que
    um nome parta em duas.
  */
  const [barra, setBarra] = useState({ y: 0, h: 0 });
  useLayoutEffect(() => {
    const ul = lista.current;
    if (!ul) return;
    const medir = () => {
      const li = ul.children[i] as HTMLElement | undefined;
      if (li) setBarra({ y: li.offsetTop, h: li.offsetHeight });
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(ul);
    return () => ro.disconnect();
  }, [i]);

  return (
    <>
      <div className="relative">
        {barra.h > 0 && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -left-3 -right-3 top-0 border-y border-l-[3px] border-y-ouro-escuro/45 border-l-ouro-escuro bg-ouro-escuro/[0.11]"
            initial={false}
            style={{ height: barra.h }}
            animate={{ y: barra.y }}
            transition={{ duration: 0.6, ease: [0.45, 0, 0.2, 1] }}
          />
        )}
        <ul ref={lista} className="border-b border-linha">
          {v.lugares.map((l) => {
            const este = ativo === l.id;
            return (
              <li key={l.id} className="relative border-t border-linha">
                <button
                  type="button"
                  onClick={() => ir(l.id)}
                  aria-pressed={este}
                  className="relative flex w-full items-baseline justify-between gap-4 py-3.5 text-left outline-none focus-visible:underline focus-visible:decoration-ouro-escuro/50 focus-visible:underline-offset-4"
                >
                  {/* so cor e posicao, que transitam devagar: o italico
                      trocava de uma vez e parecia piscar */}
                  <span
                    className={`font-display text-[1.25rem] leading-tight transition-[color,transform] duration-500 ease-in-out md:text-[1.35rem] ${
                      este ? 'translate-x-2 text-ouro-escuro' : 'text-tinta'
                    }`}
                  >
                    {l.nome}
                  </span>
                  <span className={`versalete shrink-0 transition-colors duration-500 ${este ? 'text-ouro-escuro' : 'text-tinta-medio'}`}>
                    {l.distancia}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
