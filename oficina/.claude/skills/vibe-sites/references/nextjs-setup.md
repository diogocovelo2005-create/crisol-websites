# Setup Next.js — Estrutura Canónica

## Criação inicial

```bash
pnpm create next-app@latest meu-site --typescript --tailwind --app --src-dir --import-alias "@/*"
cd meu-site
pnpm add motion lenis lucide-react
pnpm add -D @types/node
```

Resposta às prompts:
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind: **Yes**
- `src/` directory: **Yes**
- App Router: **Yes**
- Customize import alias: **No** (aceita default `@/*`)
- Turbopack: **Yes** (mais rápido em dev)

## Estrutura de pastas obrigatória

```
meu-site/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # root layout, fontes, smooth scroll
│   │   ├── page.tsx             # homepage
│   │   ├── globals.css          # tailwind + CSS vars
│   │   ├── template.tsx         # page transitions
│   │   ├── (marketing)/         # group para landing pages
│   │   │   ├── about/page.tsx
│   │   │   ├── services/page.tsx
│   │   │   └── contact/page.tsx
│   │   └── api/                 # se precisares de endpoints
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── sections/            # hero, services, footer, etc.
│   │   │   ├── hero.tsx
│   │   │   ├── services.tsx
│   │   │   ├── gallery.tsx
│   │   │   ├── testimonials.tsx
│   │   │   ├── contact.tsx
│   │   │   └── footer.tsx
│   │   └── interactions/        # cursor-glow, magnetic-button, reveal, etc.
│   │       ├── cursor-glow.tsx
│   │       ├── magnetic-button.tsx
│   │       ├── reveal.tsx
│   │       └── marquee.tsx
│   └── lib/
│       ├── utils.ts             # cn() helper do shadcn
│       └── fonts.ts             # next/font configs
├── public/
│   ├── images/
│   ├── videos/
│   └── favicon.ico
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## `src/lib/fonts.ts` (padrão técnico)

Escolhe as fontes conforme o briefing do utilizador — esta skill não prescreve fontes.
O padrão técnico é: uma fonte de display e uma de body, expostas como CSS variables
via `next/font/google`.

```ts
// Substitui os imports pelas fontes definidas no briefing.
import { /* DisplayFont, BodyFont */ } from 'next/font/google'

export const display = /* DisplayFont */({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const sans = /* BodyFont */({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})
```

## `src/app/layout.tsx`

```tsx
import type { Metadata } from 'next'
import { display, sans } from '@/lib/fonts'
import { ReactLenis } from 'lenis/react'
import './globals.css'

export const metadata: Metadata = {
  title: '[Nome do Negócio]',
  description: '[Descrição SEO]',
  openGraph: {
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-PT" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-background text-foreground antialiased">
        <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
          {children}
        </ReactLenis>
      </body>
    </html>
  )
}
```

## `src/app/globals.css`

Define os tokens de cor conforme o briefing — os valores abaixo são apenas
placeholders neutros. A paleta vem do utilizador, não desta skill.

```css
@import "tailwindcss";

@theme {
  /* Substituir pelos valores da paleta definida no briefing */
  --color-background: #ffffff;
  --color-foreground: #111111;
  --color-accent: #000000;
  --color-muted: rgba(17,17,17,0.55);
  --color-border: rgba(17,17,17,0.12);

  --font-display: var(--font-display), Georgia, serif;
  --font-sans: var(--font-sans), system-ui, sans-serif;
}

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    font-family: var(--font-sans);
  }
  h1, h2, h3, h4 {
    font-family: var(--font-display);
    font-weight: 400;
    letter-spacing: -0.02em;
  }
}

/* Custom selection */
::selection {
  background: var(--color-accent);
  color: var(--color-background);
}
```

## `next.config.ts`

```ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['motion', 'lucide-react'],
  },
}

export default config
```

## SEO essencial (metadata por página)

```tsx
// app/services/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Serviços | [Nome]',
  description: '[Descrição específica desta página]',
  alternates: { canonical: 'https://meu-site.pt/services' },
}
```

## Performance checklist final

Antes de fazer deploy, confirma:

- [ ] Todas as imagens usam `next/image` com `alt` descritivo
- [ ] Fontes carregadas via `next/font/google`
- [ ] Vídeos comprimidos (< 5MB) com `preload="metadata"`
- [ ] Metadata em todas as páginas (title, description, og)
- [ ] `lang="pt-PT"` no `<html>`
- [ ] Favicon e og-image gerados
- [ ] `npx @next/codemod` se vieres de versão antiga
- [ ] `pnpm build` corre sem erros nem warnings
- [ ] Lighthouse Performance > 90, Accessibility > 95, SEO 100

## Componentes base que deves criar primeiro

Por esta ordem:

1. `components/interactions/reveal.tsx` — usado em todo o lado
2. `components/interactions/magnetic-button.tsx` — para CTAs
3. `components/interactions/cursor-glow.tsx` — opcional mas premium
4. `components/sections/hero.tsx`
5. `components/sections/footer.tsx`
6. Depois as secções específicas do tipo de negócio

## Ligar a um backend (quando necessário)

Para sites com marcações, formulários complexos, login:

```bash
pnpm add @supabase/supabase-js @supabase/ssr
```

Adiciona em `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxx
```

Para formulários simples (contacto), basta uma API route + envio para Resend ou similar.
