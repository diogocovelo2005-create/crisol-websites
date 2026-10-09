import MuroQuartos, { type FotoQuarto } from '@/components/MuroQuartos';
import Sobe from '@/components/Sobe';

/*
  4 · Para dormir, três quartos e três casas de banho. Texto em duas
  colunas e a tira de fotos do protótipo C. Com as quatro fotos que o
  Diogo pediu (quarto-01, 08, 03 e 07; a 07 substitui a 06, que era do
  mesmo assunto, os quadros de jarros), as fotos ficam num muro de duas
  colunas desencontradas, alta e baixa (o Masonry do React Bits, pedido
  do Diogo a 2026-10-09; MuroQuartos). Legendas só pelo
  que a foto mostra, sem dizer que quarto é.
*/

const fotos: [FotoQuarto, FotoQuarto, FotoQuarto, FotoQuarto] = [
  {
    src: '/fotos/quarto-01.jpg',
    alt: 'Cama de casal junto a duas janelas com vista para os socalcos, e parede de granito',
    legenda: 'Duas janelas para os socalcos',
    foco: '50% 45%',
  },
  {
    src: '/fotos/quarto-08.jpg',
    alt: 'Quarto com paredes de granito, cama de casal ao sol e janelas de madeira vermelha',
    legenda: 'Granito e sol sobre a cama',
    foco: '50% 55%',
  },
  {
    src: '/fotos/quarto-03.jpg',
    alt: 'Quarto no sótão com teto de madeira inclinado e porta vermelha',
    legenda: 'Teto de madeira e porta vermelha',
    foco: '60% 40%',
  },
  {
    src: '/fotos/quarto-07.jpg',
    alt: 'Cama de casal com toalhas dobradas, quadros de jarros por cima e granito ao lado',
    legenda: 'Quadros de jarros',
    foco: '50% 50%',
  },
];

export default function Quartos() {
  return (
    <section id="quartos" className="pb-20 md:pb-[104px]">
      <div className="caixa">
        <div className="corte !pb-10">
          <p>E quando o dia acaba, os quartos esperam.</p>
        </div>
        <div className="grid gap-7 pb-14 lg:grid-cols-[6fr_5fr] lg:items-end lg:gap-[72px]">
          <Sobe className="titulo-seccao">
            Para dormir, três quartos e <em>três casas de banho.</em>
          </Sobe>
          <ul className="m-0 list-none p-0">
            <li className="max-w-[46ch] border-t border-linha py-3.5">
              Três quartos, uns com paredes de granito, outros com tetos de madeira no sótão, todos com janelas e portas de madeira vermelha.
            </li>
            <li className="max-w-[46ch] border-t border-linha py-3.5">Três casas de banho, para ninguém ficar à espera de manhã.</li>
            <li className="max-w-[46ch] border-t border-linha py-3.5">
              Para os mais pequenos, cadeira alta e portões de segurança, e berço gratuito mediante pedido.
            </li>
          </ul>
        </div>
      </div>

      {/* o muro: duas colunas desencontradas (Masonry), quarto-01 e 03 à esquerda, 08 e 07 à direita */}
      <MuroQuartos fotos={fotos} />
    </section>
  );
}
