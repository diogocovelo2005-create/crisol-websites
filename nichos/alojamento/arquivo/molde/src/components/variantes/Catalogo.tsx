'use client';

import { useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { DownloadSimpleIcon } from '@phosphor-icons/react';
import { FORMAS_PICO } from './formas-catalogo';
import { PicoContexto } from './pico/dados';
import Variante from './Variante';
import P1Relogio from './pico/Relogio';
import P2Provas from './pico/Provas';
import P4Caderno from './pico/Caderno';
import P5Livro from './pico/Livro';
import E1Faixa from './espacos/Faixa';
import E2Indice from './espacos/Indice';
import E3Revista from './espacos/Revista';
import E4Mosaico from './espacos/Mosaico';
import E5Baralho from './espacos/Baralho';
import F1Moldura from './fecho/Moldura';
import F2Portadas from './fecho/Portadas';
import F3Cortina from './fecho/Cortina';
import F4Postal from './fecho/Postal';
import {
  AtmosferaA1,
  AtmosferaA3,
  HeroH1,
  HeroH2,
  HeroH3,
  HeroH4,
  OpinioesO1,
  OpinioesO3,
  PilaresPI1,
  PilaresPI3,
} from './PrototiposBase';
import { PROTOTIPOS, requisitosDo, SECCOES, type CodigoPrototipo } from './registo';

type Estado = 'por-avaliar' | 'aprovado' | 'rever' | 'rejeitado';
type Decisao = { estado: Estado; nota: string };
type Item = (typeof PROTOTIPOS)[number] & { el: ReactNode };

const COMPONENTES = {
  H1: <HeroH1 />,
  H2: <HeroH2 />,
  H3: <HeroH3 />,
  H4: <HeroH4 />,
  PI1: <PilaresPI1 />,
  PI3: <PilaresPI3 />,
  A1: <AtmosferaA1 />,
  A3: <AtmosferaA3 />,
  P1: <P1Relogio />,
  P2: <P2Provas />,
  P4: <P4Caderno />,
  P5: <P5Livro />,
  E1: <E1Faixa />,
  E2: <E2Indice />,
  E3: <E3Revista />,
  E4: <E4Mosaico />,
  E5: <E5Baralho />,
  O1: <OpinioesO1 />,
  O3: <OpinioesO3 />,
  F1: <F1Moldura />,
  F2: <F2Portadas />,
  F3: <F3Cortina />,
  F4: <F4Postal />,
} satisfies Record<CodigoPrototipo, ReactNode>;

const GRUPOS = SECCOES.map((seccao) => ({
  titulo: seccao.titulo,
  itens: PROTOTIPOS
    .filter((prototipo) => prototipo.seccao === seccao.id)
    .map((prototipo) => ({ ...prototipo, el: COMPONENTES[prototipo.codigo] })) as Item[],
}));

const DECISOES_INICIAIS = Object.fromEntries(PROTOTIPOS.map((prototipo) => [
  prototipo.codigo,
  {
    estado: prototipo.estado,
    nota: prototipo.codigo === 'H1' ? 'Base preferida mantida.' : '',
  },
])) as Record<string, Decisao>;

function Separador({ item, frase, decisao, onChange }: { item: Item; frase: string; decisao: Decisao; onChange: (decisao: Decisao) => void }) {
  const requisitos = requisitosDo(item.codigo);
  return (
    <header id={item.codigo} className="scroll-mt-0 bg-noite px-6 py-14 text-osso md:px-12">
      <div className="mx-auto grid max-w-[1320px] gap-10 lg:grid-cols-2">
        <div>
          <div className="flex items-end gap-4">
            <p className="font-display text-[5rem] leading-none text-ouro md:text-[7rem]">{item.codigo}</p>
            {item.estado !== 'aprovado' && <span className="mb-2 border border-amber-500/50 px-2 py-1 text-[.65rem] uppercase tracking-[.14em] text-amber-300">por avaliar</span>}
          </div>
          <h2 className="mt-3 text-[2.4rem] md:text-[3.4rem]">{item.nome}</h2>
          <p className="mt-4 max-w-[56ch] font-light leading-[1.7] text-osso/70">{item.mecanica}</p>
          {item.seccao === 'pico' && <p className="versalete mt-5 text-ouro">Forma de contar: {frase}</p>}
          <p className="mt-5 break-all font-mono text-[.68rem] leading-relaxed text-osso/35">{item.ficheiro}</p>
        </div>
        <div className="grid content-start gap-5 lg:border-l lg:border-osso/15 lg:pl-10">
          <div><p className="versalete text-osso/40">Conteúdo mínimo</p><p className="mt-2 text-sm leading-relaxed text-osso/75">{item.pede}</p></div>
          <div>
            <p className="versalete text-osso/40">Contrato de entrada</p>
            <p className="mt-2 text-sm leading-relaxed text-osso/75">Campos: {requisitos.campos.join(' · ')}</p>
            <p className="mt-1 text-sm leading-relaxed text-osso/75">Imagens: {requisitos.imagens.minimo} mín. — {requisitos.imagens.descricao}</p>
            {requisitos.itens && <p className="mt-1 text-sm leading-relaxed text-osso/75">Itens: {requisitos.itens.minimo}{requisitos.itens.maximo ? `–${requisitos.itens.maximo}` : '+'} — {requisitos.itens.descricao}</p>}
            <p className="mt-1 text-sm leading-relaxed text-osso/75">Mobile: {requisitos.mobile}</p>
          </div>
          <div><p className="versalete text-osso/40">Identidade a preservar</p><p className="mt-2 text-sm leading-relaxed text-osso/75">{item.manter}</p></div>
          <div><p className="versalete text-osso/40">Pode mudar</p><p className="mt-2 text-sm leading-relaxed text-osso/75">{item.podeMudar}</p></div>
          <div>
            <p className="versalete text-osso/40">A tua decisão</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(['aprovado', 'rever', 'rejeitado'] as Estado[]).map((estado) => (
                <button key={estado} type="button" onClick={() => onChange({ ...decisao, estado })} className={`border px-3 py-2 text-xs uppercase tracking-[.14em] transition-colors ${decisao.estado === estado ? 'border-ouro bg-ouro text-noite' : 'border-osso/25 text-osso/70 hover:border-osso/60'}`}>{estado}</button>
              ))}
            </div>
            <textarea value={decisao.nota} onChange={(event) => onChange({ ...decisao, nota: event.target.value })} aria-label={`Notas sobre ${item.codigo}`} placeholder="O que gostas ou mudarias?" className="mt-3 min-h-20 w-full resize-y border border-osso/20 bg-white/5 p-3 text-sm text-osso outline-none placeholder:text-osso/30 focus:border-ouro" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Catalogo() {
  const [indiceForma, setIndiceForma] = useState(0);
  const [decisoes, setDecisoes] = useState<Record<string, Decisao>>(DECISOES_INICIAIS);
  const forma = FORMAS_PICO[indiceForma];
  const todos = GRUPOS.flatMap((grupo) => grupo.itens);

  useLayoutEffect(() => {
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const guardado = window.localStorage.getItem('catalogo-decisoes-v3');
    if (!guardado) return;
    try {
      const id = window.setTimeout(() => setDecisoes(JSON.parse(guardado)), 0);
      return () => window.clearTimeout(id);
    } catch {
      window.localStorage.removeItem('catalogo-decisoes-v3');
    }
  }, []);

  const decidir = (codigo: string, decisao: Decisao) => {
    setDecisoes((atuais) => {
      const proximas = { ...atuais, [codigo]: decisao };
      window.localStorage.setItem('catalogo-decisoes-v3', JSON.stringify(proximas));
      return proximas;
    });
  };

  const exportar = () => {
    const blob = new Blob([JSON.stringify({ versao: 3, exportadoEm: new Date().toISOString(), decisoes }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const ancora = document.createElement('a');
    ancora.href = url;
    ancora.download = 'decisoes-catalogo-v3.json';
    ancora.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PicoContexto.Provider value={forma}>
      <main id="conteudo">
        <section className="mx-auto max-w-[1320px] px-6 pb-20 pt-20 md:px-10 md:pt-24">
          <p className="versalete text-ouro-escuro">Laboratório · molde de alojamento</p>
          <h1 className="mt-5 max-w-[16ch] text-[3rem] md:text-[5rem]">Protótipos para <em>ver, testar e combinar.</em></h1>
          <p className="mt-7 max-w-[66ch] text-[1.05rem] font-light leading-[1.8] text-tinta-medio">Cada proposta aponta para o componente que a implementa. A ficha descreve a mecânica e a sua identidade, sem limitar a escolha a um tipo de casa. O comportamento completo vê-se no código e nesta página a funcionar.</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <span className="border border-linha px-4 py-2 text-sm">{todos.length} protótipos</span>
            <span className="border border-linha px-4 py-2 text-sm">{Object.values(decisoes).filter((decisao) => decisao.estado === 'aprovado').length} aprovados</span>
            <button type="button" onClick={exportar} className="inline-flex items-center gap-2 bg-tinta px-4 py-2 text-sm text-osso"><DownloadSimpleIcon size={17} /> Exportar decisões</button>
          </div>
          <div className="mt-14 border-t border-tinta pt-8">
            <p className="versalete text-ouro-escuro">Forma de contar do pico</p>
            <p className="mt-4 max-w-[62ch] font-light leading-[1.8] text-tinta-medio">A animação e a narrativa são escolhas separadas. Os controlos fixos permitem testar a mesma mecânica com outra forma de contar.</p>
          </div>
          <nav className="mt-12 grid gap-8 border-t border-linha pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {GRUPOS.map((grupo) => (
              <div key={grupo.titulo}>
                <p className="versalete text-tinta-medio">{grupo.titulo} · {grupo.itens.length}</p>
                <ul className="mt-3 flex flex-col">
                  {grupo.itens.map((item) => (
                    <li key={item.codigo}>
                      <a href={`#${item.codigo}`} className="flex items-center gap-3 py-1.5 hover:text-ouro-escuro">
                        <span className={`size-2 rounded-full ${decisoes[item.codigo]?.estado === 'aprovado' ? 'bg-green-700' : decisoes[item.codigo]?.estado === 'rejeitado' ? 'bg-red-700' : decisoes[item.codigo]?.estado === 'rever' ? 'bg-amber-600' : 'bg-linha'}`} />
                        <span className="w-8 text-xs tabular-nums text-ouro-escuro">{item.codigo}</span>
                        <span className="font-display text-[1.15rem]">{item.nome}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </section>

        {GRUPOS.map((grupo) => <div key={grupo.titulo}>{grupo.itens.map((item) => <div key={item.codigo}><Separador item={item} frase={forma.forma} decisao={decisoes[item.codigo] ?? { estado: 'por-avaliar', nota: '' }} onChange={(decisao) => decidir(item.codigo, decisao)} /><Variante codigo={item.codigo}>{item.el}</Variante></div>)}</div>)}

        <section className="flex h-[60vh] items-center justify-center bg-noite text-center text-osso"><div><p className="font-display text-4xl">Fim do laboratório.</p><button type="button" onClick={exportar} className="mt-6 inline-flex items-center gap-2 border border-osso/30 px-5 py-3 text-sm"><DownloadSimpleIcon size={17} /> Exportar decisões</button></div></section>
      </main>

      <div className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto rounded-[2px] bg-noite/90 p-1.5 text-osso shadow-lg backdrop-blur">
        <span className="versalete shrink-0 px-2 text-osso/60">Contar</span>
        {FORMAS_PICO.map((opcao, indice) => <button key={opcao.forma} type="button" onClick={() => setIndiceForma(indice)} aria-pressed={indice === indiceForma} className={`shrink-0 whitespace-nowrap rounded-[2px] px-2.5 py-1.5 text-[0.8rem] transition-colors ${indice === indiceForma ? 'bg-ouro text-noite' : 'hover:bg-osso/10'}`}>{opcao.forma}</button>)}
      </div>
    </PicoContexto.Provider>
  );
}
