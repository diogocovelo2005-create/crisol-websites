# Lançamento de um site de alojamento

Serve para todas as casas. Copia a lista para a pasta da casa e vai riscando.
Se a casa **não tinha site antigo**, salta a secção 4 (migração) e os redirects.

Legenda: **[Claude]** faço eu no código ou no navegador · **[Tu]** só tu consegues · **[Cliente]** passa pela pessoa do cliente.

---

## 1. Dentro do site (código) — [Claude]

Faço tudo isto no fim, de uma vez, quando o site estiver acabado.

- [ ] Meta title único por página (menos de 60 caracteres: "Nome — tipo de alojamento em Local")
- [ ] Meta description única por página (cerca de 150 caracteres)
- [ ] Palavras-chave reais (tipo de alojamento + local) no `h1`, nos títulos e no texto
- [ ] Um `h1` por página, hierarquia de títulos sem saltos, `alt` nas fotos
- [ ] `sitemap.xml` (`src/app/sitemap.ts`)
- [ ] `robots.txt` (`src/app/robots.ts`), com `noindex` enquanto for rascunho e aberto no dia do lançamento
- [ ] Crawlers de IA não bloqueados (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Bingbot)
- [ ] `canonical` e um só endereço (com ou sem `www`, o outro redireciona)
- [ ] Dados estruturados JSON-LD (`LodgingBusiness` ou o subtipo certo) e validar no Rich Results Test
- [ ] Favicon, `apple-touch-icon` e imagem de partilha (Open Graph)
- [ ] Redirects 301 das páginas antigas (só migração)
- [ ] Página 404 própria
- [ ] Política de privacidade e checkbox de consentimento, se houver formulário
- [ ] Sem cookies não essenciais: mapas e vídeos embebidos só depois de clique, ou imagem com link
- [ ] Livro de reclamações e número de registo do alojamento (RNAL/RNET) visíveis, conforme o `compliance.md` do dossiê
- [ ] Acessibilidade: contraste, foco visível, teclado, etiquetas nos campos
- [ ] Analítica sem cookies (Vercel Analytics ou Plausible)
- [ ] `hreflang`, se houver mais que um idioma

## 2. Verificações no site publicado — [Claude]

Corro com o navegador (Playwright) no endereço `.vercel.app`, antes de tocar no domínio.

- [ ] PageSpeed / fluidez **em produção e em mobile** (não em `next dev`)
- [ ] Todos os botões de reserva, `tel:` e `mailto:` abrem o que devem
- [ ] Teste em ecrãs de telemóvel emulados
- [ ] `robots.txt`, `sitemap.xml`, canonicals e JSON-LD respondem como esperado
- [ ] Revisão final (agente revisor-alojamento)

## 3. Contas e acessos — [Tu] e [Cliente]

Isto é o que mais demora, por isso pede cedo.

- [ ] **[Cliente]** Acesso ao painel do DNS (quem gere o domínio)
- [ ] **[Cliente]** Perguntar quem gere o email do domínio e se há mais serviços no domínio (subdomínios)
- [ ] **[Cliente]** Acesso de gestor ao **Google Business Profile** (ou confirmar que já o tem verificado)
- [ ] **[Cliente]** Acesso ao **Google Search Console**, se já existir
- [ ] **[Tu]** Criar a propriedade no Search Console, se não existir (a verificação por TXT a pessoa do cliente faz)
- [ ] **[Tu]** Importar o Search Console para o **Bing Webmaster Tools**
- [ ] **[Tu]** Repositório GitHub privado por casa (é o backup do site; não é preciso sistema de backups)
- [ ] **[Tu]** Guardar à parte o dossiê e as fotos originais

## 4. Migração do domínio — só se havia site antigo

Só no fim, com o site acabado e revisto. Antes de mexer em nada:

- [ ] **[Claude]** Guardar uma cópia do DNS atual (é o teu seguro para voltar atrás)
- [ ] **[Claude]** Inventário das páginas do site antigo, cruzado com o Wayback Machine, e lista de redirects
- [ ] **[Cliente]** Baixar o TTL do DNS um ou dois dias antes
- [ ] **[Tu]** Publicar na Vercel (`--prod`) e acrescentar o domínio e o `www` em Settings → Domains
- [ ] **[Tu]** Mandar à pessoa do cliente os registos exatos que a Vercel mostra
- [ ] **[Cliente]** Mudar **só o registo A e o CNAME `www`**. Nunca os nameservers, nunca MX nem TXT/SPF/DKIM
- [ ] **[Tu]** Mandar um email de fora para o email do domínio e confirmar que chega
- [ ] **[Claude]** Confirmar redirects, HTTPS e `robots.txt` no domínio, e tirar o `noindex`
- [ ] **[Cliente]** Não desligar o alojamento antigo até estar tudo confirmado (para poderes voltar atrás)

## 5. Depois de lançar

- [ ] **[Tu]** Submeter o sitemap no Search Console (e no Bing)
- [ ] **[Tu]** Pedir a indexação da página inicial
- [ ] **[Tu]** Pôr o site novo no campo "website" do Google Business Profile
- [ ] **[Tu]** Conferir nome, morada e telefone iguais no site, no Google, no Booking e no Airbnb
- [ ] **[Tu]** Monitorização de uptime (UptimeRobot, gratuito)
- [ ] **[Tu]** Ver o Search Console aos **30 e aos 90 dias** (erros, páginas indexadas, impressões)
- [ ] **[Claude]** Corrigir o que o Search Console apontar, se me pedires

## 6. Entrega ao cliente — [Tu]

- [ ] Contas e domínio em nome do cliente, não teu
- [ ] Documento simples: o que existe, onde está, como alterar um texto, a quem ligar se algo correr mal (posso redigi-lo se me pedires)
- [ ] Combinar a manutenção por escrito: o que é grátis e por quanto tempo, o que é pago
- [ ] Pedir o testemunho logo depois de mostrares o site no telemóvel dele
- [ ] Guardar capturas de antes e depois e as métricas iniciais

---

## O que **não** vale a pena

- **Meta tag `keywords`:** o Google ignora-a desde 2009.
- **`llms.txt`:** nenhum fornecedor grande de IA o usa. Só se custar uma hora, e nunca o vendas como "visibilidade em IA".
- **Sistema de backups automático:** o GitHub e os deploys anteriores da Vercel chegam. Só mudava com base de dados ou CMS.
- **Banner de cookies:** evita-se não usando cookies não essenciais.
