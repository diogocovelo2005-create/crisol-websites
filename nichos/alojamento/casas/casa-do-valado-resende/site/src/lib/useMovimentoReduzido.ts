'use client';

import { useEffect, useState } from 'react';

/*
  "O visitante pediu menos movimento?"

  Porque nao o useReducedMotion do Motion: esse devolve logo a preferencia
  real no primeiro render do browser, e o servidor (que nao a conhece)
  desenhou a versao animada. Com a preferencia ligada, o HTML nao batia
  certo e o React refazia a pagina inteira ("hydration failed").

  Aqui o primeiro render e sempre igual ao do servidor (movimento ligado) e
  so depois de montar se le a preferencia e se reage a mudancas dela.
*/
export function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const atualizar = () => setReduzido(mq.matches);
    atualizar();
    mq.addEventListener('change', atualizar);
    return () => mq.removeEventListener('change', atualizar);
  }, []);

  return reduzido;
}
