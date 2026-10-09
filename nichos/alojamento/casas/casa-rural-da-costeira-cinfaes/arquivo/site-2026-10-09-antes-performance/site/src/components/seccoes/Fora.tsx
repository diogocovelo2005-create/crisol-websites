import Revelar from '@/components/Revelar';
import Passagem from '@/components/movimento/Passagem';
import Plano from '@/components/movimento/Plano';

/* 3. O dia lá fora (B): três planos seguidos, com o texto dentro da foto,
   e a frase que faz a passagem para a sala. A citação da Tarsila saiu
   (Diogo, 08/10); o almoço tem o texto à direita, a pedido dele.

   A piscina-01 do B mostrava o jacúzi (não se pode mostrar): o almoço
   passa para a piscina-04, que tem o alpendre do churrasco por cima do
   muro. A piscina-05 foi para o primeiro ecrã; a manhã fica com a
   piscina-06, a que estava no primeiro ecrã do B. */
const planos = [
  {
    foto: '/fotos/piscina-06.jpg',
    alt: 'A piscina comprida com trampolim, a casa de granito à esquerda e a encosta ao fundo',
    foco: '50% 50%',
    quando: 'De manhã,',
    o_que: 'a piscina.',
    texto: 'Uma piscina exterior com trampolim e espreguiçadeiras, com a casa logo ao lado.',
  },
  {
    foto: '/fotos/piscina-04.jpg',
    alt: 'A piscina e, por cima do muro de pedra, o alpendre do churrasco com a mesa, e a torre da casa',
    foco: '50% 40%',
    quando: 'Ao almoço,',
    o_que: 'o fogo.',
    texto: 'Churrasqueira, forno a lenha e fogão, com uma mesa para comer ao ar livre.',
  },
  {
    foto: '/fotos/jogos-01.jpg',
    alt: 'A zona coberta com a mesa de bilhar e os matraquilhos',
    foco: '50% 50%',
    quando: 'À tarde,',
    o_que: 'a desforra.',
    texto: 'Numa zona coberta, uma mesa de bilhar e matraquilhos.',
  },
];

export default function Fora() {
  return (
    <section id="fora" className="scroll-mt-20">
      <div className="mx-auto grid max-w-[1440px] gap-7 px-6 pb-16 md:px-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <Revelar>
          <h2 className="titulo" style={{ ['--titulo' as string]: 'clamp(2.9rem, 8.8vw, 8.8rem)' }}>
            Um dia inteiro <em>cá fora</em>
          </h2>
        </Revelar>
        <p className="rotulo">Em três tempos</p>
      </div>

      {/* cada tempo escurece mais ao sair: o dia a andar para o fim da tarde */}
      {planos.map((p, i) => (
        <Plano key={p.foto} p={p} primeiro={i === 0} fim={[0.35, 0.45, 0.6][i]} direita={i === 1} />
      ))}

      <div className="mx-auto max-w-[1440px] px-6 pb-[72px] pt-16 text-center md:px-10">
        <Passagem className="passagem">Quando o sol baixa, a casa chama para dentro.</Passagem>
      </div>
    </section>
  );
}
