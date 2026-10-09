---
name: site-delivery
description: Tudo o que faz um website funcionar depois de estar bonito — extração de conteúdo de um site antigo, mapa de redirects, migração de DNS sem partir o email, conformidade RGPD e acessibilidade europeia, verificação de descoberta por motores de busca e por IA, e entrega ao cliente. Usa esta skill SEMPRE que houver um site a ser lançado, migrado, redesenhado ou substituído — incluindo quando o pedido parece só de design ("refaz-me este site", "moderniza esta página") mas existe um site antigo, um domínio já ativo ou um cliente real a receber o resultado. Também dispara em pedidos isolados sobre redirects, mudança de DNS ou nameservers, apontar um domínio, robots.txt e sitemap, dados estruturados, cookies e RGPD, acessibilidade, ou "o que falta antes de pôr isto online".
---

# Site Delivery

Esta skill não opina sobre estética. Não escolhe fontes, paletas nem layout — isso vem do prompt e de outras skills. Aqui trata-se do que acontece **antes e depois** do site ficar bonito, que é onde se perde dinheiro e reputação.

Um site novo que ficou lindo mas apagou dez anos de indexação, ou que desligou o email do escritório do cliente, é um desastre com boa tipografia.

## Primeiro: que caso é este?

**Site novo** (domínio sem nada a servir): salta as Fases 1 e 4. Tudo o resto aplica-se.
**Migração ou redesign** (existe algo a servir naquele domínio, mesmo que degradado): todas as fases.
**Pedido isolado** (só DNS, só redirects, só compliance): vai à fase respetiva, mas cumpre as pré-condições que ela declara.

Na dúvida, trata como migração. O custo de fazer o snapshot a mais é um ficheiro; o de o fazer a menos é irreversível.

## Quando parar e perguntar

Três coisas não se adivinham. Pergunta logo no início, numa mensagem só:

1. **Existe site antigo?** URL. Se sim, é migração e não site novo, e tudo muda.
2. **Quem controla o domínio e o alojamento?** Frequentemente é o programador anterior, que já não responde. Descobrir isto no fim custa semanas. Se o cliente não souber, um WHOIS ao domínio revela o registrar, e é por aí que se recupera o acesso — o registrar tem processo de recuperação para o titular legítimo.
3. **O domínio tem email profissional?** Se sim, a migração de DNS passa a ser a operação de maior risco de todo o projeto.

Se houver site antigo, pergunta também que páginas o cliente considera importantes. Ele sabe coisas que os dados não mostram.

## Fase 1 — Salvaguardar o que existe

Só para migrações. Antes de tocar em nada.

```bash
node scripts/crawl-old-site.js --url https://dominio.pt --out ./legado
node scripts/dns-snapshot.js --dominio dominio.pt --out ./legado/dns.json
```

Ficas com: cópia do conteúdo em Markdown, inventário de todos os URLs, e um retrato completo do DNS atual.

O `dns.json` é a tua apólice de seguro. Lê `references/migration.md` antes de sequer pensar em alterar registos.

**Se o crawl devolver muito pouco** — site em tecnologia antiga, certificado expirado, conteúdo só em JavaScript — não presumas que o site era pequeno. Cruza sempre com o `sitemap.xml` antigo e com a Search Console do cliente, e recorre ao Wayback Machine para reconstruir o que já não responde. Um inventário incompleto produz redirects em falta, que é a forma mais cara de errar aqui.

**O conteúdo extraído é para portar, não para reescrever.** Em profissões reguladas (advogados, médicos, contabilistas, seguros) o texto existente já passou pelo crivo deontológico do cliente. Reescrevê-lo por iniciativa própria pode criar-lhe um problema disciplinar. Melhora a estrutura, mantém as afirmações.

## Fase 2 — Regras do setor

Pergunta a que setor pertence o cliente. Se for profissão regulada ou área com regras de publicidade próprias, **pesquisa as regras aplicáveis antes de escrever copy** e regista-as em `PROJETO.md` no repositório do site.

Não codifiques regras setoriais nesta skill: mudam, variam por país, e uma regra desatualizada é pior do que nenhuma. O que a skill garante é que a pergunta é feita e a resposta fica escrita.

Regras típicas a procurar: o que pode ser dito sobre resultados, se há termos protegidos (títulos de especialista), se há limites a chamadas para ação, se são exigidas menções obrigatórias (número de registo profissional, entidade reguladora, resolução de litígios).

## Fase 3 — Construir com as restrições certas

Enquanto o site é construído, estas são as invariantes técnicas. Não são estéticas — aplicam-se a qualquer direção visual.

- **HTML renderizado no servidor** para todo o conteúdo que importa. Conteúdo que só aparece depois de JavaScript é invisível para uma parte dos crawlers.
- **Estrutura semântica visível**: um `<h1>` por página, hierarquia coerente, listas e tabelas reais. Ver `references/discoverability.md` — isto importa mais do que dados estruturados.
- **Conteúdo editável sem código**. Ficheiros Markdown/MDX numa pasta chegam. Se o cliente tiver de te ligar para corrigir uma vírgula, tu passas a ser um custo em vez de um investimento.
- **Formulários com consentimento e política de privacidade** — ver `references/compliance-eu.md`.
- **Acessibilidade**: contraste, foco visível, navegação por teclado, `alt` em imagens com significado. Deixou de ser boa prática e passou a ser obrigação legal para parte dos clientes.

## Fase 4 — Redirects

Só para migrações. É a fase que mais valor destrói quando é esquecida.

Cada URL do inventário tem de ter destino. Nenhum pode ficar em 404.

```bash
node scripts/check-redirects.js --inventario ./legado/inventario.json --base https://preview-url
```

Regras: 301 (permanente), nunca 302; um salto só, sem cadeias; se a página deixou de existir, aponta para a categoria mais próxima, não para a homepage — redirecionar tudo para a raiz é tratado como página não encontrada.

## Fase 5 — Pré-voo

Com o site novo em URL de preview, antes de mexer no domínio:

```bash
node scripts/preflight.js --url https://preview-url
```

Verifica: HTTPS e cabeçalhos, `robots.txt` e sitemap, meta e Open Graph, um `<h1>` por página, dados estruturados válidos, viewport, acesso dos crawlers de IA, e ausência de URLs de staging indexáveis.

Não avances com falhas críticas. Ver `references/discoverability.md` para o que cada verificação significa e quais são de facto importantes.

## Fase 6 — Migração e entrega

**Pré-condição:** existe `dns.json` deste domínio e o preflight passou. Se entraste diretamente nesta fase, corre primeiro `dns-snapshot.js` — sem retrato do estado atual não há reversão possível.

A ordem importa e está em `references/migration.md`. Resumidamente: baixar TTL com antecedência, mudar apenas registos A e CNAME, **nunca tocar em MX, TXT ou SPF/DKIM**, confirmar que o email continua a funcionar antes de dizer seja o que for ao cliente.

Depois: verificar redirects em produção, submeter sitemap, e entregar segundo `references/handover.md` — credenciais, como editar, o que está a ser medido, e o que fica combinado sobre manutenção.

## O que esta skill não faz

- Não escolhe estética nem escreve copy criativa
- Não decide stack (a exceção: exige renderização no servidor)
- Não faz alterações de DNS por ti quando há email em risco — prepara a instrução e o cliente ou o provedor executa

## Ficheiros

| Ficheiro | Quando ler |
|---|---|
| `references/migration.md` | Fase 1 e Fase 6 — obrigatório antes de tocar em DNS |
| `references/discoverability.md` | Fase 3 e Fase 5 — o que funciona e o que é folclore |
| `references/compliance-eu.md` | Fase 3 — RGPD, cookies, acessibilidade |
| `references/handover.md` | Fase 6 |
