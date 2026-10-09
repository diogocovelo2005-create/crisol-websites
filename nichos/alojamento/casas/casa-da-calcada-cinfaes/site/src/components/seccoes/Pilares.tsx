import { BedIcon, CoffeeIcon, SwimmingPoolIcon, ChurchIcon } from '@phosphor-icons/react/dist/ssr';
import { casa } from '@/lib/casa';
import Revelar from '@/components/Revelar';

/*
  Os quatro factos praticos, numa faixa que se le num relance. Sem
  cartoes: o que os separa e espaco e um filete, nao uma caixa.

  Os quatro sao afirmacoes com uso 'afirmar' no contrato: nenhum deles
  precisa de condicao nem de nota de rodape.

  Sem rotulo por cima. A pagina tem sete seccoes e so tres podem levar
  rotulo; esta nao precisa de um para se perceber.
*/
const icones = { cama: BedIcon, cafe: CoffeeIcon, piscina: SwimmingPoolIcon, capela: ChurchIcon };

export default function Pilares() {
  return (
    <section className="border-b border-linha bg-linho-escuro">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-16 text-center sm:grid-cols-2 md:px-10 lg:grid-cols-4 lg:gap-8">
        {casa.pilares.map((p, i) => {
          const Icone = icones[p.icone as keyof typeof icones] ?? BedIcon;
          return (
            <Revelar key={p.titulo} atraso={i * 0.06}>
              <div>
                <Icone size={26} weight="light" className="mx-auto text-ouro-escuro" />
                {/* hifen que nao parte: no telemovel 'Pequeno-almoco' partia a meio */}
                <h3 className="mt-4 text-[1.4rem] text-tinta">{p.titulo.replaceAll('-', '\u2011')}</h3>
                <p className="mx-auto mt-2 max-w-[30ch] text-[0.92rem] font-light leading-relaxed text-tinta-medio">
                  {p.texto}
                </p>
              </div>
            </Revelar>
          );
        })}
      </div>
    </section>
  );
}
