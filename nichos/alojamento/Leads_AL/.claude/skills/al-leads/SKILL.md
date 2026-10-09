---
name: al-leads
description: Prospeção de alojamentos locais (AL, turismo rural, turismo de habitação) sem site ou com site antigo, concelho a concelho, para cold calls do negócio de websites. Constrói a lista completa a partir do registo oficial (RNAL/RNET), verifica Booking, perfil Google, pesquisa e domínio de cada alojamento, classifica o site e escreve o resultado no dashboard Leads AL. Usar SEMPRE que o pedido for procurar alojamentos ou leads numa zona ("faz Cantanhede", "procura alojamentos em Mira", "corre o distrito de Aveiro", "encontra mais leads"), verificar um alojamento concreto ("vê se a Casa X tem site"), ou atualizar o dashboard de leads, mesmo que não fale em RNAL, Booking ou dashboard.
---

# AL Leads — prospeção de alojamentos para cold call

O objetivo é uma lista **completa** e **certa** de alojamentos de um concelho que valem uma chamada: **sem site** ou com **site antigo**, e com boa reputação. O resultado vai para o dashboard (`data/leads.json`); a pessoa liga a partir daí.

Esta pasta é a raiz do dashboard. Os caminhos abaixo são relativos a ela.

## Regras de ouro (cada uma corrige um erro que já aconteceu)

1. **A lista vem do registo oficial, nunca de pesquisas.** Pesquisas no Booking ou no Google Maps cortam resultados. Foi assim que o Lugar do Ourives (Febres) e metade de Cantanhede ficaram de fora. Usar sempre `ferramentas/rnal.js`.
2. **Nunca afirmar "sem site" sem as 3 verificações feitas** (perfil Google, pesquisa, domínio) e registadas em `verificacao`. Já se disse "não tem site" quando o perfil Google tinha o link. Se uma verificação não pôde ser feita (captcha, bloqueio, erro), a lead vai para **dúvida**, nunca para contactar.
3. **Na dúvida, dúvida.** Se não tens certeza se o site é antigo ou moderno, ou se o perfil é o do alojamento certo, a lead vai para `duvida` com o motivo. Um palpite errado custa uma chamada ou perde um cliente; uma dúvida custa 2 segundos à pessoa.
4. **Só factos verificáveis**, com a fonte. A nota do Booking vem da página do próprio alojamento, não de outro com nome parecido.
5. **Nunca mexer em `data/estado.json`.** É onde a pessoa guarda estados, estrelas e notas. O `juntar.js` também protege as leads já trabalhadas.
6. **Concelho a concelho.** Um distrito corre-se concelho a concelho, gravando no fim de cada um.
7. **Dados pessoais mínimos.** No dashboard só entram o nome do responsável e o telefone. NIF e emails do titular nunca saem do registo.

## Passo 0 — Preparar

1. Confirmar o concelho (ou a lista de concelhos, se pedirem um distrito; confirmar a lista com a pessoa antes de começar).
2. Ler as falhas anteriores para não as repetir:
   ```bash
   node -e "const e=require('./data/estado.json'),l=require('./data/leads.json').leads;for(const[k,v]of Object.entries(e))if(v.estado==='falha_claude')console.log((l.find(x=>x.id===k)||{}).nome,'|',v.falha,'|',(v.notas||[]).map(n=>n.texto).join(' / '))"
   ```
   Cada falha é uma lição: diz no resumo final como a aplicaste.
3. Ver que ferramentas há: Chrome (chrome-devtools MCP ou Claude in Chrome) para Booking e Google Maps; `WebSearch`/`WebFetch`; e se existe `GOOGLE_PLACES_KEY` no ficheiro `.env` (ver 2b).

## Passo 1 — Lista completa

```bash
node ferramentas/rnal.js "Cantanhede"
```
Gera `data/candidatos-<concelho>.json` com todos os AL (RNAL) e empreendimentos de turismo rural/habitação (RNET). Hotéis, parques de campismo e aldeamentos ficam de fora. Um titular com várias unidades é **uma** lead (`unidades` lista-as). Os candidatos com `ja_existe: true` já estão no dashboard: saltar, a não ser que peçam para atualizar.

Se o script falhar (o servidor do Turismo de Portugal às vezes corta o download), voltar a correr. **Nunca continuar com uma lista parcial.**

### 1b. Capacidade: baixa a prioridade, nunca elimina
Cada candidato traz `capacidade`: o nº de pessoas do registo, somado em todas as unidades do titular. **A capacidade não elimina ninguém** (decisão do Diogo, 07/10/2026): todas as casas seguem para a verificação. Uma casa com **menos de 10 pessoas e até 2 tipos de quarto** aparece no dashboard com a etiqueta "Pequeno" e desce para o fim das listas. Para as que têm menos de 10 pessoas, contar os tipos na tabela "Tipo de quarto" do Booking ou nos anúncios do Airbnb/outra plataforma (nomes diferentes, somando os anúncios separados do mesmo dono; uma casa inteira é 1 tipo) e registar `tipos_quarto`, para que uma casa de 8 pessoas com 3 suites (ex.: Torres da Vila) não leve a etiqueta.

## Passo 2 — Verificar cada candidato

Pela ordem abaixo. Parar assim que a lead for eliminada, para não gastar pesquisa.

### Atalhos que poupam horas (aprendidos em Anadia)
- **Booking de uma vez:** abrir `https://www.booking.com/searchresults.pt-pt.html?ss=<Concelho>` no Chrome, carregar todos os resultados e ler nome, nota, nº de avaliações e URL de cada cartão. Repetir para 2–3 freguesias grandes. Depois cruzar com os candidatos, em vez de pesquisar um a um. Para os que têm menos de 10 pessoas, abrir a página de cada um e contar os tipos de quarto (ver 1b).
- **Registos em nome do dono** (ex.: "Paula Maria Rodrigues de Sousa"): o nome comercial está no Booking. Abrir as páginas Booking que ainda não foram associadas, ler a morada e cruzar com a `morada` do registo (ex.: R. Central 12 = "CLE House").
- **Perfil Google em lote:** com o Chrome numa página do google.com, `window.open` de cada pesquisa do Maps e ler `h1`, `button[data-item-id="address"]`, `a[data-item-id="authority"]` e `button[data-item-id^="phone:tel:"]`. **Aceitar o perfil só se a morada for do concelho** (código postal ou localidade); quando o Maps devolve um único perfil com outro nome (infantário, oficina…), não é o alojamento.
- **Domínios em lote:** resolver NS/IP de todas as variantes com um script e, para os que respondem, ler o título e procurar a localidade na página. Nomes genéricos ("Casa Adega", "O Lagar", "Lages") são quase sempre de terceiros.
- **Capturas:** juntar todas numa folha (uma grelha HTML capturada com o Edge) para as avaliar numa só imagem. Quando o Edge não abre um site, usar a captura de ecrã do Chrome.

### 2a. Booking e outras plataformas
O Booking **não é obrigatório**: muitos AL vendem só pelo Airbnb, Vrbo ou outra plataforma, e não estar no Booking nunca elimina.
- Pesquisar `"<nome>" <localidade> booking.com`. Abrir a página do alojamento e confirmar que é o mesmo (nome + localidade ou morada).
- Registar `url`, `nota` (escala 0–10) e `avaliacoes` (nº de comentários).
- **Nota < 7 com 10 ou mais avaliações no Booking → eliminado** (`motivo: "Booking 6,4 com 52 avaliações"`). Com menos de 10 avaliações mantém-se e o motivo diz-o.
- **Não está no Booking:** procurar no Airbnb e noutras plataformas (`"<nome>" <localidade> airbnb`, Vrbo, Hostelworld…). Registar em `plataformas` cada uma encontrada, com a nota na escala da própria plataforma (Airbnb de 0 a 5). Não há corte automático por nota fora do Booking: uma nota fraca diz-se no motivo.
- **Não está em plataforma nenhuma:** segue a verificação, mas vai para `duvida` com isso no motivo (pode estar parado). **Exceção: restaurantes com alojamento** (ex.: Virgílio dos Leitões), que vendem pelo restaurante: marcar `"restaurante": true` e seguir normalmente.
- O Booking bloqueia muitas vezes o fetch simples: usar o Chrome. Sem Chrome, aceitar a nota de um resultado de pesquisa só se o resultado for claramente a página desse alojamento, e escrever "(nota do resultado de pesquisa)" no motivo.

### 2b. Perfil Google — a verificação mais importante
- Abrir o Google Maps com `<nome> <localidade>` e confirmar a morada.
- Registar: o **website** do perfil (link ou "sem website"), o **telefone** e se aparece **"Encerrado permanentemente"** (nesse caso: eliminado, motivo "fechou").
- Com `GOOGLE_PLACES_KEY` no `.env`, é mais rápido e fiável assim:
  ```bash
  curl -s -X POST "https://places.googleapis.com/v1/places:searchText" -H "Content-Type: application/json" \
    -H "X-Goog-Api-Key: $GOOGLE_PLACES_KEY" -H "X-Goog-FieldMask: places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.businessStatus" \
    -d '{"textQuery":"Lugar do Ourives Febres Cantanhede","languageCode":"pt"}'
  ```
- Sem perfil Google → `maps: "sem perfil Google"`. É uma resposta válida; o que não é válido é não ter visto.

### 2c. Pesquisa
- Pesquisar `"<nome>" <localidade>` e `"<nome>" alojamento`. Ver os 10 primeiros resultados.
- Procurar um **domínio próprio**. Booking, Airbnb, TripAdvisor, Facebook, Instagram, VisitPortugal, Expedia e semelhantes não contam como site, mas Facebook/Instagram ativos são um bom sinal (dizer no motivo).

### 2d. Domínio óbvio
Testar as variantes do nome sem acentos: `nomejunto.pt`, `nome-com-hifens.pt` e o mesmo em `.com`.
```bash
for d in lugardoourives.pt lugar-do-ourives.pt lugardoourives.com; do printf "%s: " $d; curl -s -o /dev/null -m 10 -w "%{http_code}\n" "https://$d" || echo "sem resposta"; nslookup $d 2>&1 | grep -q "Name:" && echo "  registado"; done
```
Domínio **registado sem site** (não responde, está estacionado ou dá erro) é o melhor gancho que há: `site: null`, com isso dito no motivo.

### Telefones — guardar TODOS, com a fonte
Já houve leads marcadas "sem contacto" quando o Gonçalo pesquisou e encontrou o número. Guardar **todos** os números encontrados (telemóvel e fixo), cada um com as fontes onde apareceu.

**Para poupar tempo, a pesquisa faz-se em dois níveis:**

**Nível 1 — sempre (rápido):**
1. **Registo:** o `rnal.js` já traz o telemóvel e o fixo do titular, de todas as unidades.
2. **Perfil Google:** `button[data-item-id^="phone:tel:"]`.

Se daqui sair **pelo menos um telemóvel** (começa por 9), parar: guardar os números destas duas fontes e seguir para a lead seguinte.

**Nível 2 — só se não houver número nenhum ou só houver fixo (começa por 2):**
3. **Site próprio, aberto no browser** (Chrome), não com curl: muitos sites (Wix, React) só mostram o telefone depois de carregar o JavaScript. Ver a página inicial, a página de contactos/reservas, o rodapé e os links `tel:` e `wa.me` (WhatsApp).
4. **Facebook e Instagram** indicados no site.
5. **Pesquisa com a palavra "contactos"**: `<nome> <localidade> contactos`. Foi esta a pesquisa que deu o número da Casa Gorjão, que eu tinha falhado com "telefone" e "contacto". O Google mostra o número no resumo de IA ou no painel lateral. Se o Google pedir captcha no Chrome, usar o Bing no Chrome (`bing.com/search?q=...`); a ferramenta WebSearch é mais fraca para isto.
6. **Diretórios de turismo:** gites.fr / chambres-hotes.fr (anúncios dos donos), `directrentportugal.com/al/<nº de registo>`, centro-portugal-hotels.com, Solares de Portugal, Rota da Bairrada e o site da Câmara.

Se o número só aparecer no resumo de IA do Google e não se encontrar a página de origem, guardá-lo com `fontes: ["Google (resumo IA, a confirmar)"]`.

Cuidados:
- Números que aparecem no site podem ser de parceiros ou ter gralhas: indicar a fonte (`"site (talvez gralha do …)"`).
- Códigos postais confundem o regex (ex.: "3780-309" deu "203 780 309"): só valem números começados por 2 ou 9 que façam sentido como telefone.
- Guardar também o email, se houver (`"email"`).

Formato: `"telefones": [{ "numero": "912 274 900", "fontes": ["site", "WhatsApp"] }]`.

**Sem telefone depois de percorrer tudo:**
- **Sem site também → eliminado** (`motivo: "Sem telefone nem site"`).
- **Com site → fica**, porque se chega ao dono pelo site ou pelo email.

Em ambos os casos, registar onde se procurou em `verificacao.contacto` (ex.: "registo e Google sem telefone; site só tem email e formulário; Facebook removido; pesquisa sem resultados"). O `juntar.js` recusa uma lead sem telefone que não tenha isto.

Atenção às **páginas de afiliado** que o Google mostra como "website" (ex.: oceanvistalodge.eu, que redireciona para bestplacesinmap.eu): não são o site do alojamento, por isso `site: null`.

### 2e. Classificar o site (todas as leads que têm site)
**Abre-se todo e qualquer site encontrado**, sem triagem prévia. Este passo corre num **subagente Sonnet** (ferramenta Agent com `model: "sonnet"`), não no modelo principal: junta os sites do concelho em lotes de ~10 e passa a cada subagente a lista (`id`, nome, url) e este passo 2e copiado na íntegra. O subagente devolve, por site, o veredito e os sinais; quem grava continua a ser a sessão principal.

Recolher os sinais:
- **Idade:** a primeira captura no Wayback Machine:
  `curl -s "https://web.archive.org/cdx/search/cdx?url=<dominio>&limit=1&output=json&fl=timestamp"`
- **Rodapé:** o ano do ©.
- **Plataforma e tema:** meta `generator`, marcas de Wix, Webnode, Site123, Joomla, versão de WordPress/tema, Framer, Webflow.
- **Telemóvel:** a página tem `<meta name="viewport">`? Se não tiver, é antigo.
- **Captura:** `node hero.js https://site.pt <id>` grava `capturas/<id>.png`. **Abrir a imagem e olhar para ela.** Pôr `site.captura: "capturas/<id>.png"`.

Decidir:
| Veredito | Quando | Funil |
|---|---|---|
| `moderno` | Aspeto atual **ou** prova de que é recente (Wayback ≤ 12 meses, Framer/Webflow/Wix Studio). O © do ano atual não conta, porque o rodapé atualiza sozinho. | `duvida` — **nunca eliminado pelo site**: o Gonçalo decide |
| `antigo` | **Claramente** datado: a captura parece velha **e** há pelo menos um sinal objetivo (© ≤ 2020, sem viewport, plataforma/tema antigo, Wayback há ≥ 4 anos sem redesign, "em construção") | `contactar` |
| `duvida` | Tudo o que não é claramente antigo: sinais contraditórios, captura falhada, aspeto razoável | `duvida` |

Escrever os sinais no `motivo` (ex.: "Site antigo: © 2015 · Wix · Wayback desde 2014").

Casos especiais:
- **O "website" do perfil é um agregador** (hotelssources, hoteisfinder, stayo, bluepillow, Booking): não é site próprio, `site: null` e diz-se no motivo.
- **Página num site de gestora** (oceanvistalodge.eu, GuestReady, R3 Service…): `duvida`, porque quem decide pode ser a gestora.
- **"Em construção" / "brevemente" / domínio suspenso:** `duvida`, e diz se o domínio é claramente do alojamento.

**Calibração:** o Gonçalo vê como antigos sites que eu achei modernos (Gate5 e Virgílio dos Leitões, em Anadia). Por isso o site **nunca** elimina uma lead: só o "claramente antigo" vai direto para ligar; o resto vai para a Dúvida.

## Passo 3 — Gravar no dashboard

Escrever `data/novos-<concelho>.json` e correr:
```bash
node ferramentas/juntar.js data/novos-cantanhede.json
```
O `juntar.js` valida tudo. Se der erros, **nada é gravado**: corrigir a verificação que falta (não inventar o campo) e correr outra vez. Num concelho grande (mais de 40 candidatos), gravar a cada 20 leads verificadas: o progresso não se perde e o dashboard vai enchendo.

Formato de cada lead (copiar os campos do candidato e acrescentar os da verificação):
```json
{
  "id": "rnal-135087", "nome": "Lugar do Ourives", "concelho": "Cantanhede", "localidade": "Febres",
  "morada": "Rua ..., 3060-...", "tipo": "AL · Estabelecimento de hospedagem",
  "telefones": [{ "numero": "963 457 490", "fontes": ["registo", "Google"] }], "email": "geral@exemplo.pt", "responsavel": "Nome do titular", "unidades": ["..."], "capacidade": 16, "tipos_quarto": 3,
  "booking": { "url": "https://www.booking.com/hotel/pt/....html", "nota": 9.1, "avaliacoes": 30 },
  "plataformas": [{ "nome": "Airbnb", "url": "https://www.airbnb.pt/rooms/...", "nota": 4.9, "avaliacoes": 41 }],
  "site": null,
  "verificacao": {
    "maps": "perfil Google sem website (morada confere)",
    "pesquisa": "10 primeiros: Booking, Airbnb, Facebook — sem domínio próprio",
    "dominio": "lugardoourives.pt e .com livres",
    "contacto": "só obrigatório quando não há telefone: onde se procurou",
    "data": "2026-10-06"
  },
  "funil": "contactar",
  "motivo": "Sem site: 30 avaliações a 9,1 no Booking e Facebook ativo"
}
```
Com site: `"site": { "url": "https://...", "veredito": "antigo", "captura": "capturas/rnal-135087.png" }`.
`booking` e `plataformas` são opcionais: põe só as que encontraste.
Eliminada pelo filtro automático (nota do Booking < 7 com 10+ avaliações): basta `capacidade`, `booking`, `funil: "eliminado"` e `motivo`; não precisa de `verificacao`. Restaurante com alojamento: acrescentar `"restaurante": true`.

## Passo 4 — Resumo para a pessoa

Curto:
- Quantos candidatos tinha o registo, quantas leads para contactar, em dúvida e eliminadas (nota do Booking e fechados), quantas são "Pequeno" e quantas só estão no Airbnb ou noutra plataforma.
- As leads **sem telefone** (só ficam as que têm site) e as que saíram por não terem telefone nem site.
- As verificações que **não foi possível fazer** e porquê.
- As falhas anteriores que aplicaste.
- Lembrar que é preciso abrir o dashboard (atalho **Leads AL**) ou carregar F5.

## Casos aprendidos

| Caso | Lição |
|---|---|
| Perfil Google tinha o website e disse-se "sem site" | 2b é obrigatória e regista-se o que o perfil mostra |
| Site novo invisível na pesquisa (caso Cátia Figo) | Testar sempre o domínio óbvio diretamente (2d) |
| Lugar do Ourives e metade de Cantanhede fora da lista | A lista vem do RNAL/RNET, nunca de pesquisas |
| Titular com vários apartamentos | Uma lead por titular, com `unidades` |
| Leads de 2 quartos encheram a lista (Anadia) | Já não saem: < 10 pessoas e até 2 tipos de quarto ficam com a etiqueta "Pequeno" no fim das listas (decisão do Diogo, 07/10/2026) |
| Gate5 e Virgílio dos Leitões eliminados como "moderno" | O site nunca elimina: moderno ou incerto vai para a Dúvida |
| Alojamentos sem Booking (Anadia) | Já não saem: muitos vendem pelo Airbnb ou outra plataforma. Sem plataforma nenhuma vão para a Dúvida (decisão do Diogo, 07/10/2026) |
| Leads "sem contacto" que tinham número (Anadia) | Ver todas as fontes, o site no browser, e guardar todos os números |
| Casa Gorjão "sem contacto": o Gonçalo encontrou o número a pesquisar "contactos" | No nível 2, pesquisar com "contactos" e, se o Google bloquear, usar o Bing |
| oceanvistalodge.eu tomado por site de gestora | Era uma página de afiliado: confirmar sempre para onde o link vai |
