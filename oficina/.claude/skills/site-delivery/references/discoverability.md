# Descoberta: motores de busca e IA

Esta área está cheia de conselhos que soam bem e não têm suporte. O que se segue separa o que tem evidência do que não tem, para não venderes ao cliente coisas que não funcionam.

## O que funciona mesmo

Por ordem de impacto:

**1. O conteúdo tem de estar no HTML servido.** Se só aparece depois de o JavaScript correr, parte dos crawlers não o vê. Renderização estática ou no servidor não é preferência de performance — é a condição de existir.

**2. Nada pode estar a bloquear os crawlers.** Esta é a falha invisível mais comum. Camadas de proteção contra bots — o Bot Fight Mode da Cloudflare é o exemplo clássico — bloqueiam silenciosamente os crawlers de IA. O site funciona perfeitamente para ti e é invisível para o ChatGPT.

Verifica no `robots.txt` e na configuração do WAF que estes não estão bloqueados: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `ClaudeBot`, `Google-Extended`, `Bingbot`.

**3. Estrutura semântica visível.** Um `<h1>` por página, hierarquia coerente, respostas diretas logo no início de cada secção, listas e tabelas em HTML real. Isto vale mais para extração por IA do que qualquer marcação escondida — ver a secção seguinte.

**4. Velocidade e estabilidade em mobile.** Não em localhost: em rede real, num telemóvel médio.

**5. Conteúdo original e específico que uma máquina possa citar.** Números, factos, respostas concretas. Texto genérico não é citável.

## Dados estruturados (JSON-LD): útil, mas não pelo motivo que se costuma dizer

Mete JSON-LD. Mas percebe o que ele faz e o que não faz, para não o venderes mal.

**O que faz:** o Google e o Bing continuam a interpretar JSON-LD durante o rastreio e a indexação, para compreensão de entidades, sinais de Knowledge Graph e elegibilidade para resultados enriquecidos.

**O que não faz:** a maior parte dos crawlers de IA não interpreta JSON-LD semanticamente — tokeniza a página inteira, incluindo o bloco de script, como texto comum. Não existe um "pipeline de schema para IA".

**Conclusão prática:** HTML semântico visível ganha a schema escondido para extração por IA em quase todos os casos. O JSON-LD vale pela indexação convencional e pelos resultados enriquecidos, que por sua vez aumentam a hipótese de a página chegar à camada que alimenta as respostas de IA. É ator secundário, não protagonista.

Tipos que valem sempre a pena num site de negócio local ou profissional: `Organization` ou `LocalBusiness` (ou o subtipo correto), `WebSite`, `BreadcrumbList`, `FAQPage` quando houver perguntas reais, e `Person` para profissionais individuais.

Valida sempre no Rich Results Test do Google. Schema inválido não é neutro — pode desqualificar a página.

## llms.txt: barato, mas não o vendas

Sê honesto com o cliente sobre isto.

A adoção ronda os 10% dos domínios medidos, e a maior análise pública (SE Ranking, cerca de 300.000 domínios) não encontrou correlação entre ter `llms.txt` e frequência de citação por IA. O Google confirmou publicamente que não usa o ficheiro e não planeia usar — John Mueller comparou-o à antiga meta tag de keywords. Nenhum fornecedor grande (OpenAI, Anthropic, Google, Meta, Mistral) se comprometeu publicamente a usá-lo em produção.

Onde tem uso real: ferramentas para programadores — assistentes de código que vão buscar documentação em tempo real.

**Veredicto:** se custa uma hora, publica. Não o ponhas na proposta como a linha de "visibilidade em IA". Isso é vender fumo, e um cliente que verifique descobre.

## Verificação

```bash
node scripts/preflight.js --url https://preview-url
```

Cobre: HTTPS, cabeçalhos de segurança, robots.txt, sitemap, canónicos, meta e Open Graph, `<h1>` únicos, JSON-LD presente e sintaticamente válido, viewport, acesso dos crawlers de IA, e URLs de staging indexáveis.

## Antes e depois

Sem medição não há prova de valor, e sem prova de valor não há caso de estudo nem referência.

Antes de lançar, regista o que existir: posições atuais, tráfego mensal, e — se o cliente tiver Search Console — as páginas com mais impressões. Depois de lançar, instala analítica e verifica outra vez ao fim de 30 e 90 dias.

Se o cliente não tiver Search Console, criar a propriedade e verificá-la faz parte da entrega.
