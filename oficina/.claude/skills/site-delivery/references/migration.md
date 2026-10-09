# Migração

## Extrair antes de tocar

```bash
node scripts/crawl-old-site.js --url https://dominio.pt --out ./legado
```

Produz `legado/inventario.json` (todos os URLs, títulos, estado) e `legado/content/*.md`.

Se o site antigo for pesado em JavaScript, o crawler usa Playwright e espera pelo `domcontentloaded`. Se for HTML estático, `wget --mirror --convert-links --page-requisites` é mais rápido e igualmente válido.

Guarda também: imagens em uso, PDFs (muitos sites profissionais têm documentos ligados que ninguém se lembra), e o `robots.txt` e `sitemap.xml` antigos.

## Inventário de URLs

Cruza três fontes, porque nenhuma é completa:

1. O crawl (o que está ligado internamente)
2. O `sitemap.xml` antigo (o que o dono achava que existia)
3. A Search Console do cliente, se ele tiver acesso (o que o Google **de facto** indexou, incluindo páginas órfãs que ninguém liga)

A terceira é a mais valiosa e a mais esquecida. Páginas órfãs com tráfego são frequentes em sites antigos.

## Mapa de redirects

Uma linha por URL antigo. Sem exceções.

```ts
// next.config.ts
async redirects() {
  return [
    { source: '/index.php',   destination: '/',                  permanent: true },
    { source: '/areas.html',  destination: '/areas-de-pratica',  permanent: true },
    { source: '/contactos.php', destination: '/contactos',       permanent: true },
  ];
}
```

- `permanent: true` gera 301 e transfere a autoridade acumulada. Um 302 não transfere.
- **Um salto só.** Cadeias de redirects perdem sinal e velocidade.
- Se a página deixou de existir, aponta para a mais próxima em assunto — categoria, secção-mãe. Mandar tudo para a homepage é interpretado como página inexistente e desperdiça o redirect.
- Mantém os slugs antigos quando forem bons. Mudar `/servicos` para `/o-que-fazemos` por gosto é destruir valor por estética.

Verifica antes de lançar:

```bash
node scripts/check-redirects.js --inventario ./legado/inventario.json --base https://preview-url
```

## DNS — a operação de maior risco

Um domínio não serve só o site. Serve também o email, a verificação de domínio de várias plataformas, e por vezes ferramentas internas. Apontar o domínio para um novo alojamento sem cuidado **desliga o email da empresa**.

Para um advogado, um médico ou qualquer negócio onde chegam prazos por email, isto não é um incidente técnico — é um dano real.

### Antes

```bash
node scripts/dns-snapshot.js --dominio dominio.pt --out ./legado/dns.json
```

Guarda A, AAAA, CNAME, MX, TXT, NS e SOA. Este ficheiro é o que te permite reverter.

Se o TTL for alto (3600s ou mais), **baixa-o para 300 uns dias antes** da mudança. Assim, se algo correr mal, a reversão propaga-se em minutos em vez de horas.

### A regra

Altera **apenas os registos A e CNAME** que apontam para o site.

Nunca toques em:
- **MX** — encaminhamento de email
- **TXT** com SPF, DKIM ou DMARC — autenticação de email; mexer aqui manda o email do cliente para spam
- **CNAME** de verificação de serviços (`_domainconnect`, verificações do Google, Microsoft, etc.)
- Qualquer registo que não reconheças

### Mudança de nameservers

Se transferires os nameservers para outro fornecedor (Cloudflare, Vercel), **todos os registos passam a ser geridos lá**. Isso significa que tens de recriar manualmente todos os MX e TXT antes de fazer a troca, ou o email morre no instante da propagação.

Preferir sempre apontar só os registos A/CNAME no fornecedor atual, em vez de mudar nameservers. Menos elegante, muito mais seguro.

### Quando não fazer tu

Se o cliente tem email no domínio e tu não tens experiência com a interface do fornecedor dele, **prepara a instrução escrita e deixa o cliente ou o suporte do fornecedor executar**. Escreve exatamente que registos mudar, para que valores, e que registos não tocar.

Perder o site por umas horas é embaraçoso. Perder o email é outra categoria de problema.

### Depois

Pela ordem:

1. Confirmar que o site responde no domínio, com e sem `www`
2. **Enviar e receber um email de teste** — antes de qualquer outra coisa
3. Verificar que o SSL foi emitido
4. Correr `check-redirects.js` contra o domínio real, não contra o preview
5. Submeter o novo sitemap na Search Console
6. Só agora avisar o cliente que está no ar

Mantém o alojamento antigo ativo pelo menos duas semanas. É a única forma real de reverter.
