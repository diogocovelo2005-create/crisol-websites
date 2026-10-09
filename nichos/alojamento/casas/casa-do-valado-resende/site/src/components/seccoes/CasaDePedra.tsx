import Folha from '@/components/Folha';
import Foto from '@/components/Foto';
import Passagem from '@/components/Passagem';
import Revelar from '@/components/Revelar';
import Titulo from '@/components/Titulo';

/*
  3 · Por dentro, granito e lareira. Fundo de pedra quente (o tom do
  granito e do chão de barro), itálicos em barro.

  A fachada abre a secção, ao lado do título: é a passagem de fora para
  dentro. Depois a sala grande com a lareira e a janela, a pedra à vista
  e a mesa, em grelha desencontrada (de A), cada foto com a legenda do
  BRIEF e com o parágrafo que ela prova ao lado.

  Cada foto ergue-se do fundo ao entrar, como uma pedra a ser assente
  (Foto com `ergue`): as da mesma linha desencontradas.
*/
export default function CasaDePedra() {
  return (
    <Folha id="casa" rotulo="t-casa" className="bg-pedra">
      <div className="mx-auto max-w-[1280px] px-5 pb-16 pt-24 sm:px-8 md:pb-14 md:pt-20 lg:px-16">
        <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-10">
          <Revelar className="md:col-span-6 lg:col-span-5">
            <h2 id="t-casa" className="titulo-seccao [&_em]:text-barro">
              <Titulo texto="Por dentro, *granito e lareira*" />
            </h2>
            <p className="mt-7 max-w-[42ch]">
              Granito por fora, pedra à vista por dentro: na sala, na cozinha, e num anexo de pedra antigo mesmo ao lado.
            </p>
          </Revelar>
          <Revelar atraso={0.08} className="md:col-span-6 lg:col-span-6 lg:col-start-7">
            <Foto
              ergue={0}
              src="/fotos/fachada-04.jpg"
              alt="A entrada da casa de granito, com escadas de pedra, sebes de cada lado e o estacionamento em frente"
              recorte="aspect-[4/3]"
              foco="60% 45%"
              sizes="(max-width: 767px) 92vw, 560px"
              legenda="Granito à entrada da casa."
            />
          </Revelar>
        </div>

        <div className="mt-16 grid gap-12 md:mt-12 md:grid-cols-12 md:gap-10">
          <Revelar className="md:col-span-8">
            <Foto
              ergue={0}
              src="/fotos/sala-03.jpg"
              alt="A sala com sofás vermelhos, parede de pedra e uma janela grande aberta para o vale e as serras"
              recorte="aspect-[3/2]"
              foco="50% 45%"
              sizes="(max-width: 767px) 92vw, 760px"
              legenda="Uma janela grande que volta a dar para o vale."
            />
          </Revelar>
          <Revelar atraso={0.08} className="md:col-span-4 md:self-end">
            <p className="font-display text-[1.6rem] leading-[1.3] md:text-[1.85rem]">
              Na sala, uma lareira de pedra e uma janela grande que volta a dar para o vale.
            </p>
            <Foto
              className="mt-10 w-[70%] md:w-[80%]"
              ergue={0.08}
              src="/fotos/sala-02.jpg"
              alt="A sala com parede de pedra, lareira de canto, sofás vermelhos e móvel de madeira"
              recorte="aspect-[3/4]"
              foco="35% 50%"
              sizes="(max-width: 767px) 64vw, 300px"
              legenda="Na sala, uma lareira de pedra."
            />
          </Revelar>
        </div>

        <div className="mt-16 grid gap-12 md:mt-12 md:grid-cols-12 md:items-start md:gap-10">
          <Revelar className="md:col-span-5 md:col-start-2">
            <Foto
              ergue={0.04}
              src="/fotos/refeicoes-01.jpg"
              alt="A mesa de refeições de madeira junto à churrasqueira interior de tijolo, com a porta aberta para o jardim"
              recorte="aspect-[4/3]"
              foco="50% 50%"
              sizes="(max-width: 767px) 92vw, 480px"
              legenda="A mesa, junto à churrasqueira de tijolo."
            />
          </Revelar>
          <Revelar atraso={0.08} className="md:col-span-5 md:col-start-8 md:pt-6">
            <p>A mesa de refeições fica junto a uma churrasqueira interior de tijolo: há grelha lá fora e cá dentro.</p>
            <p className="mt-4">
              A cozinha tem máquina de lavar loiça, forno, micro-ondas, torradeira, chaleira e máquina de café. Há Wi-Fi gratuito, ar
              condicionado, televisão e máquina de lavar roupa.
            </p>
          </Revelar>
        </div>

        <Passagem className="mt-16 md:mt-12">Ao fim do dia, três quartos.</Passagem>
      </div>
    </Folha>
  );
}
