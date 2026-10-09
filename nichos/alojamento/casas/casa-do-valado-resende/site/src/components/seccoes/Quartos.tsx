import Folha from '@/components/Folha';
import BounceCards from '@/components/reactbits/BounceCards';
import Passagem from '@/components/Passagem';
import Revelar from '@/components/Revelar';
import Titulo from '@/components/Titulo';

/*
  4 · Para o fim do dia. Curta e prática, em osso: desce o ritmo depois
  das duas secções de cor. As três fotos em leque (BounceCards): entram
  com mola ao ritmo do scroll e afastam-se ao passar o rato ou tocar; as
  legendas do BRIEF vão na margem de cada uma e não numeram os quartos
  (o contrato não deixa).
  Já não fecha com uma foto solta a toda a largura: o deck foi para a
  linha do dia, com legenda.
*/
const quartos = [
  { src: '/fotos/quarto-08.jpg', alt: 'Quarto com cama de casal de madeira escura, candeeiro vermelho e janela para as encostas', foco: '50% 45%', legenda: 'Um dos quartos de casal, com as encostas na janela.' },
  { src: '/fotos/quarto-02.jpg', alt: 'Quarto com cama de casal escura, espelho de pé e um quadro de paisagem', foco: '50% 50%', legenda: 'O outro quarto de casal.' },
  { src: '/fotos/quarto-01.jpg', alt: 'Quarto com duas camas individuais brancas e janela para o vale', foco: '50% 45%', legenda: 'O quarto das duas camas individuais.' },
];

export default function Quartos() {
  return (
    <Folha id="quartos" rotulo="t-quartos" className="bg-linho">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-5 pt-24 sm:px-8 md:grid-cols-12 md:items-center md:gap-10 md:pt-20 lg:px-16">
        <Revelar className="md:col-span-4">
          <h2 id="t-quartos" className="titulo-seccao [&_em]:text-barro">
            <Titulo texto="Para o *fim do dia*" />
          </h2>
          <p className="mt-7 max-w-[38ch]">
            Três quartos e uma casa de banho. Dois quartos com cama de casal e um com duas camas individuais. Lençóis e toalhas já cá
            estão à vossa espera. Para os mais pequenos, berço e cadeira alta gratuitos, mediante pedido.
          </p>
        </Revelar>
        {/* os três quartos em leque (BounceCards, do React Bits): a legenda vai
            na margem de cada polaroid */}
        <BounceCards className="md:col-span-8" cartoes={quartos} />
      </div>
      <Passagem className="pb-14 pt-14 md:pb-12 md:pt-12">Falta dizer onde fica, e o que há à volta.</Passagem>
    </Folha>
  );
}
