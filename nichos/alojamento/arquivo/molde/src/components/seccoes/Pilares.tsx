import { BedIcon, CoffeeIcon, PawPrintIcon, PathIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import Revelar from '@/components/Revelar';

/*
  A faixa de quatro das referencias (Meadow Branch, La Bastide): icone de
  traco fino, titulo em serifa, uma linha, e filetes verticais a separar.

  E a "indicacao rapida" que o template pede para o hero, posta logo por
  baixo para o hero ficar limpo. Sao factos praticos, nao os pontos
  fortes: esses contam-se mais abaixo, com fotografia.
*/
const icones = { cama: BedIcon, cafe: CoffeeIcon, pata: PawPrintIcon, trilho: PathIcon };

export default function Pilares() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 pt-24 md:px-10 md:pt-28">
      <div className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:divide-x lg:divide-linha">
        {casa.pilares.map((p, i) => {
          const Icone = icones[p.icone as keyof typeof icones] ?? BedIcon;
          return (
            <Revelar key={p.titulo} atraso={i * 0.07} className="px-4 text-center lg:px-8">
              <Icone size={34} weight="thin" className="mx-auto text-ouro-escuro" />
              {/* hifen que nao parte: no telemovel 'bem-vindos' e 'Pequeno-almoco' partiam a meio */}
              <h3 className="mt-5 text-[1.45rem] text-tinta">{p.titulo.replaceAll('-', '‑')}</h3>
              <p className="mx-auto mt-2 max-w-[24ch] text-[0.92rem] font-light leading-relaxed text-tinta-medio">
                {p.texto}
              </p>
            </Revelar>
          );
        })}
      </div>
    </section>
  );
}
