'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useLenis } from 'lenis/react';
import { galerias, type IdGaleria } from '@/lib/galerias';
import { Catalogo, Corredor, Fotografia, Gaveta, type PropsVariante } from '@/components/galeria/Variantes';

/*
  Galerias por cima da pagina (pedido do dono: "carregar o site com mais
  fotos", sem mais paginas). Abrem-se com qualquer ligacao para
  #galeria-<id> (ex.: <a href="#galeria-quartos">), por isso as ligacoes sao
  links normais e o botao "voltar" do telemovel fecha a galeria.

  Cada galeria tem a sua maneira de abrir (escolhidas pelo Diogo em
  2026-10-03): ver components/galeria/Variantes.tsx. O "a volta" nao tem
  galeria: as fotos estao nos cartoes do mapa.

  As fotos fracas (829 px) mostram-se no tamanho delas, nunca esticadas.
*/

const PREFIXO = '#galeria-';

const VARIANTE: Partial<Record<IdGaleria, (p: PropsVariante) => React.ReactElement>> = {
  quartos: Fotografia,
  pecas: Catalogo,
  lazer: Corredor,
  saloes: Gaveta,
  jardim: Gaveta,
  casa: Gaveta,
};

function idDoEndereco(): IdGaleria | null {
  const h = window.location.hash;
  if (!h.startsWith(PREFIXO)) return null;
  const id = h.slice(PREFIXO.length);
  return id in VARIANTE ? (id as IdGaleria) : null;
}

export default function Galeria() {
  const [id, setId] = useState<IdGaleria | null>(null);
  const lenis = useLenis();
  // abriu por um clique nesta pagina: fechar = voltar atras no historico
  const veioDeLink = useRef(false);
  // onde estava o link clicado (a "fotografia" abre a partir dele)
  const origem = useRef<DOMRect | null>(null);

  useEffect(() => {
    const ler = () => setId(idDoEndereco());
    const aoMudar = () => {
      veioDeLink.current = true;
      ler();
    };
    const aoClicar = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.(`a[href^="${PREFIXO}"]`);
      origem.current = a ? a.getBoundingClientRect() : null;
    };
    ler();
    window.addEventListener('hashchange', aoMudar);
    document.addEventListener('click', aoClicar, true);
    return () => {
      window.removeEventListener('hashchange', aoMudar);
      document.removeEventListener('click', aoClicar, true);
    };
  }, []);

  const aberta = id !== null;

  const sair = useCallback(() => {
    if (veioDeLink.current) {
      veioDeLink.current = false;
      history.back();
    } else {
      history.replaceState(null, '', window.location.pathname + window.location.search);
      setId(null);
    }
  }, []);

  // a pagina por baixo nao anda; Esc fecha
  useEffect(() => {
    if (!aberta) return;
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && sair();
    window.addEventListener('keydown', tecla);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', tecla);
    };
  }, [aberta, lenis, sair]);

  const Variante = id ? VARIANTE[id] : null;

  return (
    <AnimatePresence>
      {id && Variante && (
        <Variante key={id} titulo={galerias[id].titulo} fotos={galerias[id].fotos} fechar={sair} origem={origem.current} />
      )}
    </AnimatePresence>
  );
}
