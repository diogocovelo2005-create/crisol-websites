# Deploy Workflow — GitHub → Vercel

Workflow completo desde "tenho código no meu computador" até "site online com domínio próprio".

## Passo 1 — Preparar repositório local

Dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "initial commit"
```

Adiciona `.gitignore` (já vem com `create-next-app`, confirma que tem):
```
node_modules
.next
.env.local
.env
.vercel
```

**Nunca faças commit de `.env.local`**.

## Passo 2 — Criar repositório no GitHub

1. Vai a https://github.com/new
2. Nome do repo (e.g., `barbearia-site`)
3. **Private** (a não ser que queiras open-source)
4. **NÃO** marques "Initialize with README" (já tens código local)
5. Clica "Create repository"

GitHub mostra os comandos. Copia e cola:

```bash
git remote add origin https://github.com/teu-username/barbearia-site.git
git branch -M main
git push -u origin main
```

Se der erro de autenticação, configura:
```bash
gh auth login    # se tiveres GitHub CLI
# OU usa um Personal Access Token: github.com/settings/tokens
```

## Passo 3 — Deploy na Vercel

1. Vai a https://vercel.com/signup
2. Faz signup com a **mesma conta GitHub**
3. Clica "Add New..." → "Project"
4. Vercel mostra os teus repos do GitHub — escolhe `barbearia-site`
5. Clica "Import"
6. Vercel deteta Next.js automaticamente. Configurações:
   - Framework: **Next.js** (auto-detetado)
   - Build command: `pnpm build` (deteta automaticamente se tiveres `pnpm-lock.yaml`)
   - Output: `.next` (default)
7. **Environment Variables:** Se usares Supabase ou similar, adiciona aqui as variáveis de `.env.local`
8. Clica "Deploy"

Em 1-2 minutos tens um URL: `barbearia-site-abc123.vercel.app`

## Passo 4 — Workflow de atualizações

Daqui em diante, é só:

```bash
# Fazes mudanças no código
git add .
git commit -m "descrição do que mudou"
git push
```

A Vercel deteta o push automaticamente e faz redeploy. Em 60 segundos está online.

**Cada Pull Request gera um preview deployment** — URL único onde podes ver as mudanças antes de fazer merge para `main`.

## Passo 5 — Domínio personalizado

> ⚠ **Só para domínios novos.** Se o domínio já existe e é do cliente, não
> sigas estes passos: vai à skill `site-delivery`, corre primeiro o
> `dns-snapshot.js` e lê `references/migration.md`. Um domínio ativo
> costuma ter MX e TXT a servir o email da empresa, e mexer nos registos
> sem os preservar deixa o cliente sem email.

1. Compra domínio (sugestões: Namecheap, Porkbun, Cloudflare Registrar)
2. Na Vercel: Project Settings → Domains → Add
3. Adiciona o teu domínio (e.g., `minhabarbearia.pt`)
4. Vercel mostra registos DNS para configurar:
   - **Apex domain** (`minhabarbearia.pt`): A record → `76.76.21.21`
   - **www subdomain**: CNAME → `cname.vercel-dns.com`
5. Configura os registos no painel do teu registrar
6. Vercel emite certificado SSL automaticamente (Let's Encrypt). Em 5-30 minutos está pronto.

## Passo 6 — Analytics e monitoring (opcional gratuito)

Na Vercel, ativa:
- **Web Analytics** (gratuito, RGPD-friendly, não usa cookies)
- **Speed Insights** (Core Web Vitals em tempo real)

```bash
pnpm add @vercel/analytics @vercel/speed-insights
```

```tsx
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

## Tier gratuito Vercel — o que cobre

Para sites de negócio típicos:
- 100GB bandwidth/mês (cobre milhares de visitantes)
- Builds ilimitados
- Preview deployments ilimitados
- SSL gratuito
- Edge network global
- Web Analytics

**Quando precisas de upgrade ($20/mês Pro):**
- Mais de 100GB bandwidth (sites muito visitados)
- Equipa com várias pessoas a fazer deploy
- Domínios password-protected
- Analytics avançado

A maioria dos sites de negócio nunca passa do tier gratuito.

## Troubleshooting comum

**Build falha na Vercel mas funciona local:**
- Verifica versão Node: adiciona `"engines": { "node": "22.x" }` ao `package.json`
- Falta variável de ambiente? Vai a Project Settings → Environment Variables

**Site mostra 404 em rotas dinâmicas:**
- Confirma que tens `generateStaticParams` em routes `[slug]`
- Ou muda para `dynamic = 'force-dynamic'` na page

**Imagens não carregam:**
- Adiciona o domínio em `next.config.ts` → `images.remotePatterns`

**Fontes Google demoram a carregar:**
- Usa `next/font/google`, nunca `<link>` direto

## Alternativas a considerar

A Vercel é a default, mas tens opções:

| Plataforma | Quando faz sentido |
|---|---|
| **Vercel** | Default. Next.js otimizado. |
| **Netlify** | Similar à Vercel, ligeiramente menos features para Next.js |
| **Cloudflare Pages** | Tier gratuito mais generoso, edge global |
| **Railway** | Quando precisas de backend persistente (Postgres + API) |
| **Self-hosted (VPS)** | Só se precisares de controlo total |

Para sites de negócio, fica na Vercel. Não vale a pena complicar.
