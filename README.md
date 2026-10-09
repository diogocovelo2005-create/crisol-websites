# crisol-websites

Tudo o que é preciso para encontrar clientes e fazer-lhes o site.

## Mapa

| Pasta | O que é |
|---|---|
| `.claude/skills/lead-scraper/` | O motor de prospeção. Genérico: serve todos os nichos. |
| `oficina/` | Skills e ferramentas de construção partilhadas por todos os nichos (design, entrega, `novo-cliente.mjs`, laboratório de efeitos). |
| `nichos/<nicho>/` | Tudo o que é de um nicho: as skills dele, os moldes e os clientes. |

## Nichos

| Nicho | Onde estão os clientes |
|---|---|
| `nichos/alojamento/` | `casas/<slug>/`, cada casa com `dossie/` e `site/`. Os sites novos nascem da skill `criar-base`; os antigos vieram do molde, hoje em `nichos/alojamento/arquivo/`. |

## Regras

- **Um cliente é uma pasta.** Tudo o que é de um cliente (dossiê, site, pesquisa, proposta) vive dentro dela.
- **O que é genérico vive na raiz ou na oficina; o que é de um nicho vive no nicho.**
- **Um só repositório git, na raiz.** Os sites não têm repositório próprio. Os deploys fazem-se pela CLI da Vercel, a partir da pasta do site.
