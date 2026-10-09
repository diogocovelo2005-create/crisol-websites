import { BedIcon, CoffeeIcon, FootprintsIcon, MotorcycleIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import Revelar from '@/components/Revelar';

/*
  A faixa de quatro das referencias (Meadow Branch, La Bastide): icone de
  traco fino, titulo em serifa, uma linha, e filetes verticais a separar.

  E a "indicacao rapida" que o template pede para o hero, posta logo por
  baixo para o hero ficar limpo. Sao factos praticos, nao os pontos
  fortes: esses contam-se mais abaixo, com fotografia.
*/
// os quatro pilares desta casa: quartos, pequeno-almoco, estar no centro
// da vila e o parque fechado onde cabem motas. A casa nao aceita animais.
const icones = { cama: BedIcon, cafe: CoffeeIcon, passo: FootprintsIcon, mota: MotorcycleIcon };

export default function Pilares() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 pt-24 md:px-10 md:pt-28">
      <div className="grid grid-cols-2 gap-y-12 lg:grid-cols-4 lg:divide-x lg:divide-linha">
        {casa.pilares.map((p, i) => {
          const Icone = icones[p.icone];
          return (
            <Revelar key={p.titulo} atraso={i * 0.07} className="px-4 text-center lg:px-8">
              <Icone size={34} weight="thin" className="mx-auto text-ouro-escuro" />
              {/* O hifen aqui e o normal, nao o que nao parte: com o que nao
                  parte, 'Pequeno-almoco' ficava mais largo do que a coluna em
                  qualquer telemovel e transbordava para o lado. Assim so parte
                  quando nao cabe, e parte no hifen, nunca a meio da palavra.
                  O corpo tambem desce um ponto ate ao `md` pelo mesmo motivo. */}
              <h3 className="mt-5 text-[1.25rem] text-tinta md:text-[1.45rem]">{p.titulo}</h3>
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
