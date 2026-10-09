'use client';

import Image from 'next/image';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { motion, useTransform } from 'motion/react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { proposta } from '@/lib/proposta';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { useProgresso } from '@/lib/useProgresso';

const foto = (nome: string) => `/fotos/${nome}`;

function Ligacao({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  const externo = href.startsWith('http');
  return (
    <a className={className} href={href} target={externo ? '_blank' : undefined} rel={externo ? 'noreferrer' : undefined}>
      <span>{children}</span>
      <ArrowUpRightIcon aria-hidden weight="regular" />
    </a>
  );
}

function Cabecalho() {
  const [ativo, setAtivo] = useState('chegada');

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visiveis = entradas.filter((entrada) => entrada.isIntersecting);
        const atual = visiveis.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (atual?.target.id) setAtivo(atual.target.id);
      },
      { rootMargin: '-25% 0px -60%', threshold: [0, 0.25, 0.6] },
    );
    proposta.capitulos.forEach(({ id }) => {
      const alvo = document.getElementById(id);
      if (alvo) observador.observe(alvo);
    });
    return () => observador.disconnect();
  }, []);

  return (
    <header className="cabecalho">
      <a className="marca" href="#chegada" aria-label="Casa da Calçada, voltar ao início">
        <strong>Casa da Calçada</strong>
        <span>Oliveira do Douro</span>
      </a>
      <nav className="indice" aria-label="Percurso pela página">
        {proposta.capitulos.slice(0, -1).map((capitulo) => (
          <a key={capitulo.id} href={`#${capitulo.id}`} aria-current={ativo === capitulo.id ? 'location' : undefined}>
            {capitulo.nome}
          </a>
        ))}
      </nav>
      <Ligacao className="acao acao-cabecalho" href={proposta.contacto}>
        Consultar disponibilidade
      </Ligacao>
    </header>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const progresso = useProgresso(ref, 'passagem');
  const reduzido = useMovimentoReduzido();
  const yArco = useTransform(progresso, [0, 1], reduzido ? ['0%', '0%'] : ['0%', '-9%']);
  const yFaixa = useTransform(progresso, [0, 1], reduzido ? ['0%', '0%'] : ['0%', '13%']);

  return (
    <section className="hero" id="chegada" ref={ref} aria-labelledby="titulo-principal">
      <div className="hero-texto">
        <p className="sobretitulo">Turismo de Habitação · Cinfães</p>
        <h1 id="titulo-principal">Uma casa que não se vê de uma vez.</h1>
        <p className="hero-intro">No alto do Douro, uma casa do século XVIII guarda a sua capela entre pátios, pedra e jardins.</p>
        <Ligacao className="acao acao-principal" href={proposta.contacto}>
          Consultar disponibilidade
        </Ligacao>
      </div>
      <div className="hero-cena">
        <motion.figure className="hero-faixa" style={{ y: yFaixa }}>
          <Image src={foto('proposta-aerea.webp')} alt="A quinta entre os campos de Oliveira do Douro" fill priority sizes="70vw" />
        </motion.figure>
        <motion.figure className="hero-arco" style={{ y: yArco }}>
          <Image src={foto('proposta-piscina.webp')} alt="Piscina diante da torre da Casa da Calçada" fill priority sizes="(max-width: 760px) 82vw, 48vw" />
        </motion.figure>
        <p className="hero-legenda">Uma casa, uma capela e o Douro em redor.</p>
      </div>
    </section>
  );
}

function Quinta() {
  return (
    <section className="quinta secao" id="quinta" aria-labelledby="titulo-quinta">
      <div className="quinta-cabeca">
        <h2 id="titulo-quinta">Não é apenas uma casa no Douro. É uma pequena quinta com vida própria.</h2>
        <p>A casa senhorial, a capela, a torre, o tanque e os jardins em socalcos formam um conjunto que se descobre a caminhar.</p>
      </div>
      <motion.figure className="quinta-aerea" initial={{ clipPath: 'inset(0 18% 0 18%)' }} whileInView={{ clipPath: 'inset(0 0% 0 0%)' }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}>
        <Image src={foto('proposta-aerea.webp')} alt="Vista aérea da Casa da Calçada e da paisagem envolvente" width={1920} height={760} sizes="100vw" />
      </motion.figure>
      <dl className="factos">
        <div><dt>Quartos</dt><dd>10</dd><p>Oito na casa principal e dois num anexo de pedra junto à piscina.</p></div>
        <div><dt>Camas</dt><dd>20</dd><p>Uma casa preparada para receber, sem perder a escala doméstica.</p></div>
        <div><dt>Da vila</dt><dd>6 km</dd><p>Em Oliveira do Douro, perto de Cinfães e da Estrada Nacional 222.</p></div>
      </dl>
    </section>
  );
}

const limiares = [
  {
    classe: 'limiar-largo',
    src: 'proposta-glicinias.webp',
    alt: 'Alameda sob glicínias na Casa da Calçada',
    titulo: 'Primeiro, a sombra das glicínias.',
    texto: 'Os jardins aproximam a casa devagar, entre muros de granito e diferentes níveis do terreno.',
  },
  {
    classe: 'limiar-vertical',
    src: 'proposta-porta.webp',
    alt: 'Torre vista através de uma porta de pedra',
    titulo: 'Depois, a pedra enquadra a pedra.',
    texto: 'Portas, arcos e escadas ligam partes construídas em tempos diferentes.',
  },
  {
    classe: 'limiar-medio',
    src: 'proposta-corredor.webp',
    alt: 'Corredor de granito no interior da casa',
    titulo: 'Por dentro, a casa continua a revelar-se.',
    texto: 'A recuperação preservou a presença do granito e a sucessão de passagens.',
  },
] as const;

function Travessia() {
  return (
    <section className="travessia secao" id="travessia" aria-labelledby="titulo-travessia">
      <div className="travessia-intro">
        <p>Entrar é atravessar camadas.</p>
        <h2 id="titulo-travessia">A arquitectura conduz o olhar antes de mostrar o centro da casa.</h2>
      </div>
      <div className="limiares">
        {limiares.map((limiar, i) => (
          <motion.figure className={`limiar ${limiar.classe}`} key={limiar.src} initial={{ opacity: 0, y: i % 2 ? 70 : 45 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.8, delay: i * 0.05 }}>
            <div className="limiar-imagem"><Image src={foto(limiar.src)} alt={limiar.alt} fill sizes="(max-width: 760px) 92vw, 58vw" /></div>
            <figcaption><strong>{limiar.titulo}</strong><span>{limiar.texto}</span></figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

function Capela() {
  const ref = useRef<HTMLElement>(null);
  const progresso = useProgresso(ref);
  const reduzido = useMovimentoReduzido();
  const escala = useTransform(progresso, [0.08, 0.58], reduzido ? [1, 1] : [0.46, 1]);
  const raio = useTransform(progresso, [0.08, 0.58], reduzido ? ['0px', '0px'] : ['340px 340px 18px 18px', '0px 0px 0px 0px']);
  const yFoto = useTransform(progresso, [0.1, 1], reduzido ? ['0%', '0%'] : ['-4%', '4%']);
  const opacidadeIntro = useTransform(progresso, [0, 0.2, 0.42], [1, 1, 0]);
  const opacidadeCitacao = useTransform(progresso, [0.56, 0.73, 1], [0, 1, 1]);

  return (
    <section className="capela-pico" id="capela" ref={ref} aria-labelledby="titulo-capela">
      <div className="capela-stage">
        <motion.div className="capela-intro" style={{ opacity: reduzido ? 1 : opacidadeIntro }}>
          <p>O centro da casa</p>
          <h2 id="titulo-capela">No fim da passagem, uma capela própria.</h2>
        </motion.div>
        <motion.figure className="capela-portal" style={{ scale: escala, borderRadius: raio }}>
          <motion.div className="capela-foto" style={{ y: yFoto }}>
            <Image src={foto('proposta-capela.webp')} alt="Interior da capela da Casa da Calçada, com altar e vitrais" fill sizes="(max-width: 760px) 94vw, 70vw" />
          </motion.div>
        </motion.figure>
        <motion.blockquote className="capela-citacao" style={{ opacity: reduzido ? 1 : opacidadeCitacao }}>
          <p>“O efeito surpreendente da sua arquitectura.”</p>
          <cite>Apresentação oficial da Casa da Calçada</cite>
        </motion.blockquote>
      </div>
    </section>
  );
}

function Ficar() {
  return (
    <section className="ficar secao" id="ficar" aria-labelledby="titulo-ficar">
      <div className="ficar-intro">
        <p>Ficar é ter tempo para os lugares que rodeiam a casa.</p>
        <h2 id="titulo-ficar">A água, os jardins e a luz prolongam o dia.</h2>
      </div>
      <div className="permanencia">
        <figure className="permanencia-piscina"><Image src={foto('proposta-piscina.webp')} alt="Piscina exterior junto à torre" fill sizes="(max-width: 760px) 92vw, 58vw" /></figure>
        <figure className="permanencia-tanque"><Image src={foto('proposta-tanque.webp')} alt="Tanque de pedra alimentado por uma nascente" fill sizes="(max-width: 760px) 72vw, 28vw" /></figure>
        <figure className="permanencia-luz"><Image src={foto('proposta-claraboia.webp')} alt="Quarto nas águas-furtadas iluminado por claraboias" fill sizes="(max-width: 760px) 72vw, 30vw" /></figure>
      </div>
      <blockquote className="testemunho">
        <p>“Beautiful setting, deep in the Douro Valley. Lovely house and grounds. Very quiet.”</p>
        <cite>Johnny, avaliação verificada no Booking</cite>
      </blockquote>
      <div className="grupo">
        <figure><Image src={foto('proposta-mesa.webp')} alt="Sala de jantar com mesa longa preparada" fill sizes="(max-width: 760px) 92vw, 55vw" /></figure>
        <div>
          <p>Para reunir</p>
          <h3>A casa também pode ser reservada por inteiro para um grupo.</h3>
          <p>Dez quartos, vinte camas e pequeno-almoço incluído. A disponibilidade e as condições são confirmadas por contacto directo.</p>
          <Ligacao className="ligacao-texto" href={proposta.contacto}>Falar com a casa</Ligacao>
        </div>
      </div>
    </section>
  );
}

function Contacto() {
  return (
    <section className="contacto" id="contacto" aria-labelledby="titulo-contacto">
      <Image className="contacto-foto" src={foto('proposta-fecho.webp')} alt="Capela e torre da Casa da Calçada entre a vegetação" fill sizes="100vw" />
      <div className="contacto-veu" aria-hidden />
      <div className="contacto-conteudo">
        <p className="sobretitulo">Oliveira do Douro · Cinfães</p>
        <h2 id="titulo-contacto">Há casas que se visitam. Esta atravessa-se.</h2>
        <p>Consulte directamente a disponibilidade e as condições da estadia.</p>
        <Ligacao className="acao acao-final" href={proposta.contacto}>Consultar disponibilidade</Ligacao>
        <div className="contactos-diretos">
          <a href={`tel:${proposta.telefones[0].replaceAll(' ', '')}`}>{proposta.telefones[0]}</a>
          <a href={`tel:${proposta.telefones[1].replaceAll(' ', '')}`}>{proposta.telefones[1]}</a>
          <a href={`mailto:${proposta.email}`}>{proposta.email}</a>
        </div>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="rodape">
      <div><strong>Casa da Calçada</strong><span>Oliveira do Douro, Cinfães</span></div>
      <div className="rodape-links">
        <Ligacao href={proposta.mapa}>Ver no mapa</Ligacao>
        <a href="https://www.casacalcada.com/politica-de-privacidade/" target="_blank" rel="noreferrer">Privacidade</a>
        <a href="https://www.livroreclamacoes.pt/Inicio/" target="_blank" rel="noreferrer">Livro de Reclamações</a>
      </div>
      <div className="rodape-nota"><span>Registo 1375</span><span>Proposta de demonstração. Confirmar autorização das fotografias antes de publicar.</span></div>
    </footer>
  );
}

export default function Experiencia() {
  return (
    <>
      <Cabecalho />
      <main id="conteudo">
        <Hero />
        <Quinta />
        <Travessia />
        <Capela />
        <Ficar />
        <Contacto />
      </main>
      <Rodape />
    </>
  );
}
