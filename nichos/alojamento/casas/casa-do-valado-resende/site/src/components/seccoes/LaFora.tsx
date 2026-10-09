import Folha from '@/components/Folha';
import Foto from '@/components/Foto';
import DiaNoJardim from '@/components/DiaNoJardim';
import Passagem from '@/components/Passagem';
import Revelar from '@/components/Revelar';
import Titulo from '@/components/Titulo';
import Voz from '@/components/Voz';

/*
  2 · Lá fora, de frente para o vale. O momento forte, em fundo de
  salva (o verde das sebes, aclarado).

  Abre com a passagem do primeiro ecrã e com o vale: a frase, uma linha
  nossa em grande e a foto legendada ao lado. Depois um dia no jardim
  (DiaNoJardim): piscina, deck e churrasqueira a ecrã inteiro, a
  sucederem-se com o scroll, com o texto sobre a foto. Uma só citação,
  no deck. Fecha no painel azul-petróleo com a passagem para dentro (a
  piscina com a casa ao fundo passou a ser o fundo de "Escolher as
  datas").
*/


export default function LaFora() {
  return (
    <Folha id="fora" rotulo="t-fora" className="bg-salvia">
      <Passagem className="pt-14 md:pt-12">Comecemos por onde começam os hóspedes: pela vista.</Passagem>

      <div className="mx-auto max-w-[1280px] px-5 pb-14 pt-14 sm:px-8 md:pb-12 md:pt-12 lg:px-16">
        {/* o vale: texto e uma linha nossa ao lado da foto grande, legendada */}
        <div className="grid gap-12 md:grid-cols-12 md:items-end md:gap-10">
          <Revelar className="md:col-span-5">
            <h2 id="t-fora" className="titulo-seccao [&_em]:text-barro">
              <Titulo texto="Lá fora, *de frente para o vale*" />
            </h2>
            <p className="mt-7 max-w-[40ch]">
              O vale vê-se de quase todo o lado: do deck, da piscina, da janela da sala.
            </p>
            <Voz className="mt-8 max-w-[22ch]" texto="Encostas, serras, e espaço para o olhar ir longe." tamanho="text-[1.6rem] leading-[1.3] md:text-[2rem]" />
          </Revelar>
          <Revelar atraso={0.08} className="md:col-span-7">
            <Foto
              src="/fotos/vista-03.jpg"
              alt="O vale e as encostas vistos da casa, com casas dispersas ao longe e árvores em primeiro plano"
              recorte="aspect-[4/3] md:aspect-[5/4]"
              foco="50% 50%"
              sizes="(max-width: 767px) 92vw, 700px"
              legenda="Vale, encostas e serras. É isto que se vê daqui."
            />
          </Revelar>
        </div>
      </div>

      {/* um dia no jardim: piscina, deck e churrasqueira, a ecrã inteiro, guiado pelo scroll */}
      <DiaNoJardim />

      {/* a passagem para dentro */}
      <aside className="bg-floresta px-6 pb-16 pt-14 text-center text-creme md:pb-14 md:pt-12" aria-label="Passagem para dentro de casa">
        <Passagem escuro>
          E quando apetece entrar, a casa é de pedra.
        </Passagem>
      </aside>
    </Folha>
  );
}
