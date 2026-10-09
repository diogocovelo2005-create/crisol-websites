---
name: vibe-sites
description: Stack de desenvolvimento para criar websites via vibe coding — landing pages, sites de negócio, web apps de marketing. Use sempre que o utilizador pedir para criar, prototipar, melhorar ou fazer deploy de qualquer site/landing page/web. Aciona com pedidos como "faz-me um site", "preciso de uma landing page", "cria um website para X", "site interativo", "site com animações", mesmo que não mencione tecnologias específicas. Esta skill define APENAS o stack técnico e o processo de desenvolvimento (Next.js + Tailwind + Motion + Lenis + shadcn/ui, 3D, média imagem/vídeo por IA + stock + otimização, Lottie/Rive, movimento com propósito, setup, estrutura, deploy GitHub→Vercel). NÃO define estética, paleta de cores, tipografia nem direção de design — essas decisões vêm sempre do prompt do utilizador. Use proativamente sempre que houver intenção de criar presença web.
---

# Vibe Sites — Stack de Desenvolvimento

Esta skill define **com que ferramentas construir** sites e **como** os montar e publicar.

> **Fronteira com a `site-delivery`.** O Passo 5 do `deploy-workflow.md`
> assume um **domínio novo**, comprado agora. Se o cliente já tem domínio,
> **para** e usa a `site-delivery`: um domínio existente serve também o
> email, e apontá-lo sem cuidado desliga o email da empresa. Em qualquer
> desacordo sobre DNS, nameservers, MX ou redirects, **decide a
> `site-delivery`**, não esta skill.

**Não define design.** Estética, paleta de cores, tipografia, tom, copy e conteúdo vêm sempre do prompt do utilizador. Se o utilizador não os indicar, **pergunta** — não assumas um look por defeito.

## Stack tecnológico canónico

Não desvies disto sem razão técnica forte. Cada departamento de produção de um site está coberto:

### Núcleo
| Camada | Tecnologia | Notas |
|---|---|---|
| Framework | **Next.js (App Router)** | SSG/ISR + SEO out of the box. |
| Linguagem | **TypeScript** | Sempre. |
| Styling | **Tailwind CSS v4** | Config via `@theme` no CSS. |
| Componentes | **shadcn/ui** | Base para botões/formulários. |
| Icons | **Lucide React** | Tree-shakeable. |
| Fontes | **next/font/google** | Auto-otimiza, evita FOUT. |
| Forms | **react-hook-form + zod** | Validação tipada. |
| Hosting | **Vercel** + GitHub | Gratuito, deploy automático. |

### Movimento & 3D
| Camada | Tecnologia | Notas |
|---|---|---|
| Animação | **Motion** (ex-Framer Motion) | Scroll, hover, transições. Com **propósito** (ver secção). |
| Smooth scroll | **Lenis** | `lenis/react`, wrapper client. |
| Animação vetorial | **Lottie** (lottie-react) / **Rive** | Micro-animações leves — preferir a vídeo quando possível. |
| 3D (opcional) | **React Three Fiber + drei** (código) / **Spline** (no-code) | Lazy-load com `dynamic(..., { ssr: false })`. |

### Média — imagem & vídeo
| Camada | Tecnologia | Notas |
|---|---|---|
| Entrega | **next/image** + `<video>` | AVIF/WebP, lazy-load, sem layout shift. |
| Imagem IA (pago) | **Midjourney**, **Flux**, **Recraft** (brand/vetor), **Ideogram** (texto em imagem) | Qualidade máxima, à medida da marca. |
| Imagem IA (grátis) | **Hugging Face** FLUX.1-schnell · **Cloudflare Workers AI** (Flux) · **Google AI Studio** (Imagen) · **Pollinations** (c/ token) | Sem custo; requer chave/registo gratuito. Escalável e personalizável por prompt. |
| Vídeo IA | **Runway**, **Kling**, **Luma**, **Veo** | Hero loops, b-roll curto. |
| Conectores (se disponíveis) | **Higgsfield** (imagem/vídeo IA), **Canva** (composição), **Google Drive** (assets) | Conduzidos via MCP após autenticação. |
| Stock seguro (grátis) | **Unsplash**, **Pexels** (foto+vídeo), **Coverr**, **Mixkit** | Tratar (duotone/grão/grading) para não parecer stock. |
| Otimização | **ffmpeg / Handbrake** | Vídeo → MP4 + WebM, **< 5 MB**, `preload="metadata"`. |

### Conteúdo & dados (opcional)
| Camada | Tecnologia | Notas |
|---|---|---|
| CMS | **Sanity** / **Payload** / **MDX** | Quando o cliente precisa de editar conteúdo. |
| Backend | **Supabase** | Auth + Postgres + Storage. |
| Email | **Resend** | Formulários de contacto. |
| Analytics/SEO | **Vercel Analytics + Speed Insights**, `next-sitemap`, JSON-LD | Medir + indexar. |

**Evita (por razões técnicas):**
- Create React App, Gatsby (obsoletos para este uso)
- jQuery
- styled-components, emotion (Tailwind cobre)
- GSAP no início (Motion chega; GSAP só para SVG morphing complexo)
- Vídeo pesado quando uma animação Lottie/Rive resolve

## Movimento com propósito

Animação serve uma **função**, nunca decoração. Antes de animar algo, identifica o porquê:
- **Feedback** — sinalizar que algo é interativo/clicável (ex.: hover que revela uma seta de avanço).
- **Hierarquia** — guiar o olhar para o que importa primeiro.
- **Continuidade** — ligar estados/transições para o utilizador não se perder.
- **Profundidade** — parallax/scroll que dá camadas ao conteúdo real.

Evita movimento que não comunica nada (ex.: botões magnéticos que fogem do cursor, fade-in genérico em tudo sem coreografia). Menos movimento, mas que signifique.

## Média no projeto

- Todo o site deve ter **âncoras visuais reais** (imagem/vídeo), não só tipografia — caso contrário fica genérico.
- Otimiza sempre: `next/image` para imagem; vídeo comprimido (< 5 MB, MP4+WebM, `muted loop playsInline`); Lottie/Rive para movimento vetorial leve.
- Centraliza os caminhos dos assets (ex.: em `src/lib/site.ts`) para serem fáceis de trocar — o cliente pode fornecer os seus.

## Ferramentas que o utilizador precisa de instalar

**Essencial (gratuito):**
1. **Node.js LTS** (22.x+) — https://nodejs.org
2. **Git** — https://git-scm.com
3. **IDE:** Cursor (cursor.com) ou VS Code
4. **Conta GitHub** (gratuita)
5. **Conta Vercel** (gratuita, liga ao GitHub)

**Opcional:** `pnpm` (`npm install -g pnpm`), Claude Code CLI para projetos grandes.

## Workflow

### Step 1 — Briefing
Antes de qualquer código, garante que tens:
- **O que é o site** (negócio, projeto, produto)
- **Estética e direção visual** — paleta, tipografia, tom. **A skill não os impõe**; se o utilizador não os deu, pergunta ou propõe opções para ele escolher.
- **Funcionalidades** (vitrine? marcações? menu? formulário? login?)
- **Conteúdo real ou placeholder?** Se placeholder, avisa que vais inventar copy plausível.

### Step 2 — Mockup primeiro
Mostra um mockup (artifact React num único ficheiro, ou uma secção do projeto) para iteração rápida antes de escalar. Só escalas para projeto completo depois de aprovada a direção.

### Step 3 — Projeto Next.js completo
Usa o setup canónico em `references/nextjs-setup.md`. Não inventes estrutura — usa o template.

### Step 4 — Deploy
Instruções passo-a-passo GitHub → Vercel em `references/deploy-workflow.md`. Adapta ao nível técnico do utilizador.

## Estrutura de pastas

Definida em `references/nextjs-setup.md` (estrutura `src/app`, `src/components`, `src/lib`). Usa-a como base.

## Notas técnicas importantes

- **Next.js muda entre versões.** Confirma a versão instalada e, se o projeto trouxer notas (ex.: `AGENTS.md`/docs locais em `node_modules/next/dist/docs/`), lê-as antes de escrever código. Não assumas APIs de memória.
- **Tailwind v4** usa `@import "tailwindcss"` e `@theme` no CSS — não há `tailwind.config.ts` por defeito.
- **Lenis** entra via wrapper client (`'use client'`) à volta dos `children` no layout.
- **Performance:** lazy-load qualquer cena 3D (R3F) com `dynamic(() => import(...), { ssr: false })`; `next/image` para todas as imagens; fontes via `next/font`.

## Direção visual via presets (não improvisar)

A skill define o stack; **o look vem sempre de um preset escolhido pela vibe**, nunca de improviso (improvisar arte → clichés). Um preset fixa: paleta (tokens de cor), par de fontes, nível de movimento e tratamento de imagem.

- Se o projeto tiver um catálogo de presets (ex.: `DESIGN.md` + `src/lib/presets.ts` no template), **usa-o e estende-o**.
- Se não houver, **propõe 2-3 presets concretos** (ou pede 1-2 referências ao utilizador) e **fixa um antes de escrever código**.
- Aplicar um preset = trocar os tokens em `globals.css` (`@theme`) + as fontes em `fonts.ts`. Muda tudo de uma vez.
- **Valida sempre no build de produção** (`next start`) a 1920px e 390px — o `@theme` do Tailwind v4 nem sempre recarrega por HMR no dev.

## Quando consultar referências

- **Montar o projeto Next.js** → `references/nextjs-setup.md` (estrutura + configs base)
- **Código de animações/interações** (se o utilizador as quiser) → `references/interactions.md` (snippets prontos: scroll reveal, parallax, cursor tracking, magnetic, marquee, etc.)
- **Deploy** → `references/deploy-workflow.md` (GitHub + Vercel)

Lê o ficheiro de referência em vez de responder de cabeça — o código nele está testado.
