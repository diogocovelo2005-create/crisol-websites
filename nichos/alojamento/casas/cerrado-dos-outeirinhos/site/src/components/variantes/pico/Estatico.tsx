'use client';

import Image from 'next/image';
import Revelar from '@/components/Revelar';
import Titulo from '@/components/Titulo';
import { usePico } from './dados';

/*
  O pico sem animacao, para quem pediu menos movimento. Serve as quatro
  variantes: os 3 momentos em lista, foto ao lado do texto.
*/
export default function PicoEstatico() {
  const { etiqueta, titulo, intro, momentos } = usePico();
  return (
    <section className="mx-auto max-w-[1320px] px-6 pt-28 md:px-10 md:pt-36">
      <p className="versalete text-center text-ouro-escuro">{etiqueta}</p>
      <h2 className="mt-5 text-center text-[2.5rem] text-tinta md:text-[3.2rem]">
        <Titulo texto={titulo} />
      </h2>
      <p className="mx-auto mt-5 max-w-[48ch] text-center font-light leading-[1.8] text-tinta-medio">{intro}</p>
      <div className="mt-16 space-y-20">
        {momentos.map((f) => (
          <Revelar key={f.titulo} className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[10px]">
              <Image src={f.imagem} alt={f.alt} fill quality={86} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            </div>
            <div>
              <p className="font-display text-[3rem] leading-none text-ouro">{f.marca}</p>
              <p className="versalete mt-3 text-tinta-medio">{f.momento}</p>
              <h3 className="mt-4 text-[2rem] text-tinta">{f.titulo}</h3>
              <p className="mt-3 max-w-[42ch] font-light leading-[1.8] text-tinta-medio">{f.texto}</p>
            </div>
          </Revelar>
        ))}
      </div>
    </section>
  );
}
