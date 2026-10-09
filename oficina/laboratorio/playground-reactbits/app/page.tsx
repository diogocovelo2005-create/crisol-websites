'use client';

import Aurora from '@/components/Aurora';
import Beams from '@/components/Beams';
import BlurText from '@/components/BlurText';
import ClickSpark from '@/components/ClickSpark';
import CountUp from '@/components/CountUp';
import Dock from '@/components/Dock';
import DotGrid from '@/components/DotGrid';
import GlareHover from '@/components/GlareHover';
import GradientText from '@/components/GradientText';
import Iridescence from '@/components/Iridescence';
import Magnet from '@/components/Magnet';
import Particles from '@/components/Particles';
import ScrollReveal from '@/components/ScrollReveal';
import ShinyText from '@/components/ShinyText';
import Silk from '@/components/Silk';
import SplitText from '@/components/SplitText';
import SpotlightCard from '@/components/SpotlightCard';
import StarBorder from '@/components/StarBorder';
import TextType from '@/components/TextType';
import Threads from '@/components/Threads';
import TiltedCard from '@/components/TiltedCard';

/**
 * Playground do React Bits. Não é um site — é uma montra.
 *
 * Cada painel isola UM efeito, para se poder julgar sozinho em vez de
 * dentro de uma composição que o favorece. É essa a pergunta útil:
 * "isto serve para o projeto que tenho à frente?", e não "isto é giro?".
 */

function Painel({
  nome,
  nota,
  altura = 'h-72',
  children,
}: {
  nome: string;
  nota: string;
  altura?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
      <header className="flex items-baseline justify-between gap-4 border-b border-white/10 px-4 py-2.5">
        <h2 className="font-mono text-[13px] tracking-tight text-white">{nome}</h2>
        <p className="text-right text-[11px] leading-tight text-white/45">{nota}</p>
      </header>
      <div className={`relative ${altura} w-full`}>{children}</div>
    </section>
  );
}

const centrado = 'absolute inset-0 grid place-items-center p-6 text-center';

export default function Home() {
  return (
    <ClickSpark sparkColor="#fff" sparkCount={10} sparkRadius={18} duration={420}>
      <main className="min-h-dvh bg-[#060608] px-6 py-14 text-white">
        <div className="mx-auto max-w-6xl">
          <header className="mb-12">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
              site-builder · playground
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">React Bits</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
              21 componentes instalados pelo registry oficial. Clica em qualquer sítio da
              página — o <code className="text-white/80">ClickSpark</code> está ligado ao
              body inteiro. Cada painel isola um efeito para poder ser julgado sozinho.
            </p>
          </header>

          <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
            Texto
          </h3>
          <div className="mb-12 grid gap-4 sm:grid-cols-2">
            <Painel nome="BlurText" nota="motion · entrada palavra a palavra">
              <div className={centrado}>
                <BlurText
                  text="Advocacia em Viseu desde 2004"
                  className="text-2xl font-medium"
                  animateBy="words"
                  delay={120}
                />
              </div>
            </Painel>

            <Painel nome="SplitText" nota="gsap · entrada carácter a carácter">
              <div className={centrado}>
                <SplitText
                  text="Direito do Trabalho"
                  className="text-2xl font-medium"
                  splitType="chars"
                  delay={40}
                />
              </div>
            </Painel>

            <Painel nome="ShinyText" nota="css · brilho a atravessar">
              <div className={centrado}>
                <ShinyText text="Marcar consulta" className="text-2xl font-medium" speed={4} />
              </div>
            </Painel>

            <Painel nome="TextType" nota="máquina de escrever, com ciclo">
              <div className={centrado}>
                <TextType
                  className="text-2xl font-medium"
                  text={['Direito Penal', 'Direito da Família', 'Direito das Sucessões']}
                  typingSpeed={70}
                  pauseDuration={1400}
                  loop
                />
              </div>
            </Painel>

            <Painel nome="GradientText" nota="gradiente animado no texto">
              <div className={centrado}>
                <GradientText
                  className="text-2xl font-medium"
                  colors={['#a3132b', '#e8b4bc', '#a3132b']}
                  animationSpeed={6}
                >
                  Consulta online
                </GradientText>
              </div>
            </Painel>

            <Painel nome="CountUp" nota="contador com easing">
              <div className={centrado}>
                <p className="text-5xl font-semibold tabular-nums">
                  <CountUp to={2004} from={1990} duration={2.2} separator="" />
                </p>
              </div>
            </Painel>
          </div>

          <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
            Fundos <span className="normal-case tracking-normal">— WebGL, os mais pesados</span>
          </h3>
          <div className="mb-12 grid gap-4 sm:grid-cols-2">
            <Painel nome="Aurora" nota="ogl · o mais reconhecível de todos">
              <Aurora colorStops={['#a3132b', '#3a0d17', '#e8b4bc']} amplitude={1.1} speed={0.6} />
            </Painel>

            <Painel nome="Silk" nota="three · tecido, mais discreto">
              <Silk speed={4} scale={1.1} color="#5a1424" noiseIntensity={1.2} />
            </Painel>

            <Painel nome="Threads" nota="ogl · linhas reactivas ao rato">
              <Threads color={[0.64, 0.07, 0.17]} amplitude={1.4} distance={0.4} />
            </Painel>

            <Painel nome="Particles" nota="ogl · partículas em profundidade">
              <Particles particleCount={220} particleColors={['#ffffff', '#e8b4bc']} speed={0.12} />
            </Painel>

            <Painel nome="Beams" nota="three · feixes de luz">
              <Beams beamNumber={10} lightColor="#e8b4bc" speed={1.6} noiseIntensity={1.4} />
            </Painel>

            <Painel nome="Iridescence" nota="ogl · reage ao rato">
              <Iridescence color={[0.64, 0.2, 0.28]} speed={0.8} amplitude={0.14} />
            </Painel>

            <Painel nome="DotGrid" nota="canvas · grelha com física, mais leve">
              <DotGrid
                dotSize={4}
                gap={22}
                baseColor="#3a3a42"
                activeColor="#a3132b"
                proximity={110}
                shockRadius={220}
              />
            </Painel>

            <Painel nome="ScrollReveal" nota="gsap · revela ao scroll" altura="h-72 overflow-y-auto">
              <div className="px-8 py-10">
                <ScrollReveal enableBlur baseOpacity={0.1} blurStrength={4}>
                  Faz scroll dentro deste painel para veres o texto a ganhar foco palavra a
                  palavra à medida que sobe.
                </ScrollReveal>
              </div>
            </Painel>
          </div>

          <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
            Interacção
          </h3>
          <div className="mb-12 grid gap-4 sm:grid-cols-2">
            <Painel nome="SpotlightCard" nota="halo a seguir o cursor">
              <div className={centrado}>
                <SpotlightCard
                  className="w-full max-w-xs border border-white/10 bg-white/[0.03] p-6"
                  spotlightColor="rgba(163, 19, 43, 0.35)"
                >
                  <h4 className="mb-1.5 text-lg font-medium">Consulta no escritório</h4>
                  <p className="text-sm text-white/50">Passa o rato por cima.</p>
                </SpotlightCard>
              </div>
            </Painel>

            <Painel nome="TiltedCard" nota="inclinação 3D com o rato">
              <div className={centrado}>
                <TiltedCard
                  imageSrc="https://picsum.photos/seed/reactbits/400/280"
                  altText="Exemplo"
                  captionText="Inclina com o rato"
                  containerHeight="220px"
                  imageHeight="200px"
                  imageWidth="280px"
                />
              </div>
            </Painel>

            <Painel nome="Magnet" nota="o elemento é atraído pelo cursor">
              <div className={centrado}>
                <Magnet padding={90} magnetStrength={3}>
                  <span className="inline-block rounded-full bg-[#a3132b] px-7 py-3 text-sm font-medium">
                    932 803 710
                  </span>
                </Magnet>
              </div>
            </Painel>

            <Painel nome="GlareHover" nota="reflexo a varrer no hover">
              <div className={centrado}>
                <GlareHover
                  width="260px"
                  height="130px"
                  background="#111117"
                  borderColor="#2a2a33"
                  borderRadius="12px"
                  glareColor="#ffffff"
                  glareOpacity={0.22}
                >
                  <span className="text-sm text-white/70">Passa o rato</span>
                </GlareHover>
              </div>
            </Painel>

            <Painel nome="StarBorder" nota="borda animada">
              <div className={centrado}>
                <StarBorder color="#a3132b" speed="4s" thickness={2}>
                  Pedir marcação
                </StarBorder>
              </div>
            </Painel>

            <Painel nome="Dock" nota="ampliação estilo macOS">
              <div className="absolute inset-0">
                <Dock
                  items={[
                    { icon: <span className="text-lg">☎</span>, label: 'Telefone', onClick: () => {} },
                    { icon: <span className="text-lg">✉</span>, label: 'Email', onClick: () => {} },
                    { icon: <span className="text-lg">◎</span>, label: 'Mapa', onClick: () => {} },
                    { icon: <span className="text-lg">▤</span>, label: 'Áreas', onClick: () => {} },
                  ]}
                  panelHeight={64}
                  baseItemSize={44}
                  magnification={72}
                />
              </div>
            </Painel>
          </div>

          <footer className="border-t border-white/10 pt-6 text-xs leading-relaxed text-white/35">
            <p className="mb-1.5">
              Custo real desta página: <span className="text-white/60">gsap, three,
              @react-three/fiber, @react-three/drei, ogl, motion</span> — instalados como
              dependências dos componentes acima.
            </p>
            <p>
              Um fundo WebGL sozinho carrega <code>three</code> ou <code>ogl</code>. Os efeitos
              de texto em <code>motion</code> ou <code>gsap</code> são bem mais baratos.
            </p>
          </footer>
        </div>
      </main>
    </ClickSpark>
  );
}
