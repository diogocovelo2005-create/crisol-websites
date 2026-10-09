'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { useEffect } from 'react';
import { topoNatural } from '@/lib/posicao';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  Scroll suave global. Se o sistema pedir menos movimento, o Lenis nao
  entra de todo: um scroll interpolado e movimento, e quem desligou
  movimento nao o quer a arrastar a pagina.
*/
/*
  As âncoras (#fora, #casa...) vão para a posição natural da secção. Com
  os capítulos presos (sticky), o salto nativo do browser usava a posição
  presa e caía a meio de outra secção.
*/
function Ancoras() {
  const lenis = useLenis();
  useEffect(() => {
    const clique = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = decodeURIComponent(a.hash.slice(1));
      const alvo = id ? document.getElementById(id) : null;
      if (!alvo) return;
      e.preventDefault();
      const margem = parseFloat(getComputedStyle(alvo).scrollMarginTop) || 0;
      const y = Math.max(0, topoNatural(alvo) - margem);
      if (lenis) lenis.scrollTo(y);
      else window.scrollTo({ top: y });
      history.pushState(null, '', `#${id}`);
    };
    document.addEventListener('click', clique);
    return () => document.removeEventListener('click', clique);
  }, [lenis]);
  return null;
}

export default function ScrollSuave({ children }: { children: React.ReactNode }) {
  const parado = useMovimentoReduzido();

  if (parado) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: true }}>
      <Ancoras />
      {children}
    </ReactLenis>
  );
}
