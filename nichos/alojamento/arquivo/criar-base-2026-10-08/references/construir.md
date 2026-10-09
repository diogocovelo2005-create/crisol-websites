# Do protótipo escolhido ao site

O protótipo escolhido é **uma base**: tem a estética certa (cores, fontes,
layout, ritmo) e o texto real, e tem muito para limar. O site final é Next.js,
com o primeiro ecrã constante do esqueleto. A sessão principal só lança os
subagentes e fala com o Diogo; a montagem, as fotos e o trabalho pesado são
deles.

Para correções depois da entrega, segue o passo 8 da `SKILL.md`: pequenas
num agente novo em Sonnet em modo de correção; retomar o subagente certo
(SendMessage) só enquanto o contexto dele for pequeno. Nunca abras os
ficheiros na sessão principal.

## O que o polimento monta primeiro

### Fotos

```bash
node <skill>/scripts/melhorar-fotos.mjs casas/<slug> --base <letra> --primeiro <foto-do-primeiro-ecrã> --simular
node <skill>/scripts/melhorar-fotos.mjs casas/<slug> --base <letra> --primeiro <foto-do-primeiro-ecrã>
```

A foto do primeiro ecrã é a da secção 1 do `BRIEF.md`. As fotos que não
aguentam a largura com que aparecem (e a do primeiro ecrã, que vai a ecrã
inteiro) são ampliadas localmente com o Real-ESRGAN: grátis, alguns minutos
cada, em segundo plano. Ficam em `site/public/fotos/`, no tamanho maior; o
`next/image` faz as variantes. **O retoque da foto do primeiro ecrã é do
Diogo**: ele troca o ficheiro quando o tiver.

### Esqueleto

- Se `casas/<slug>/site/` já existir, move-o para
  `casas/<slug>/arquivo/site-<data>/` antes de mais nada. Nunca o apagues.
- Copia `<skill>/esqueleto/` para `casas/<slug>/site/` (sem `node_modules`)
  e corre `npm install`.
- Preenche `src/lib/casa.ts` a partir da secção 1 do `BRIEF.md` (etiqueta,
  título, texto, foto, voz de quem recebe), da secção de contacto e do
  contrato: nome, tipo, lugar, ações confirmadas, contactos, registo nos
  termos da condição. `navegacao` com as âncoras das secções (curtas, até
  quatro).

## 1 · Polimento — subagente `polimento-alojamento`

Monta o que está acima, passa o protótipo para componentes, aplica a pele
dele ao primeiro ecrã, ao cabeçalho e ao rodapé, e lima. Recebe a casa, a
letra e o `ESCOLHA.md`. Pode pôr movimento simples, se a base ou o Diogo o
pedirem.

## 2 · Interatividade — subagente `interatividade-alojamento`

Revê todo o movimento, incluindo o do polimento, e só acrescenta onde faz
sentido: componentes e animações do React Bits, um efeito marcante no
máximo. Não mexe no primeiro ecrã.

## 3 · Mobile — subagente `mobile-alojamento`

O último a entrar. Em Sonnet, modo de verificação: corre o `percorrer.mjs`
em todos os dispositivos emulados e corrige o layout. As animações que não
funcionam no toque só as descreve, com uma proposta; se houver, a sessão
principal relança-o em Opus, modo de troca, só para essas (desktop igual,
troca registada no `NOTAS.md`).

## Revisão: só a pedido

O `revisor-alojamento` (Sonnet) não corre por defeito: o verificador
automático já corre dentro dos três subagentes, e quem revê no fim é o
Diogo. Lança-o só se ele pedir uma segunda passagem.

## Correr e verificar

```bash
cd casas/<slug>/site && npm run build && npm run start -- -p 3500
node <skill>/scripts/verificar-prototipo.mjs http://localhost:3500 casas/<slug>/prototipos/BRIEF.md
```

Sempre `localhost`, nunca `127.0.0.1`: o Next.js não hidrata aí e a página
aparece sem funcionar, sem erro nenhum.

O verificador dá dois números: os **ecrãs de conteúdo** (máximo 13) e o
**scroll preso** das sequências, medido à parte (aviso acima de 6). Falha
também se uma revelação acontecer antes de o elemento entrar no ecrã, ou se
uma sequência presa deixar o ecrã quase vazio.

**O servidor é da sessão principal.** Um servidor ligado por um subagente
morre quando ele acaba. Os subagentes param a porta 3500 antes do build e
deixam-na parada; a sessão principal liga-o em segundo plano, com o tempo
máximo, quando o Diogo tiver algo para ver.

## Registar

`casas/<slug>/NOTAS.md`: a base escolhida e o pedido do Diogo, o que cada
subagente fez, as fotos ampliadas, o estado da verificação e o que ficou por
confirmar com o dono.
