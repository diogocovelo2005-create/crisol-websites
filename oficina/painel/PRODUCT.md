# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Next.js (App Router) + Tailwind, a correr só em local (`localhost:4000`). É o
mesmo stack dos sites dos clientes. Ver `PLANO.md`.

## Users
Um só utilizador: o Diogo, que prospeta, vende e constrói websites para
negócios locais (alojamento, advocacia…). Usa o painel ao lado do VS Code.
Vê-o de relance várias vezes ao dia e abre um projeto com calma antes de ligar
a um cliente ou de pegar no trabalho.

## Product Purpose
Mostrar os projetos em mãos e em que ponto está cada um, sem andar à procura.
Um projeto nasce quando a lead diz sim na cold call. Daí passa a "a construir
base" e segue até pago. Tem sucesso se em 2 segundos se percebe o que precisa
dele hoje, e se num clique se chega ao site (local ou Vercel), ao dossiê e ao
próximo passo.

## Positioning
Não é um CRM genérico. Está ligado ao repositório: lê a pasta de cada projeto
(dossiê, fotos, site, proposta), o último deploy na Vercel e o estado da lead
no Supabase. A checklist marca-se sozinha a partir dessas provas.

## Operating Context
- Pastas: `nichos/<nicho>/casas/<slug>/` ou `nichos/<nicho>/clientes/<slug>/`,
  com `dossie/` e `site/`.
- Estado: `crm_alojamento.estado` (Supabase) ou `projetos.estado` para os
  projetos de fora da prospeção.
- Deploys pela CLI da Vercel, a partir da pasta do site.

## Capabilities and Constraints
- Uma página por nicho, com um quadro de cinco colunas (Base, Enviada, Sim,
  Construção, No ar). Os cartões têm a foto da casa e o nome.
- Dentro de cada coluna, os cartões estão ordenados pela data do próximo passo
  (os que não têm data vão para o fim).
- Página de detalhe: estado, próximo passo, o site (Vercel, local, link
  enviado, site antigo), checklist por fases, histórico, negócio e dossiê.
- O painel sugere e ele aceita: nada muda o estado sem o sim dele.
- A checklist é básica e tem "+ adicionar".
- A chave de serviço do Supabase existe só no servidor, e o painel nunca é
  publicado.

## Brand Commitments
Nenhum logótipo ou identidade. O que não pode parecer: fofinho (pastéis,
emojis por todo o lado), escuro/tech (fundo preto, néon), nem com texto
demais (o estado lê-se pelas fotos, cores e posição, não por frases).

## Evidence on Hand
- Fotos reais das casas em `site/public/fotos/` (Fataunços, Canhões).
- O Cerrado dos Outeirinhos e a Quinta de CasalMato ainda não têm pasta nem
  foto. O painel tem de ficar bem mesmo sem foto.

## Product Principles
1. Ler de relance: a cor e a posição dizem o estado antes do texto.
2. Um clique até ao site: o cartão leva ao sítio onde o trabalho está.
3. Ele decide: o painel sugere, não aplica.
4. As provas vêm do disco: o que se pode detetar, não se pede.
