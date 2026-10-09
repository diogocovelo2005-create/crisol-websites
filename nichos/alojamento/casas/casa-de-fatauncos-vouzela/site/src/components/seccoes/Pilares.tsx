import { BedIcon, CoffeeIcon, PianoKeysIcon, SwimmingPoolIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import Revelar from '@/components/Revelar';

/*
  A faixa de quatro das referencias (Meadow Branch, La Bastide): icone de
  traco fino, titulo em serifa, uma linha, e filetes verticais a separar.

  E a "indicacao rapida" que o template pede para o hero, posta logo por
  baixo para o hero ficar limpo. Sao factos praticos, nao os pontos
  fortes: esses contam-se mais abaixo, com fotografia.
*/
const icones = { cama: BedIcon, piano: PianoKeysIcon, piscina: SwimmingPoolIcon, cafe: CoffeeIcon };

export default function Pilares() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 pt-24 md:px-10 md:pt-28">
      <div className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:divide-x lg:divide-linha">
        {casa.pilares.map((p, i) => {
          const Icone = icones[p.icone];
          return (
            <Revelar key={p.titulo} atraso={i * 0.07} className="px-2 text-center sm:px-4 lg:px-8">
              <Icone size={34} weight="thin" className="mx-auto text-ouro-escuro" />
              {/* hifen que nao parte: no telemovel 'bem-vindos' e 'Pequeno-almoco'
                  partiam a meio. Mas sem partir, 'Pequeno-almoco' nao cabia na
                  coluna em telemoveis ate ~400 px e alargava a pagina inteira:
                  por isso o tamanho desce com a largura do ecra. */}
              <h3 className="mt-5 text-[clamp(0.95rem,calc(6.2vw-0.3rem),1.45rem)] text-tinta">{p.titulo.replaceAll('-', '‑')}</h3>
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
