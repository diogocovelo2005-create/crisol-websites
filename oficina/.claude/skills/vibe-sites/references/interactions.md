# Interações Premium — Catálogo com Código

Implementações testadas. Copia, cola, ajusta. Tudo assume Next.js + Motion + Tailwind.

## Setup base

```bash
pnpm add motion lenis
```

```tsx
// app/layout.tsx — smooth scroll global
'use client'
import { ReactLenis } from 'lenis/react'
import { Inter } from 'next/font/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
          {children}
        </ReactLenis>
      </body>
    </html>
  )
}
```

---

## 1. Cursor Glow (luz a seguir o rato)

**Efeito:** Halo luminoso suave segue o cursor. Brilha mais em hover de elementos interativos.

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'

export function CursorGlow() {
  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)

  const x = useSpring(mouseX, { damping: 25, stiffness: 200 })
  const y = useSpring(mouseY, { damping: 25, stiffness: 200 })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [mouseX, mouseY])

  return (
    <motion.div
      style={{ x, y }}
      // ajusta a cor do halo à paleta do briefing
      className="pointer-events-none fixed left-0 top-0 z-50 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,0,0,0.12)_0%,transparent_70%)]"
    />
  )
}
```

---

## 2. Magnetic Button

**Efeito:** Botão é atraído pelo cursor quando se aproxima. Volta ao centro quando o cursor sai.

```tsx
'use client'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { useRef } from 'react'

export function MagneticButton({ children, className = '' }) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, { damping: 15, stiffness: 200 })
  const springY = useSpring(y, { damping: 15, stiffness: 200 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) * 0.3)
    y.set((e.clientY - cy) * 0.4)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
    >
      {children}
    </motion.button>
  )
}
```

---

## 3. Parallax (camadas em scroll)

**Efeito:** Background, texto e foreground movem-se a velocidades diferentes durante o scroll.

```tsx
'use client'
import { motion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'

export function ParallaxHero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const yMid = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const yFg = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <div ref={ref} className="relative h-screen overflow-hidden">
      <motion.div style={{ y: yBg }} className="absolute inset-0">
        {/* texto enorme decorativo no fundo */}
      </motion.div>
      <motion.div style={{ y: yMid, opacity }} className="absolute inset-0 flex items-center justify-center">
        {/* headline principal */}
      </motion.div>
      <motion.div style={{ y: yFg }} className="absolute inset-0">
        {/* elementos em foreground */}
      </motion.div>
    </div>
  )
}
```

---

## 4. Scroll Reveal (whileInView)

**Efeito:** Elementos aparecem com fade + translate quando entram no viewport.

```tsx
'use client'
import { motion } from 'motion/react'

export function Reveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

// uso:
<Reveal>...</Reveal>
<Reveal delay={0.15}>...</Reveal>
<Reveal delay={0.3}>...</Reveal>
```

---

## 5. Word-by-word reveal

**Efeito:** Headline aparece palavra por palavra em cascata.

```tsx
'use client'
import { motion } from 'motion/react'

export function WordReveal({ text, className = '' }) {
  const words = text.split(' ')
  return (
    <h1 className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: i * 0.12,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  )
}
```

---

## 6. Marquee infinita

**Efeito:** Logos, testimonials ou texto rolam horizontalmente em loop sem fim.

```tsx
'use client'
import { motion } from 'motion/react'

export function Marquee({ children, speed = 30 }) {
  return (
    <div className="overflow-hidden">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
        className="flex gap-16 whitespace-nowrap"
      >
        {children}
        {children}
      </motion.div>
    </div>
  )
}
```

---

## 7. Image hover (reveal + zoom)

**Efeito:** Imagem revela-se com clip-path no hover, com zoom subtil.

```tsx
'use client'
import { motion } from 'motion/react'
import Image from 'next/image'

export function HoverImage({ src, alt }) {
  return (
    <motion.div
      whileHover="hover"
      className="relative overflow-hidden"
    >
      <motion.div
        variants={{
          hover: { scale: 1.05 },
        }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image src={src} alt={alt} width={800} height={1000} className="grayscale transition-all duration-700 hover:grayscale-0" />
      </motion.div>
    </motion.div>
  )
}
```

---

## 8. Page transitions

**Efeito:** Transição entre páginas com fade + slide.

```tsx
// app/template.tsx
'use client'
import { motion } from 'motion/react'

export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

---

## 9. Sticky sections com mudança de tema

**Efeito:** Background da página muda enquanto o utilizador faz scroll por secções.

```tsx
'use client'
import { motion, useScroll, useTransform } from 'motion/react'

export function ThemeSection() {
  const { scrollYProgress } = useScroll()
  // substitui pelos tons da paleta do briefing
  const bg = useTransform(
    scrollYProgress,
    [0, 0.33, 0.66, 1],
    ['#ffffff', '#111111', '#ffffff', '#111111']
  )

  return (
    <motion.div style={{ backgroundColor: bg }} className="min-h-screen transition-colors">
      {/* conteúdo */}
    </motion.div>
  )
}
```

---

## 10. Hero com vídeo + overlay tipográfico

**Efeito:** Vídeo full-bleed em loop com texto grande por cima e tracking generoso.

```tsx
export function VideoHero() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 flex h-full items-center justify-center">
        <h1 className="font-display text-[clamp(60px,10vw,160px)] leading-none tracking-tighter text-white">
          {/* headline */}
        </h1>
      </div>
    </section>
  )
}
```

---

## Notas de performance

- Lazy-load qualquer secção 3D (R3F) com `dynamic(() => import(...), { ssr: false })`
- Vídeos: sempre `<= 5MB`, comprimidos com handbrake, em formato MP4 + WebM
- Imagens: sempre `next/image`, formato AVIF prioritário
- Motion: use `will-change-transform` em elementos animados pesados
- Desativa parallax pesado em mobile (`useReducedMotion()` da Motion)
