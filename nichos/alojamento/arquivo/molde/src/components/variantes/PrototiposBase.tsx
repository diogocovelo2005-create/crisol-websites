'use client';

import Image from 'next/image';
import { AnimatePresence, motion, useTransform } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, BedIcon, CoffeeIcon, MapPinIcon, PawPrintIcon, PathIcon } from '@phosphor-icons/react';
import { casa } from '@/lib/casa';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useProgresso } from '@/lib/useProgresso';
import AcoesReserva from '@/components/AcoesReserva';
import Titulo from '@/components/Titulo';

const imagens = { hero: casa.hero.imagem, casa: casa.atmosfera.imagem, detalhe: casa.atmosfera.imagemPequena ?? casa.atmosfera.imagem, quarto: casa.visita.espacos[0].imagem, fecho: casa.fecho.imagem };

function Reserva({ claro = false }: { claro?: boolean }) {
  return <span className={`inline-flex items-center gap-3 border px-5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.18em] ${claro ? 'border-white/45 text-white' : 'border-current'}`}>Ver disponibilidade <ArrowRightIcon size={15} /></span>;
}

export function HeroH1() {
  return <section className="relative min-h-[78vh] overflow-hidden bg-noite text-osso"><Image src={imagens.hero} alt={casa.hero.alt} fill sizes="100vw" className="object-cover opacity-75" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,16,11,.75),rgba(12,16,11,.08)_65%)]" /><div className="relative mx-auto flex min-h-[78vh] max-w-[1320px] flex-col justify-end px-6 pb-16 md:px-12 md:pb-20"><p className="versalete text-osso/70">{casa.hero.etiqueta}</p><h2 className="mt-5 max-w-[12ch] text-[3.4rem] leading-[.95] md:text-[5.8rem]"><Titulo texto={casa.hero.titulo} /></h2><div className="mt-8 flex flex-col items-start justify-between gap-7 md:flex-row md:items-end"><p className="max-w-[45ch] font-light leading-relaxed text-osso/85">{casa.hero.texto}</p><Reserva claro /></div></div></section>;
}

/** A gramática da Lumière aplicada ao alojamento: o nome nasce como imagem e assenta na barra. */
export function HeroH2() {
  const alvo = useRef<HTMLElement>(null);
  const nome = useRef<HTMLParagraphElement>(null);
  const parado = useMovimentoReduzido();
  const scrollYProgress = useProgresso(alvo, 'preso');
  const [destino, setDestino] = useState({ escala: 0.16, y: -46 });

  useLayoutEffect(() => {
    const medir = () => {
      if (!nome.current) return;
      const tamanhoInicial = Number.parseFloat(window.getComputedStyle(nome.current).fontSize);
      setDestino({
        escala: Math.min(1, 21.6 / tamanhoInicial),
        y: 16.8 - window.innerHeight * 0.07,
      });
    };
    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, []);

  const escala = useTransform(scrollYProgress, [0, 0.08, 0.92], [1, 1, destino.escala]);
  const nomeY = useTransform(scrollYProgress, [0, 0.08, 0.92], [0, 0, destino.y]);
  const copia = useTransform(scrollYProgress, [0.42, 0.88], [1, 0]);
  const copiaY = useTransform(scrollYProgress, [0.08, 0.88], [0, -54]);
  return (
    <section ref={alvo} className={parado ? 'relative h-[82vh] min-h-[620px]' : 'relative h-[150vh]'}>
      <div className="sticky top-0 h-[82vh] min-h-[620px] overflow-hidden bg-noite text-osso">
        <Image src={imagens.hero} alt={casa.hero.alt} fill priority sizes="100vw" className="object-cover opacity-75" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,14,10,.42),rgba(10,14,10,.12)_38%,rgba(10,14,10,.68))]" />
        <div className="absolute inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-white/25 px-6 md:px-10">
          <span className="versalete text-[.58rem] text-white/70">A casa</span>
          <span className="versalete text-[.58rem] text-white/70">Reservar</span>
        </div>
        <motion.p
          data-hero-name
          ref={nome}
          style={parado ? undefined : { scale: escala, y: nomeY }}
          className="absolute left-1/2 top-[7vh] z-30 -translate-x-1/2 whitespace-nowrap font-display text-[clamp(3.2rem,11vw,10rem)] font-medium leading-none tracking-[-.055em] [transform-origin:50%_0%]"
        >
          {casa.nome}
        </motion.p>
        <motion.div data-hero-copy style={parado ? undefined : { opacity: copia, y: copiaY }} className="absolute inset-0 z-10 flex items-center justify-center px-6 pt-[32vh] text-center">
          <div className="flex max-w-[760px] flex-col items-center">
            <p className="versalete text-white/65">{casa.hero.etiqueta}</p>
            <h2 className="mt-5 max-w-[11ch] text-[3rem] leading-[.98] md:text-[5rem]"><Titulo texto={casa.hero.titulo} /></h2>
            <p className="mt-6 max-w-[44ch] font-light leading-relaxed text-white/85">{casa.hero.texto}</p>
            <div className="mt-7"><Reserva claro /></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/** Um único plano fotográfico começa enquadrado e cresce com o scroll. */
export function HeroH3() {
  const alvo = useRef<HTMLElement>(null);
  const parado = useMovimentoReduzido();
  const scrollYProgress = useProgresso(alvo, 'preso');
  const recorte = useTransform(scrollYProgress, [0, 0.58], ['inset(9% 7% round 22px)', 'inset(0% 0% round 0px)']);
  const legenda = useTransform(scrollYProgress, [0, 0.48], [1, 0.78]);
  return <section ref={alvo} className={parado ? 'relative h-screen min-h-[620px]' : 'relative h-[220vh] bg-linho'}><div className="sticky top-0 h-screen min-h-[620px] overflow-hidden bg-linho text-osso"><motion.div data-hero-expand style={parado ? undefined : { clipPath: recorte }} className="absolute inset-0 overflow-hidden bg-noite"><div className="absolute inset-0"><Image src={imagens.hero} alt={casa.hero.alt} fill sizes="100vw" className="object-cover opacity-80" /><div className="absolute inset-0 bg-noite/30" /></div><motion.div style={parado ? undefined : { opacity: legenda }} className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"><p className="versalete text-osso/70">{casa.hero.etiqueta}</p><h2 className="mt-6 max-w-[12ch] text-[3.2rem] leading-[.96] md:text-[6rem]"><Titulo texto={casa.hero.titulo} /></h2><p className="mt-6 max-w-[42ch] font-light leading-relaxed text-osso/80">{casa.hero.texto}</p><div className="mt-8"><Reserva claro /></div></motion.div></motion.div></div></section>;
}

/** Uma fotografia, dividida apenas durante a abertura, revela a secção seguinte. */
export function HeroH4() {
  const alvo = useRef<HTMLElement>(null);
  const parado = useMovimentoReduzido();
  const scrollYProgress = useProgresso(alvo, 'preso');
  const xEsquerda = useTransform(scrollYProgress, [0.16, 0.94], ['0%', '-101%']);
  const xDireita = useTransform(scrollYProgress, [0.16, 0.94], ['0%', '101%']);
  const texto = useTransform(scrollYProgress, [0.16, 0.52], [1, 0]);
  const textoY = useTransform(scrollYProgress, [0.16, 0.52], [0, -180]);
  const revela = useTransform(scrollYProgress, [0.86, 0.97], [0, 1]);
  const cobertura = useTransform(scrollYProgress, [0.82, 0.95], [0, 1]);
  return <section ref={alvo} className={parado ? 'relative min-h-[82vh]' : 'relative h-[300vh]'}><div className="sticky top-0 h-[82vh] min-h-[620px] overflow-hidden bg-linho"><motion.div style={parado ? undefined : { x: xEsquerda }} className="absolute inset-0 [clip-path:inset(0_50%_0_0)]"><Image src={imagens.hero} alt={casa.hero.alt} fill sizes="100vw" className="object-cover opacity-80" /><div className="absolute inset-0 bg-noite/25" /></motion.div><motion.div aria-hidden style={parado ? undefined : { x: xDireita }} className="absolute inset-0 [clip-path:inset(0_0_0_50%)]"><Image src={imagens.hero} alt="" fill sizes="100vw" className="object-cover opacity-80" /><div className="absolute inset-0 bg-noite/25" /></motion.div><motion.div style={parado ? undefined : { opacity: texto, y: textoY }} className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-osso"><p className="versalete text-osso/70">{casa.hero.etiqueta}</p><h2 className="mt-6 max-w-[12ch] text-[3.3rem] leading-[.96] md:text-[5.8rem]"><Titulo texto={casa.hero.titulo} /></h2><p className="mt-6 max-w-[42ch] font-light leading-relaxed text-osso/85">{casa.hero.texto}</p><div className="mt-8"><Reserva claro /></div></motion.div><motion.div aria-hidden style={parado ? undefined : { opacity: cobertura }} className="absolute inset-0 z-20 bg-linho" /><motion.div style={parado ? undefined : { opacity: revela }} className="absolute inset-0 z-30 flex items-center justify-center px-6 text-center text-tinta"><div><p className="versalete text-ouro-escuro">A seguir</p><h3 className="mt-5 max-w-[12ch] text-[3rem] leading-none md:text-[5rem]">Conhecer a casa, <em>por dentro.</em></h3><p className="mx-auto mt-6 max-w-[42ch] font-light leading-relaxed text-tinta-medio">A abertura entrega naturalmente a narrativa à secção seguinte.</p></div></motion.div></div></section>;
}

const factos = [
  { n: '01', Icone: BedIcon, titulo: 'Três quartos', texto: 'Até seis pessoas, todos com vista para o vale.' },
  { n: '02', Icone: CoffeeIcon, titulo: 'Pequeno-almoço', texto: 'Feito em casa e servido sem pressa.' },
  { n: '03', Icone: PawPrintIcon, titulo: 'Animais', texto: 'Bem-vindos, com pátio murado.' },
  { n: '04', Icone: PathIcon, titulo: 'Trilhos', texto: 'Os passadiços ficam a vinte minutos.' },
];

export function PilaresPI1() {
  return <section className="bg-linho px-6 py-20 md:px-12"><div className="mx-auto grid max-w-[1220px] grid-cols-2 gap-y-12 lg:grid-cols-4 lg:divide-x lg:divide-linha">{factos.map(({ Icone, titulo, texto }) => <div key={titulo} className="px-4 text-center md:px-8"><Icone size={32} weight="thin" className="mx-auto text-ouro-escuro" /><h3 className="mt-5 text-2xl">{titulo}</h3><p className="mx-auto mt-2 max-w-[24ch] text-sm font-light leading-relaxed text-tinta-medio">{texto}</p></div>)}</div></section>;
}

export function PilaresPI3() {
  return <section className="bg-[#d8c4a8] px-6 py-11 md:px-12"><div className="mx-auto grid max-w-[1160px] gap-3 md:grid-cols-5">{factos.map((f) => <div key={f.n} className="min-h-[164px] rounded-[15px] bg-[#f5efe5] p-5"><div className="flex items-start justify-between"><f.Icone size={24} weight="thin" /><span className="text-xs text-tinta/40">{f.n}</span></div><h3 className="mt-7 text-[1.55rem]">{f.titulo}</h3><p className="mt-2 text-xs font-light leading-relaxed text-tinta-medio">{f.texto}</p></div>)}<div className="flex min-h-[164px] flex-col justify-between rounded-[15px] bg-[#8b4d32] p-5 text-osso"><MapPinIcon size={24} weight="thin" /><p className="font-display text-[1.55rem]">Tudo a partir da casa.</p></div></div></section>;
}

export function AtmosferaA1() {
  return <section className="grid min-h-[72vh] items-center gap-12 bg-linho px-6 py-20 md:px-12 lg:grid-cols-2"><div className="mx-auto max-w-[540px]"><p className="versalete text-ouro-escuro">{casa.atmosfera.etiqueta}</p><h2 className="mt-5 text-[2.8rem] md:text-[4.4rem]"><Titulo texto={casa.atmosfera.titulo} /></h2><div className="mt-7 max-w-[50ch] space-y-5 font-light leading-[1.8] text-tinta-medio"><p>{casa.atmosfera.texto}</p><p>A casa, a recuperação e a região devem formar uma só história: quem a guardou, o que foi preservado e o que se encontra quando se sai da porta.</p><p className="border-l border-ouro pl-5 text-sm">Os Passadiços do Paiva ficam a vinte minutos; o vale e os seus caminhos prolongam a estadia para lá dos quartos.</p></div></div><div className="relative mx-auto h-[520px] w-full max-w-[560px]"><div className="absolute inset-y-0 left-0 w-[78%] overflow-hidden rounded-[10px]"><Image src={imagens.casa} alt={casa.atmosfera.alt} fill sizes="50vw" className="object-cover" /></div>{casa.atmosfera.imagemPequena && <div className="absolute bottom-0 right-0 h-[54%] w-[42%] overflow-hidden rounded-[10px] border-[6px] border-linho"><Image src={imagens.detalhe} alt={casa.atmosfera.altPequena ?? casa.atmosfera.alt} fill sizes="25vw" className="object-cover" /></div>}</div></section>;
}

export function AtmosferaA3() {
  const marcos = [{ ano: '1948', texto: 'A casa passa para a família.', foto: imagens.detalhe }, { ano: '2019', texto: 'Começa a recuperação.', foto: imagens.casa }, { ano: 'Hoje', texto: 'Abre a porta a poucas pessoas de cada vez.', foto: imagens.quarto }];
  return <section className="bg-[#efe7da] px-6 py-20 md:px-12"><div className="mx-auto max-w-[1180px]"><div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]"><div className="lg:sticky lg:top-20 lg:self-start"><p className="versalete text-ouro-escuro">Arquivo da casa</p><h2 className="mt-5 max-w-[10ch] text-[3rem] md:text-[4.5rem]">Quatro anos, <em>pedra a pedra.</em></h2><p className="mt-7 max-w-[40ch] font-light leading-[1.8] text-tinta-medio">{casa.atmosfera.texto}</p></div><div className="space-y-5">{marcos.map((x) => <article key={x.ano} className="grid gap-4 border-t border-tinta/20 pt-5 sm:grid-cols-[6rem_1fr_11rem] sm:items-center"><span className="font-display text-2xl text-ouro-escuro">{x.ano}</span><p className="font-display text-2xl">{x.texto}</p><div className="relative aspect-[4/3] overflow-hidden"><Image src={x.foto} alt="Pormenor da história da casa" fill sizes="180px" className="object-cover" /></div></article>)}</div></div></div></section>;
}

export function OpinioesO1() {
  const reviews = casa.reviews;
  const citacoes = reviews?.citacoes ?? [];
  const c = citacoes[0];
  if (!c) return null;
  return <section className="bg-linho px-6 py-24 text-center md:px-12"><p className="versalete text-ouro-escuro">{reviews?.etiqueta}</p>{reviews?.avaliacao && <p className="mt-5 text-sm text-tinta-medio">{reviews.avaliacao.media.toLocaleString('pt-PT')} / {reviews.avaliacao.escala} · {reviews.avaliacao.plataforma} · {reviews.avaliacao.total} avaliações · {reviews.avaliacao.data}</p>}<blockquote className="mx-auto mt-9 max-w-[27ch] font-display text-[2rem] italic leading-snug md:text-[3rem]">“{c.texto}”</blockquote><p className="versalete mt-8 text-tinta-medio">{c.quem} / {c.onde}</p><div className="mt-10 flex justify-center gap-2">{citacoes.map((x, i) => <span key={x.quem} className={`size-2 rounded-full ${i === 0 ? 'bg-ouro' : 'border border-ouro'}`} />)}</div></section>;
}

export function OpinioesO3() {
  const [ativo, setAtivo] = useState(0);
  const parado = useMovimentoReduzido();
  const citacoes = casa.reviews?.citacoes ?? [];
  useEffect(() => {
    if (parado || citacoes.length < 2) return;
    const id = window.setInterval(() => setAtivo((i) => (i + 1) % citacoes.length), 4000);
    return () => window.clearInterval(id);
  }, [citacoes.length, parado]);
  const c = citacoes[ativo];
  const mudar = (passo: number) => setAtivo((i) => (i + passo + citacoes.length) % citacoes.length);
  if (!c) return null;
  return (
    <section className="relative min-h-[78vh] overflow-hidden bg-noite text-osso">
      <Image src={imagens.fecho} alt={casa.fecho.alt} fill sizes="100vw" className="object-cover opacity-65" />
      <div className="absolute inset-0 bg-noite/25" />
      <div className="relative mx-auto flex min-h-[78vh] max-w-[1240px] items-end px-6 py-8 md:px-12 md:py-12">
        <div className="grid w-full overflow-hidden rounded-[12px] bg-linho text-tinta shadow-2xl md:grid-cols-[1.2fr_.8fr]">
          <div className="p-7 md:p-12">
            <div className="flex items-center justify-between"><p className="versalete text-ouro-escuro">A última palavra é de quem ficou</p><span className="text-xs tabular-nums text-tinta-medio">{String(ativo + 1).padStart(2, '0')} / {String(citacoes.length).padStart(2, '0')}</span></div>
            <div className="relative mt-8 min-h-[12rem] md:min-h-[10rem]"><AnimatePresence mode="wait" initial={false}><motion.div key={c.quem} initial={parado ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={parado ? undefined : { opacity: 0, x: -20 }} transition={{ duration: .35 }}><blockquote className="font-display text-[2rem] italic leading-snug md:text-[2.65rem]">“{c.texto}”</blockquote><p className="versalete mt-6 text-tinta-medio">{c.quem} / {c.onde}</p></motion.div></AnimatePresence></div>
            <div className="mt-6 flex gap-2"><button type="button" onClick={() => mudar(-1)} aria-label="Opinião anterior" className="grid size-11 place-items-center border border-tinta/25"><ArrowLeftIcon size={17} /></button><button type="button" onClick={() => mudar(1)} aria-label="Opinião seguinte" className="grid size-11 place-items-center border border-tinta/25"><ArrowRightIcon size={17} /></button></div>
          </div>
          <div className="flex flex-col justify-between bg-floresta p-7 text-osso md:p-12">
            <p className="versalete text-osso/65">Reservas diretas</p>
            <div className="py-10 md:py-14">
              <h3 className="text-4xl">A casa fica <em>à vossa espera.</em></h3>
              <div className="mt-8"><AcoesReserva claro /></div>
              <div className="mt-7 border-t border-osso/20 pt-5 text-sm text-osso/75">
                {casa.contacto.telefone && <a href={casa.contacto.telefone.href} className="block py-1.5 hover:text-osso">{casa.contacto.telefone.valor}</a>}
                {casa.contacto.email && <a href={casa.contacto.email.href} className="block py-1.5 hover:text-osso">{casa.contacto.email.valor}</a>}
                {casa.contacto.whatsapp && <a href={casa.contacto.whatsapp.href} className="block py-1.5 hover:text-osso">WhatsApp · {casa.contacto.whatsapp.valor}</a>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
