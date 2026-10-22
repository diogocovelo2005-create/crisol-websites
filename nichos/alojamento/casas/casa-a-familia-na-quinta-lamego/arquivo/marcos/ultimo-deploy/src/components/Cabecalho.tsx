'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll } from 'motion/react';
import { ListIcon, XIcon } from '@phosphor-icons/react/dist/ssr';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';
import { casa } from '@/lib/casa';
import { primeiraAcao } from '@/components/AcoesReserva';

/*
  O cabeçalho, formato fixo de todas as casas: o logótipo da casa (se
  houver, em casa.logo) ou o nome no canto superior esquerdo; as páginas
  (casa.navegacao) e a primeira ação de reserva no canto direito. Abaixo
  de 1024 px a navegação passa para um menu de ecrã inteiro. Os alvos de
  toque têm 44 px. O mesmo formato, estático, está em
  references/primeiro-ecra.html para os protótipos.

  Transparente por cima da fotografia do hero; ganha fundo de linho
  depois de sair dele. O limiar vem de um IntersectionObserver, nao de
  um listener de scroll.

  Para o visitante saber sempre onde está: um fio cor do acento no fundo
  do cabeçalho mede quanto da página já se leu (preso ao scroll), e no
  computador o capítulo que está a meio do ecrã fica sublinhado no menu
  (as secções `main section[id]` das âncoras de casa.navegacao). Se os
  capítulos ficarem presos uns por baixo dos outros, conta o último que
  cruza o meio do ecrã (o de cima).
*/

function Marca({ claro }: { claro: boolean }) {
  const logo = casa.logo;
  if (logo) {
    return (
      <a href="#conteudo" className="flex min-h-11 items-center">
        <Image src={claro && logo.claro ? logo.claro : logo.src} alt={casa.nome} width={logo.largura} height={logo.altura} priority className="h-10 w-auto" />
      </a>
    );
  }
  return (
    <a href="#conteudo" className="flex min-h-11 items-center">
      <span className="leading-none">
        <span
          className={`block font-display text-[1.35rem] font-medium transition-colors duration-500 ${
            claro ? 'text-osso' : 'text-tinta'
          }`}
        >
          {casa.nome}
        </span>
        <span
          className={`versalete mt-1 block !text-[0.58rem] !tracking-[0.24em] transition-colors duration-500 ${
            claro ? 'text-osso/70' : 'text-tinta-medio'
          }`}
        >
          {casa.tipo}
        </span>
      </span>
    </a>
  );
}

export default function Cabecalho() {
  const [assente, setAssente] = useState(false);
  const [menu, setMenu] = useState(false);
  const [atual, setAtual] = useState<string | null>(null);
  const parado = useMovimentoReduzido();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const seccoes = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'));
    const no = new Set<HTMLElement>();
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) no.add(e.target as HTMLElement);
          else no.delete(e.target as HTMLElement);
        }
        const ultima = seccoes.filter((s) => no.has(s)).pop();
        setAtual(ultima ? `#${ultima.id}` : null);
      },
      { rootMargin: '-50% 0px -49% 0px' },
    );
    seccoes.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const sentinela = document.getElementById('sentinela-topo');
    if (!sentinela) return;
    const obs = new IntersectionObserver(([e]) => setAssente(!e.isIntersecting), {
      rootMargin: '0px',
    });
    obs.observe(sentinela);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menu]);

  const claro = !assente;
  const acao = primeiraAcao();
  const links = casa.navegacao;
  const acaoExterna = Boolean(acao && /^https?:/.test(acao.href));

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        assente ? 'border-b border-linha bg-linho/92 backdrop-blur-md' : 'border-b border-osso/15'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1320px] items-center justify-between px-6 md:px-10">
        <Marca claro={claro} />

        <nav className="hidden items-center gap-9 lg:flex">
          {links.map((l) => {
            const aqui = assente && atual === l.href;
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={aqui ? 'location' : undefined}
                className={`versalete relative transition-colors duration-200 after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-left after:bg-ouro after:transition-transform after:duration-300 after:ease-out ${
                  aqui ? 'after:scale-x-100' : 'after:scale-x-0'
                } ${claro ? 'text-osso/85 hover:text-osso' : aqui ? 'text-tinta' : 'text-tinta/75 hover:text-tinta'}`}
              >
                {l.texto}
              </a>
            );
          })}
          {acao && (
            <a href={acao.href} target={acaoExterna ? '_blank' : undefined} rel={acaoExterna ? 'noopener noreferrer' : undefined} className={`versalete rounded-[2px] px-6 py-3 ${claro ? 'bg-ouro text-noite' : 'bg-floresta text-osso'}`}>
              {acao.rotulo}
            </a>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenu(true)}
          aria-label="Abrir menu"
          className={`-mr-2.5 grid size-11 place-items-center lg:hidden ${claro ? 'text-osso' : 'text-tinta'}`}
        >
          <ListIcon size={26} weight="light" />
        </button>
      </div>

      {/* o fio: quanto da página já se leu */}
      {assente && !parado && (
        <motion.span aria-hidden style={{ scaleX: scrollYProgress }} className="absolute inset-x-0 -bottom-px block h-[2px] origin-left bg-ouro" />
      )}

      {menu && (
        <div className="fixed inset-0 z-50 bg-linho lg:hidden">
          <div className="flex h-20 items-center justify-between px-6">
            <Marca claro={false} />
            <button type="button" onClick={() => setMenu(false)} aria-label="Fechar menu" className="-mr-2.5 grid size-11 place-items-center">
              <XIcon size={26} weight="light" className="text-tinta" />
            </button>
          </div>
          <nav className="flex flex-col px-6 pt-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenu(false)}
                className="border-b border-linha py-5 font-display text-[2rem] text-tinta"
              >
                {l.texto}
              </a>
            ))}
            {/* anchor e nao Botao: tem de fechar o menu alem de navegar */}
            {acao && (
              <a
                href={acao.href}
                target={acaoExterna ? '_blank' : undefined}
                rel={acaoExterna ? 'noopener noreferrer' : undefined}
                onClick={() => setMenu(false)}
                className="versalete mt-10 inline-flex w-full items-center justify-center rounded-[2px] bg-floresta px-7 py-4 text-osso"
              >
                {acao.rotulo}
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
