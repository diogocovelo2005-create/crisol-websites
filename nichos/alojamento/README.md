# Alojamento

A pasta do nicho de alojamento local: guest houses, hostels, bed & breakfast,
turismo rural e casas de campo.

Aqui vive tudo o que é deste nicho e só deste nicho. A prospeção, os lotes de
leads, e os sites dos clientes que vierem deles.

## O que está cá dentro

| Pasta | O que é |
|---|---|
| `.claude/skills/prospeccao-alojamento/` | a skill do funil: encontra e avalia casas numa região |
| `.claude/skills/al-dossier/` | investiga uma casa específica (factos, voz do AL, reviews) antes de lhe fazer o site |
| `.claude/skills/criar-base/` | do dossiê ao site em HTML: brief do Claude, três bases do Gemini, escolha do Diogo, fotos melhoradas, acabamento do Claude |
| `.claude/skills/scroll-craft/` | páginas guiadas pelo scroll; vem de github.com/nateherkai/scroll-craft (`plugins/nateherk-design/skills/scroll-craft`, commit 75d81f7) |
| `scrollcraft/` | a pasta de trabalho da scroll-craft (`FINGERPRINTS.md`), indicada em `.scrollcraft.json`; os builds de cada casa ficam em `casas/<slug>/scrollcraft/` |
| `arquivo/` | o molde Next.js, a skill adaptar-molde e o relatório dela, substituídos pela criar-base a 2026-09-28 |
| `casas/<slug>/` | tudo de uma casa: `dossie/`, `prototipos/` (as três bases), `site/`, e a pesquisa ou proposta se houver |
| `VARIACOES.md` | o registo das combinações usadas em cada site, por concelho, para vizinhos não terem sites iguais |
| `leads/` | um ficheiro por região: link do artifact, universo, aprovados, descartados, concorrência local |
| `proposta/` | o gerador das propostas em PDF |
| `portfolio/` | os vídeos de exemplo e o `gravar60.mjs`, que grava o scroll de um site em vídeo |

## O que **não** está cá dentro

O motor de prospeção. Ele é genérico, serve qualquer nicho, e vive na raiz do
repositório em `.claude/skills/lead-scraper/`. Esta skill chama-o e não duplica
uma linha de código.

Os dados que o motor consome ficam com o motor, e não aqui, porque é ele que os
lê:

- a lista de termos deste nicho, em `.claude/skills/lead-scraper/keywords/alojamento.json`
- as grelhas das regiões, em `.claude/skills/lead-scraper/grid/`
- as leads em bruto, na tabela `leads_alojamento` do Supabase
- as fotografias dos sites, em `.claude/skills/lead-scraper/screenshots/alojamento/`

A divisão é esta, e vale a pena mantê-la: **o motor guarda o que é mecânico, a
pasta guarda o que é critério e decisão.**

## Como se arranca

Para prospetar: a partir da raiz do repositório, diz a região. A skill trata do resto.

Para fazer o site de uma casa: primeiro o dossiê (`al-dossier`), depois o site (`criar-base`), com a chave `GEMINI_API_KEY` configurada. Novas bases exigem `contrato.json`, `site-pronto.md` gerado e `validacao.json` atual; para material anterior segue a migração indicada em `al-dossier/references/migracao.md`.

Quatro comandos, três julgamentos, um entregável. Está tudo no `SKILL.md`.
