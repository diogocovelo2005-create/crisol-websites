'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ListIcon, XIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import Botao from '@/components/Botao';

/*
  Cabecalho das referencias: marca a esquerda (simbolo num circulo mais
  nome), ligacoes em versaletes, e o botao Reservar a direita.

  Transparente por cima da fotografia do hero; ganha fundo de linho
  depois de sair dele. O limiar vem de um IntersectionObserver, nao de
  um listener de scroll.
*/

const ligacoes = [
  { href: '#a-casa', texto: 'A casa' },
  { href: '#espacos', texto: 'Os espaços' },
  { href: '#opinioes', texto: 'Opiniões' },
  { href: '#reservar', texto: 'Contactos' },
];

function Marca({ claro }: { claro: boolean }) {
  return (
    <a href="#conteudo" className="flex items-center gap-3">
      <span
        className={`grid size-10 place-items-center rounded-full border transition-colors duration-500 ${
          claro ? 'border-osso/60 text-osso' : 'border-tinta/40 text-tinta'
        }`}
      >
        {/* a flor do favicon da casa: o original so tem 32 px, por isso
            fica pequena dentro do circulo, onde nao se nota */}
        <Image src="/marca-flor-transparente.png" alt="" width={26} height={26} className="size-[26px]" />
      </span>
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

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        assente ? 'border-b border-linha bg-linho/92 backdrop-blur-md' : 'border-b border-osso/15'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1320px] items-center justify-between px-6 md:px-10">
        <Marca claro={claro} />

        <nav className="hidden items-center gap-9 lg:flex">
          {ligacoes.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`versalete transition-colors duration-200 ${
                claro ? 'text-osso/85 hover:text-osso' : 'text-tinta/75 hover:text-tinta'
              }`}
            >
              {l.texto}
            </a>
          ))}
          <Botao href={casa.reservas} tom="ouro" className="!px-6 !py-3">
            Reservar
          </Botao>
        </nav>

        <button
          type="button"
          onClick={() => setMenu(true)}
          aria-label="Abrir menu"
          className={`lg:hidden ${claro ? 'text-osso' : 'text-tinta'}`}
        >
          <ListIcon size={26} weight="light" />
        </button>
      </div>

      {menu && (
        <div className="fixed inset-0 z-50 bg-linho lg:hidden">
          <div className="flex h-20 items-center justify-between px-6">
            <Marca claro={false} />
            <button type="button" onClick={() => setMenu(false)} aria-label="Fechar menu">
              <XIcon size={26} weight="light" className="text-tinta" />
            </button>
          </div>
          <nav className="flex flex-col px-6 pt-8">
            {ligacoes.map((l) => (
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
            <a
              href={casa.reservas}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenu(false)}
              className="versalete mt-10 inline-flex w-full items-center justify-center rounded-[2px] bg-floresta px-7 py-4 text-osso"
            >
              Reservar
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
