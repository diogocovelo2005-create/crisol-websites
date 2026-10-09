'use client';

import { useEffect, useState } from 'react';

/*
  Liga uma media query ao React. Usado para as coreografias de scroll que
  so fazem sentido num ecra largo (o pan horizontal): no telemovel o
  gesto natural e deslizar, e prender a pagina para simular isso e pior.
*/
export function useMedia(query: string) {
  const [bate, setBate] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const atualizar = () => setBate(mq.matches);
    atualizar();
    mq.addEventListener('change', atualizar);
    return () => mq.removeEventListener('change', atualizar);
  }, [query]);

  return bate;
}
