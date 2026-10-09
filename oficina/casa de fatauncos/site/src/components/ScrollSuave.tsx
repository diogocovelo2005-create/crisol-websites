'use client';

import { ReactLenis } from 'lenis/react';
import { useMovimentoReduzido } from '@/lib/useMovimentoReduzido';

/*
  Scroll suave global. Se o sistema pedir menos movimento, o Lenis nao
  entra de todo: um scroll interpolado e movimento, e quem desligou
  movimento nao o quer a arrastar a pagina.
*/
export default function ScrollSuave({ children }: { children: React.ReactNode }) {
  const parado = useMovimentoReduzido();

  if (parado) return <>{children}</>;

  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
