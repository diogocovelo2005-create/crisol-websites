import Botao from '@/components/Botao';
import Janela from '@/components/Janela';
import Revelar from '@/components/Revelar';
import Titulo from '@/components/Titulo';
import Voz from '@/components/Voz';
import { AIRBNB, BOOKING, casa } from '@/lib/casa';

/*
  6 · Escolher as datas. O fecho verde-sombra de C, com o botão em barro:
  os dois anúncios (não há reserva direta), os contactos para perguntas,
  as notas das plataformas (com a de quem recebe), a vontade de voltar que os hóspedes deixaram escrita e o
  registo. Sem hora de saída, capacidade nem preço (o contrato não os
  deixa afirmar).

  O fundo é a piscina com a casa (pedido do Diogo): entra como janela e
  abre-se com o scroll até encher o ecrã, e o conteúdo assenta por cima
  dela, num painel sólido (ver Janela).
*/
export default function Reservar() {
  const { telefone, email } = casa.contacto;
  return (
    <Janela
      id="reservar"
      rotulo="t-reservar"
      className="border-b border-linha bg-linho text-creme"
      src="/fotos/piscina-05.jpg"
      alt="A piscina entre relva, com uma palmeira e a fachada de granito da casa ao fundo"
      foco="50% 55%"
      legenda="Da água vê-se a casa de granito."
    >
      {/* o texto num painel verde-sombra sólido, com a foto à volta: sem véu
          nem mancha escura sobre a foto, e o contraste do fecho de sempre.
          Opaco e sem sombra: translúcido e com sombra grande, a passar por
          cima do fundo preso, dava frames de 50 a 67 ms */}
      <div className="px-3 pb-12 pt-12 sm:px-8 md:pb-12 md:pt-10">
      <div className="mx-auto max-w-[46rem] bg-floresta px-4 py-12 text-center sm:px-10 md:px-14 md:py-10">
        <Revelar>
          <h2 id="t-reservar" className="titulo-seccao text-osso [&_em]:text-barro-claro">
            <Titulo texto="Escolher *as datas*" />
          </h2>
          <p className="mx-auto mt-6 max-w-[36rem]">Reserva pelo Booking ou pelo Airbnb.</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Botao href={BOOKING} tom="ouro" className="w-full sm:w-auto">
              Ver disponibilidade · Booking
            </Botao>
            <Botao href={AIRBNB} tom="contorno-claro" className="w-full sm:w-auto">
              Ver no Airbnb
            </Botao>
          </div>
        </Revelar>

        <Revelar className="mt-10">
          <p className="text-folha">Alguma pergunta antes?</p>
          <div className="mt-3 flex flex-col items-center justify-center gap-3 font-display text-[1.2rem] sm:text-[1.35rem] md:flex-row md:gap-12 md:text-[1.5rem]">
            {telefone && (
              <a href={telefone.href} className="inline-block border-b border-barro-claro/50 py-1.5 transition-colors hover:border-barro-claro">
                {telefone.valor}
              </a>
            )}
            {email && (
              <a href={email.href} className="inline-block border-b border-barro-claro/50 py-1.5 transition-colors hover:border-barro-claro">
                {email.valor.split('@')[0]}<wbr />@{email.valor.split('@')[1]}
              </a>
            )}
          </div>
        </Revelar>

        <Revelar className="mx-auto mt-8 max-w-[40rem] border-t border-linha-clara pt-7">
          <p className="text-base text-folha">No Booking, 9,2 em 10, com 11 avaliações (outubro de 2026).</p>
          <p className="mt-3 font-display text-[1.35rem] leading-snug text-osso md:text-[1.6rem]">
            Na mesma base de 11 avaliações, quem recebe tem 10 em Funcionários, e a casa 9,8 em Localização e 9,7 em Limpeza.
          </p>
          <p className="mt-3 text-base text-folha">No Google, 4,7 em 5, com 15 avaliações (outubro de 2026).</p>
        </Revelar>

        <Revelar className="mx-auto mt-8 max-w-[40rem]">
          <Voz
            escuro
            texto="O proprietário Manuel é muito simpático e prestável. Orientou-nos no espaço, na vila e aconselhou-nos vários locais."
            quem="Catarina · Booking"
            tamanho="text-[1.3rem] leading-[1.42] md:text-[1.5rem]"
          />
        </Revelar>

        <Revelar className="mx-auto mt-10 max-w-[40rem] border-t border-linha-clara pt-10 md:mt-10">
          <Voz escuro texto="Quem visita uma vez quer sempre voltar" quem="Joaquim Pinto · Google" tamanho="text-[1.6rem] leading-[1.35] md:text-[2.1rem]" />
        </Revelar>

        <p className="mt-8 text-[0.875rem] tracking-[0.06em] text-folha">Alojamento Local, modalidade Moradia, registo RNAL 88302/AL.</p>
      </div>
      </div>
    </Janela>
  );
}
