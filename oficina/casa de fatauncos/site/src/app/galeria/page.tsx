import type { Metadata } from 'next';
import Image from 'next/image';
import Cabecalho from '@/components/Cabecalho';
import Rodape from '@/components/Rodape';
import Mosaico from '@/components/galeria/Mosaico';
import { capitulos } from '@/lib/galeriaPagina';
import { casa } from '@/lib/casa';

export const metadata: Metadata = {
  title: `Galeria | ${casa.nome}`,
  description: 'Fotografias da Casa de Fataunços: exterior, quartos, salões, coleção e lugares à volta.',
};

export default function PaginaGaleria() {
  return (
    <>
      <Cabecalho />
      <main id="conteudo" className="pt-20">
        <div className="mx-auto max-w-[1320px] px-5 pb-9 pt-10 md:px-10 md:pb-12 md:pt-16">
          <h1 className="font-display text-[clamp(3.5rem,8vw,7rem)] leading-[1.08] text-tinta">Galeria</h1>
          <p className="mt-3 max-w-[35ch] font-light leading-relaxed text-tinta-medio md:text-lg">
            A casa por dentro e por fora. Fotografias para a conhecer antes de chegar.
          </p>
          <nav aria-label="Capítulos da galeria" className="mt-8 flex flex-wrap gap-x-6 gap-y-3 md:mt-10">
            {capitulos.map((capitulo) => (
              <a key={capitulo.id} href={`#${capitulo.id}`} className="border-b border-tinta/30 pb-1 text-sm text-tinta transition-colors hover:border-ouro hover:text-ouro-escuro">
                {capitulo.titulo}
              </a>
            ))}
          </nav>
        </div>
        <div className="mx-auto max-w-[1440px] px-2 md:px-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-linho-escuro sm:aspect-[16/9] lg:aspect-[2.2/1]">
            <Image
              src="/fotos/hero.jpg"
              alt="A fachada branca da Casa de Fataunços, com cantaria de granito e portas verdes"
              fill
              preload
              quality={85}
              sizes="(max-width: 1440px) 100vw, 1440px"
              className="object-cover"
            />
          </div>
        </div>
        <Mosaico capitulos={capitulos} />
      </main>
      <Rodape />
    </>
  );
}
