import Image from 'next/image';
import Revelar from '@/components/Revelar';
import Passagem from '@/components/movimento/Passagem';
import { serra } from '@/lib/serra';

/* 2. A casa de perto (B): título alto e texto ao lado, depois o plano largo
   da fachada e o par pátio + passagem.

   A saída do primeiro ecrã acaba aqui: com movimento, esta secção sobe
   por cima do hero preso (margem negativa de um ecrã, por cima dele) e o
   topo dela é o perfil da frente da encosta, o sólido. Quando a crista
   passa, o título já vem logo atrás. Com movimento reduzido, fica no
   lugar dela, sem serra. */
export default function Patio() {
  return (
    <section id="casa" className="relative z-10 scroll-mt-20 bg-linho pt-[72px] motion-safe:mt-[calc(-1*max(100lvh,var(--hmin)))]">
      {/* o perfil da frente: a crista à altura do topo da secção (a metade de
          baixo do SVG cai sobre o espaço de cima, da mesma cor) */}
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 hidden h-[16lvh] w-full -translate-y-1/2 motion-safe:md:block">
        <path d={serra(4.1, 50, 48, 0.25)} fill="#e4e7df" />
      </svg>
      <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 hidden h-[9lvh] w-full -translate-y-1/2 motion-safe:block motion-safe:md:hidden">
        <path d={serra(4.1, 50, 48, 0.1)} fill="#e4e7df" />
      </svg>
      <div className="moldura grid gap-10 pb-14 lg:grid-cols-[1fr_22rem] lg:items-end">
        <Revelar>
          <p className="rotulo">A casa de perto</p>
          <h2 className="titulo mt-[18px]">
            Granito, uma torre e <em>um pátio com fonte</em>
          </h2>
        </Revelar>
        <Revelar atraso={0.03}>
          <p className="m-0 max-w-[34ch]">
            A casa principal foi recuperada em 2006, segundo a casa, preservando a traça original. Abriu a hóspedes em 2013.
          </p>
        </Revelar>
      </div>

      <div className="relative h-[58svh] min-h-[520px]">
        <Image
          src="/fotos/fachada-02.jpg"
          alt="A fachada de granito com o alpendre, a rede e o pátio empedrado"
          fill
          sizes="100vw"
          quality={85}
          className="object-cover"
          style={{ objectPosition: '50% 45%' }}
        />
      </div>

      <div className="mx-auto grid max-w-[1440px] items-end gap-8 px-6 pb-16 pt-12 md:px-10 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
        <div>
          <p className="mb-10 mt-0 max-w-[34ch]">
            À frente, um pátio empedrado com fonte e sofás de exterior. Debaixo do alpendre, uma rede à espera de quem chegar primeiro.
          </p>
          <Passagem className="passagem max-w-[18ch] lg:pb-2">Mas o dia passa-se lá fora, à volta da água.</Passagem>
        </div>
        <div className="relative aspect-[3/2]">
          <Image
            src="/fotos/fachada-04.jpg"
            alt="O pátio com a fonte de pedra e os sofás, com a torre à direita"
            fill
            sizes="(min-width: 1440px) 820px, (min-width: 1024px) 57vw, 100vw"
            className="object-cover"
            style={{ objectPosition: '50% 55%' }}
          />
        </div>
      </div>
    </section>
  );
}
