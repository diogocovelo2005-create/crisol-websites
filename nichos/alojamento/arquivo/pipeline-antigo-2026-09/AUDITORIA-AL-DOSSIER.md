# Auditoria do al-dossier e da passagem para adaptar-molde

Data: 21 de setembro de 2026.

**Conclusão:** o `al-dossier` tem uma boa metodologia de investigação e uma preocupação editorial muito útil. Ainda não tem um contrato suficientemente consistente e verificável para permitir construir a base com uma margem de erro muito baixa. A prioridade é tornar explícito, para cada informação e imagem, o âmbito, a prova, a atualidade e o uso permitido, e obrigar a skill de construção a respeitar esse contrato.

Não foi medida uma taxa de erro. Os testes abaixo demonstram falhas concretas, não uma estimativa estatística de fiabilidade.

## 1. Âmbito e versões

Foram lidos integralmente:

- [al-dossier/SKILL.md](.claude/skills/al-dossier/SKILL.md), as cinco referências e o validador;
- [adaptar-molde/SKILL.md](.claude/skills/adaptar-molde/SKILL.md), as oito referências e os dois scripts;
- o contrato atual de conteúdo em [molde/src/lib/casa.ts](molde/src/lib/casa.ts) e os requisitos de conteúdo do catálogo em [registo.ts](molde/src/components/variantes/registo.ts);
- o `SKILL.md` de `arquivo/skills-zip/adaptar-template.zip`.

Foram também inspecionados os outputs existentes: documentação de síntese, quartos, fontes, fotos e partes do corpus de reviews do Cerrado dos Outeirinhos; estrutura, resumo, índice de fotografias e partes do dossiê da Casa de Fataunços; conteúdo do site do Cerrado; e os registos de adaptação dos dois sites, incluindo as intervenções do Diogo, correções e rondas posteriores. Foram conferidos no molde atual os contactos, apresentação das avaliações, consumo do texto dos espaços e medição de scroll. Não foi relida individualmente cada review nem revista visualmente cada fotografia. Não foi repetida a pesquisa externa dos alojamentos nem executada uma nova vistoria aos sites no browser.

O nome ativo é `al-dossier`, e o consumidor ativo é `adaptar-molde`. A versão arquivada `adaptar-template` **não escreve conteúdo e exige que os textos e fotos já estejam no projeto**. Se se usasse literalmente essa versão, faltaria uma etapa entre o dossiê e a adaptação: o `al-dossier` também exclui escrever os textos do site. O `adaptar-molde` atual cobre essa etapa.

Esta auditoria criou apenas este relatório. Não alterou skills, dossiês ou sites.

## 2. Processo atual, do input ao output

| Etapa | O que recebe e faz | O que entrega | Avaliação |
|---|---|---|---|
| 0. Preparação | Nome, concelho/morada, links; decide recolha de textos e fotos; lê trabalho anterior e restrições | Pasta da casa, registo em `dono.md`, decisão no resumo | Bom. Deve reutilizar dados já fornecidos e localizar também as fotos do dono, como já manda fazer para os textos |
| 1. Identidade | Compara pelo menos dois identificadores entre fontes; distingue tipo e concelho | Fontes confirmadas ou por verificar | Essencial. Falta separar claramente casa, marca, unidade, gestor e anúncio |
| 2. Recolha | Percorre canais públicos, expande textos e reviews, pesquisa quartos com datas/ocupações, descarrega e indexa fotos | Factos, quartos, canais, reviews, voz, textos, fotos e informação de registo | Muito completa na intenção. A cobertura real depende do acesso e não tem um estado final uniforme |
| 3. Cruzamento | Procura conflitos, informação antiga e confirmação no RNT | Conflitos e limitações | Ordem correta, antes da síntese. Faltam âmbito e datas separados para evitar falsos conflitos e falsa atualidade |
| 4. Análise editorial | Lê reviews e voz da casa; identifica pontos fortes, momentos, sensações, públicos e atritos | `pontos-fortes.md` com provas, frequência, atualidade e fotos | É a parte mais forte da skill. A contagem precisa de uma ligação auditável a todas as reviews que a sustentam |
| 5. Uso no site | Divide afirmações entre facto, citação e proibição | `site-pronto.md` | É a ponte certa, mas contém regras ambíguas e não é imposta pelo consumidor |
| 6. Organização | Distribui material por ficheiros e etiqueta afirmações | Dossiê completo em Markdown e imagens locais | Boa navegação humana. Repetição manual facilita divergências |
| 7. Resumo | Destila argumentos, factos, materiais e pendências | `resumo.md` como entrada | Útil, mas pode voltar a promover algo que outro documento bloqueou |
| 8. Validação | Corre Python e aplica checklist manual | Resultado de validação | O script verifica apenas uma parte do contrato e aceita casos claramente incompletos |
| Construção | Copia molde, lê dossiê, escolhe composição, escreve conteúdo e trata imagens | Site, `casa.ts`, `ADAPTACAO.md`, registo de variações | Precisa de validação de entrada e rastreabilidade de conteúdo, além da validação visual e técnica |

### O que cada output deve continuar a fazer

| Ficheiro | Função a preservar | Melhoria necessária |
|---|---|---|
| `resumo.md` | Explicar rapidamente por que alguém escolheria a casa | Acrescentar estado de prontidão e apontar para afirmações identificadas, sem as reclassificar |
| `pontos-fortes.md` | Encontrar argumentos específicos e desejáveis | Associar cada argumento às reviews que entram na contagem e ao respetivo modo de utilização |
| `site-pronto.md` | Decidir o que pode chegar ao site | Torná-lo completo, inequívoco e obrigatório; contemplar condições e ausência de dados |
| `descricao-al.md` | Preservar a voz e o posicionamento da casa | Distinguir declaração, citação literal e síntese editorial |
| `reviews.md` | Preservar testemunhos completos | IDs únicos estáveis, origem localizável, duplicados ligados, original separado da tradução |
| `factos.md` | Guardar características e espaços | Uma afirmação por entrada, âmbito e estado explícitos |
| `quartos.md` | Descrever tipos/unidades e respetivos atributos | Separar inventário, disponibilidade, ocupação e tarifa |
| `dono.md` | Preservar decisões e restrições | Atualizações com data, fonte e entidades afetadas; distinguir preferência editorial de confirmação factual |
| `canais.md` | Contactos, reputação e reservas | Separar reservar de pedir disponibilidade, identificar canal principal e condições |
| `compliance.md` | Registar o que se conseguiu verificar | Tratar registo oficial como classe de fonte própria e não confundir ausência pública com incumprimento |
| `fontes.md` | Identidade, cobertura, conflitos e limitações | Catálogo de fontes com IDs, URLs, blocos e estados uniformes |
| `marketing/textos.md` | Preservar os textos publicados | Fonte exata por bloco e separação inequívoca entre autor e plataforma |
| `marketing/fotos.md` | Catálogo de imagens utilizável por outro agente | Âmbito físico, atribuição a unidades, atualidade, restrições, derivação e possibilidades de recorte |

## 3. O que já está bem desenhado

1. **Investiga antes de desenhar.** Evita escolher um efeito e inventar uma experiência para o preencher.
2. **Procura argumentos específicos.** Momentos, surpresas, gestos de hospitalidade e detalhes são mais úteis do que uma lista genérica de comodidades.
3. **Dá importância à casa e aos hóspedes.** Preserva intenção editorial e experiência vivida.
4. **Exige reviews completas, incluindo queixas e respostas.** Evita construir uma narrativa a partir de primeiras linhas ou de elogios escolhidos sem contexto.
5. **Confirma identidade antes de usar fontes.** Reduz um dos erros mais graves: misturar alojamentos.
6. **Distingue tipo de estabelecimento e concelho.** Já previne erros que um molde genérico facilmente introduziria.
7. **Guarda conflitos e informação antiga.** Não obriga o agente a escolher uma versão arbitrária.
8. **Recolhe o conjunto de fotografias e preserva originais.** A escolha visual fica com o agente que conhece a composição final.
9. **Regista restrições do dono.** É uma boa base para evitar que uma atualização reintroduza material recusado.
10. **Já criou `site-pronto.md`.** A solução deve desenvolver esta ponte, preservando o investimento feito.

## 4. Problemas demonstrados e respetivas correções

### 4.1. O validador aprova outputs que não estão prontos

Executei `validar-dossie.py` nos dois dossiês existentes, com Python 3.13.5 e Pillow 12.1.0:

| Dossiê | Código de saída | Resultado |
|---|---|---|
| Cerrado dos Outeirinhos | 0 | 0 erros, 0 avisos |
| Casa de Fataunços | 1 | 53 erros, 0 avisos |

Os 53 erros da Fataunços incluem três documentos obrigatórios ausentes (`site-pronto.md`, `quartos.md`, `dono.md`), formato antigo de reviews, campos de análise ausentes e diferenças entre índice e ficheiros de imagens. Não são 53 erros factuais comprovados: há incompatibilidades de formato e deteções por texto, incluindo uma ocorrência de “Continuar a ler” numa nota sobre limitações.

Também executei seis casos sintéticos em pastas temporárias, sem modificar os dossiês reais:

| Caso deliberadamente incompleto/incorreto | Resultado atual |
|---|---|
| Todos os ficheiros obrigatórios existem, mas estão vazios | Passa: 0 erros |
| Uma review com título válido, sem tabela de contagens | Passa: 0 erros |
| Citação inventada, ligada a um ID existente marcado com estrela; o texto original diz outra coisa | Passa: 0 erros |
| Índice aponta para fotografia inexistente e não existe a pasta de fotos | Passa: 0 erros |
| Tipo de quarto tem tabela e título, mas a ficha está vazia | Passa: 0 erros |
| Duas reviews diferentes usam o mesmo ID | Passa: 0 erros |

Causas no [validador](.claude/skills/al-dossier/scripts/validar-dossie.py):

- linha 72: verifica existência, não conteúdo útil;
- linha 77: um dicionário sobrescreve IDs duplicados;
- linhas 82–89: valida referência e estrela, não a fidelidade da citação;
- linha 94: se não houver tabela, não verifica contagens;
- linhas 114–123: valida título de ficha, não campos nem completude;
- linha 140: sem pasta de fotos, salta a validação do índice;
- linhas 164–167: uma exceção ao abrir a imagem é ignorada;
- não verifica se uma afirmação autorizada está simultaneamente bloqueada noutro ficheiro;
- não verifica cobertura de fontes, contagens de galerias, ligações a provas locais, restrições do dono ou âmbito das afirmações.

**Correção:** validação estrutural explícita, integridade entre referências e uma revisão semântica final. O resultado deve distinguir “estrutura válida”, “conteúdo revisto” e “pronto para construir”. Um script não consegue provar sozinho que uma página externa diz a verdade ou que uma foto representa a unidade correta.

### 4.2. O mesmo dossiê autoriza e bloqueia a mesma informação

No Cerrado, que passa no validador:

- [`site-pronto.md`, linha 16](casas/cerrado-dos-outeirinhos/dossie/site-pronto.md) autoriza “quatro quartos duplos e duas suites”, remetendo para uma nota de conflito. [`fontes.md`](casas/cerrado-dos-outeirinhos/dossie/fontes.md) mantém em aberto “duas suites” versus “uma suite + cinco quartos”. A remissão não resolve o conflito.
- [`resumo.md`, linha 51](casas/cerrado-dos-outeirinhos/dossie/resumo.md) diz que não se sabe quem faz hoje os doces; a linha 66 volta a dizer que a D. Ana os faz, com uma ressalva histórica.
- O passeio de carro para o restaurante aparece nos momentos atuais do resumo e reaparece no fim como “uma menção”. A regra da skill exclui esses momentos do grupo dos mais contados.
- [`site-pronto.md`, linha 27](casas/cerrado-dos-outeirinhos/dossie/site-pronto.md) autoriza voucher-presente com prova “sem data”, apesar de a regra pedir prova com menos de dois anos.

Estes exemplos demonstram inconsistência interna. Não demonstram que o alojamento tenha efetivamente uma ou duas suites ou que já não venda vouchers.

**Correção:** cada afirmação recebe um ID e uma decisão única. Separar “seis unidades / doze utentes” da classificação comercial e da classificação do registo. O resumo deve apresentar o estado decidido, não voltar a interpretar a evidência.

### 4.3. A skill seguinte não exige o contrato de utilização

O [adaptar-molde](.claude/skills/adaptar-molde/SKILL.md) diz “lê o dossiê”, mas não estabelece:

- leitura obrigatória de `dono.md` e `site-pronto.md` antes da escrita;
- prevalência dos bloqueios sobre frases apelativas de outros documentos;
- proibição de converter opinião ou inferência em facto;
- uma política quando falta um atributo do molde;
- ligação entre o texto final e as provas utilizadas.

O [novo-site.mjs, linha 37](.claude/skills/adaptar-molde/scripts/novo-site.mjs) verifica apenas se o caminho `dossie` existe. Não valida o conteúdo nem o estado de prontidão antes de copiar o molde e instalar dependências.

Há ainda diferenças entre os dados pedidos e o modelo de destino. O `casa.ts` do molde não inclui IDs de evidência, apresenta uma média sem escala/fonte explícitas, tem contactos de exemplo e um campo chamado `rnal` mesmo quando a casa pode ter outro tipo de registo. O site real do Cerrado já precisou de acrescentar `reviews.fonte`.

**Correção:** validar a entrada antes de copiar; ler primeiro restrições e contrato; omitir campos desconhecidos; associar conteúdo final a IDs numa secção curta de `ADAPTACAO.md` ou num mapa separado. Incluir metadados, alt text e dados estruturados na mesma revisão, caso sejam produzidos.

### 4.4. Proveniência, certeza, atualidade e autorização estão misturadas

As cinco etiquetas respondem a perguntas diferentes:

- `[OFICIAL]` e `[PLATAFORMA]`: de onde veio;
- `[OPINIAO]`: natureza do conteúdo;
- `[INFERIDO]`: transformação feita pelo agente;
- `[A_VERIFICAR]`: estado de validação.

Uma informação pode ser publicada pelo dono, objetiva e estar desatualizada. Uma fotografia pode ser publicada pela casa e não ter unidade identificada. Uma opinião pode ser recente e não permitir uma promessa geral.

Contradições adicionais:

- `campos.md` manda classificar tudo o que o Booking mostra num quarto como `[OFICIAL]`, mas `proveniencia.md` exige identificar o autor/bloco;
- a regra “oficial ou confirmado por várias fontes” não explicita independência e compete com “uma opinião nunca passa a facto”;
- o registo público é usado como `[OFICIAL]`, embora a definição da etiqueta se limite a canais da casa;
- o Cerrado usa `[TERCEIROS]`, necessário para portais/guias e explicitamente solicitado nesse trabalho, mas ausente da taxonomia da skill;
- a regra sobre paráfrase permite “paráfrase fiel” como oficial e, logo depois, transforma “reformular com as tuas palavras” em inferência;
- proibir genericamente `[PLATAFORMA]` é demasiado amplo para notas, números de avaliações e outras métricas cuja própria fonte é a plataforma.

**Correção:** separar campos: autor/origem, natureza, estado, datas, âmbito e modo de uso. A mesma frase conserva a sua proveniência mesmo quando entra em conflito. Uma reformulação fiel de um facto permitido continua a poder ser usada; uma síntese de experiências não se transforma automaticamente em garantia.

### 4.5. Falta âmbito aos factos comerciais

Em [`quartos.md`, linhas 14–16](casas/cerrado-dos-outeirinhos/dossie/quartos.md), “Restam-nos 4” é utilizado para estabelecer quatro unidades desse tipo. **Unidades disponíveis numa pesquisa não estabelecem o inventário total.** A coincidência com outro total não basta para provar a distribuição.

Outros riscos que o contrato deve prevenir:

- pequeno-almoço incluído numa tarifa tornar-se “incluído em todas as reservas”;
- cancelamento gratuito em determinadas datas tornar-se política permanente;
- ocupação máxima de uma suite ser confundida com capacidade licenciada total;
- cozinha privativa de uma suite aparecer como espaço comum acessível a todos;
- existir adaptação de um quarto ser generalizado para acessibilidade integral;
- telefone publicado ser transformado em WhatsApp sem confirmação;
- formulário de pedido de disponibilidade ser apresentado como confirmação de reserva.

**Correção:** separar estabelecimento → unidade física/tipo comercial → tarifa → pesquisa de disponibilidade. Registar âmbito por afirmação e exigir que ele se mantenha no texto final. A preferência pelo Booking serve para encontrar detalhe; não torna cada campo apresentado uma prova universal.

### 4.6. “Recolher tudo” precisa de cobertura demonstrável

A skill manda procurar todas as plataformas e recolher todas as reviews/fotos acessíveis. O método é abrangente, mas não permite concluir que recolhe toda a informação disponível em cada execução.

Já existem limites bem documentados no Cerrado: Instagram e parte do Facebook exigiam sessão; o detalhe de uma suite não abriu. O problema é que não existe um contrato uniforme para esses estados.

**Correção:** completar `fontes.md` com uma matriz por fonte e tipo de material:

| Campo | Exemplo de conteúdo |
|---|---|
| Fonte e entidade | Anúncio identificado e casa/unidade a que pertence |
| Superfície percorrida | Páginas do site, galeria principal, galerias de quartos, reviews e ordenações |
| Estado | Completo no universo observado, parcial, bloqueado, não encontrado, não aplicável |
| Quantidade observada | Contagem indicada pela fonte, data e filtros |
| Quantidade recolhida | Originais, duplicados ligados, itens sem texto |
| Faltas | Número conhecido ou desconhecido, motivo e tentativas |
| Impacto | Impede identificação; impede atribuir foto; não impede construir uma base menor |

Separar contagens de fotografias, publicações, carrosséis, imagens de interface e ficheiros derivados. O número de publicações de uma rede não é a contagem de fotos. No índice do Cerrado, “53 fotos + 5 imagens” e duas fotos que dão erro ilustram por que estes universos precisam de ser conciliados explicitamente.

Definir percursos de descoberta: links dados, site e navegação completa, anúncios ligados, pesquisas por nome/local/identificadores e fontes referenciadas pela casa. Páginas públicas adicionais podem confirmar história ou localização; o RNT não deve ser descrito como a única fonte externa possível.

Conservar a ambição de recolher tudo o que é acessível. Em bloqueios, registar as tentativas e o que falta, sem ciclos indefinidos à procura de disponibilidade. “Não encontrado” nunca deve significar “não existe”.

### 4.7. Atualidade não pode ser uma única regra de dois anos

As instruções aproximam “recolhido agora” de “continua verdadeiro agora”. Uma página antiga consultada hoje não se torna uma confirmação recente de todos os serviços nela descritos. Uma foto carregada há anos não demonstra o estado atual do quarto.

**Correção:** distinguir:

- data de recolha;
- data de publicação;
- data da experiência/estadia;
- período de validade, quando existe;
- data e fundamento da última confirmação;
- motivo para rever novamente.

História e materiais do edifício, serviços atuais, preços de uma pesquisa, disponibilidade, pessoas e prémios têm ritmos de mudança diferentes. A política deve variar por classe; não basta substituir dois anos por outro prazo universal. Uma data relativa deve conservar a incerteza.

“Uma menção” também precisa de âmbito: uma única review não sustenta uma rotina da casa, mas uma única declaração explícita e atual do dono pode sustentar um contacto ou uma característica objetiva. Uma citação histórica pode continuar útil, desde que apareça como testemunho daquela data e não como promessa atual.

### 4.8. Fotografias: bom inventário, atribuição ainda frágil

Há uma regra excelente: estar na galeria de um quarto não prova que a foto seja desse quarto. Mas [marketing.md, linha 198](.claude/skills/al-dossier/references/marketing.md) permite atribuir com certeza quando a foto só aparece nessa galeria. **Exclusividade observada da galeria é uma pista, não confirmação suficiente.**

Outros pontos a corrigir:

- usar sempre o âmbito `propriedade`, `unidade`, `região` ou `marca`, mesmo que haja uma só foto; a regra atual permite arrumar uma foto isolada de região em interior/exterior;
- separar quem publicou de quem fotografou e do estado de autorização de utilização;
- indexar fotos fornecidas pelo dono com o mesmo cuidado das recolhidas; dizer “já tenho fotos” não garante que estejam localizáveis e prontas;
- registar dia/noite/estação quando observável, sem inventar data de captura;
- separar dimensões do original das de uma versão ampliada;
- tornar `aguenta hero` contextual: um interior pode representar o principal argumento; uma vertical pode ser excelente para mobile;
- fornecer recortes candidatos e ponto focal como apoio, deixando a verificação no layout final para a adaptação.

Um exemplo da importância da passagem: o dossiê do Cerrado não atribui com certeza `interior/casa-de-banho-01.jpg` à Suite Eira; o site apresenta essa imagem como “A casa de banho da Eira”. Há alterações posteriores pedidas pelo Diogo em `ADAPTACAO.md`; não é possível concluir só pelos ficheiros que nunca houve confirmação adicional. O que falta é essa confirmação ficar ligada à imagem no contrato partilhado.

### 4.9. Contagens editoriais precisam de prova e contexto

A skill pede contagens reais e leitura integral, mas guarda sobretudo o número e duas a quatro citações. As citações demonstram o tema, não a contagem total declarada.

**Correção:** por ponto forte/atrito, conservar os IDs que entram na contagem, grupos de duplicados, período e denominador. Gerar automaticamente as contagens a partir dessas ligações.

No Cerrado, 823 reviews recolhidas incluem 459 com texto. “230 reviews mencionam o anfitrião” precisa de indicar o universo analisado e se a contagem já descontou os duplicados. A expressão “nota ≥ 4” usada na análise precisa também de distinguir escalas de 5 e de 10; não equivale ao mesmo nível de satisfação.

Não excluir elogios concretos numa review de nota baixa, nem queixas concretas numa review de nota alta. Analisar o conteúdo positivo e negativo independentemente da classificação global.

Semelhança de linguagem não prova que duas reviews sejam falsas ou tenham origem comum. Distinguir duplicado confirmado de semelhança suspeita; manter a razão de agrupamento e a contagem bruta.

Para a síntese editorial, ligar cada argumento a: evidência, contraponto, frescura, fotos disponíveis e modo de uso. Evitar mínimos que obriguem a inventar “sumo”: uma casa com pouca evidência pode justificar uma página curta e boa.

### 4.10. Atualizações preservam história, mas precisam de estado atual

“Acrescenta, nunca reescrevas do zero” protege evidência. Porém, sem estados de substituição, acumula versões contraditórias e mantém resumos antigos vivos.

**Correção:** manter o histórico original, atualizar o registo canónico e regenerar as vistas de síntese. Factos e decisões podem estar ativos, substituídos, retirados ou pendentes. IDs de reviews não devem mudar quando entra uma review mais recente.

O `dono.md` do Cerrado regista decisões da recolha; o `ADAPTACAO.md` do site contém pedidos posteriores sobre fotos, textos e secções. Na próxima investigação, ler só `dono.md` não recupera necessariamente tudo o que foi decidido depois. A adaptação deve devolver ao registo da casa as decisões que afetem o material reutilizável. Preferir uma foto por razões de design não equivale a confirmar a divisão que ela mostra.

## 5. Output recomendado: três camadas

### Camada 1. Evidência preservada

Reviews, textos originais, fotografias e provas locais. Manter o material completo dentro da cobertura acessível, os IDs estáveis e a proveniência. É o arquivo que permite rever uma decisão.

### Camada 2. Conhecimento validado

Factos, unidades, espaços, canais, conflitos, restrições e afirmações de uso controlado. Cada entidade e afirmação tem ID. Esta camada resolve o que está confirmado, em que âmbito e para que utilização.

### Camada 3. Pacote para construir

`resumo.md` continua a ser a entrada humana. `site-pronto.md` passa a ser o contrato de uso. `pontos-fortes.md` conserva a interpretação editorial. A adaptação lê este conjunto e consulta as provas por referência quando precisa.

O agente deixa de ter de reinterpretar milhares de linhas para descobrir se uma afirmação pode chegar ao site. Continua livre para escolher títulos, narrativa, fotografias e composição dentro do que a evidência permite.

### Estrutura mínima a acrescentar

Recomendo um `contrato.json` versionado para os dados que exigem validação mecânica e são consumidos pelo site. Os documentos Markdown correspondentes devem ser vistas geradas desses dados, ou apontar aos mesmos IDs. Não criar dois conjuntos de factos mantidos manualmente.

```text
dossie/
  contrato.json           # entidades, afirmações, citações selecionadas,
                          # ativos, restrições, cobertura e prontidão
  resumo.md               # síntese editorial e estado da entrega
  site-pronto.md          # vista legível das decisões de uso
  pontos-fortes.md        # argumentos e respetivas provas
  ...                     # os documentos de evidência já existentes
  validacao.json          # verificações, limites e versão validada
```

Não é necessário migrar imediatamente todo o corpus de reviews para uma base de dados. Começar pelo contrato dos elementos utilizáveis e respetivas ligações; estruturar o corpus completo depois, se o volume o justificar.

### Campos mínimos por afirmação

| Campo | Função |
|---|---|
| `id` | Referência estável, independente da posição no documento |
| `entidade_id` | Casa, quarto, tarifa, espaço ou canal a que se refere |
| `afirmacao` | Uma única proposição, sem misturar várias condições |
| `natureza` | Facto, testemunho, promessa subjetiva, métrica ou inferência |
| `origem` | Casa, dono, registo público, hóspede, plataforma ou terceiro |
| `evidencias` | IDs com URL/bloco/trecho ou localização da prova |
| `ambito` | Unidades, datas, ocupação, tarifa, estação e exceções aplicáveis |
| `datas` | Recolha, publicação/experiência e confirmação |
| `estado` | Confirmado, conflitante, desconhecido, histórico, substituído ou retirado |
| `uso` | Afirmar, afirmar com condição, citar, inspiração editorial ou não usar |
| `restricoes` | Condições que o texto e a imagem têm de preservar |

`Inspiração editorial` permite trabalhar tom e direção; não permite acrescentar serviços, hábitos, horários ou garantias. O contrato deve aceitar linguagem evocativa sem exigir que todos os títulos sejam citações, mantendo controladas as promessas factuais implícitas.

Exemplo de transformação de evidência, meramente ilustrativo:

```text
Evidência: uma tarifa consultada para duas noites inclui pequeno-almoço.
Âmbito: aquele quarto, tarifa, datas e ocupação.
Pode sustentar: informação sobre essa oferta, com as condições.
Não sustenta: “Pequeno-almoço incluído em todas as reservas”.
Para alargar a afirmação: obter confirmação geral e explícita da casa.
```

### Conteúdo de `site-pronto.md`

1. Identidade canónica e estado de prontidão.
2. Restrições ativas do dono/utilizador.
3. Factos autorizados, com condições junto de cada linha.
4. Citações exatas prontas a usar, com autor, data, fonte, ID e estado de tradução.
5. Argumentos editoriais e limites da respetiva promessa.
6. Imagens utilizáveis e associações confirmadas a espaços/unidades.
7. Destinos de reserva e contactos, com comportamento esperado.
8. O que não usar e os conflitos relevantes.
9. Lacunas e alternativa segura para cada uma.

“Não encontrado” deve ser um estado explícito. O agente não deve ter de decidir se uma célula vazia significa “não existe”, “não procurado” ou “esqueci-me de recolher”.

## 6. Mapeamento do dossiê para a base

O dossiê deve informar a capacidade de conteúdo sem escolher o layout.

| Destino | Material necessário | Alternativa quando falta |
|---|---|---|
| Hero | Argumento sustentado, identidade, foto coerente, ação principal | Promessa factual mais simples; composição adequada às fotos disponíveis |
| Pilares | Factos curtos autorizados e respetivo âmbito | Menos pilares ou omissão da secção |
| Atmosfera | História confirmada, voz da casa e imagens de contexto | Focar arquitetura/ambiente comprovado, sem inventar biografia |
| Pico | Momentos ou experiências documentados, modo de uso e imagens | Outra forma de contar, menos momentos com adaptação validada, ou omissão |
| Espaços | Espaços reais, acesso comum/privativo e fotos correspondentes | Galeria geral sem atribuir quartos que não estejam identificados |
| Opiniões | Excertos fiéis, autor, plataforma e data; métricas separadas por escala | Omitir quando não há testemunhos utilizáveis |
| Fecho | Destino válido e tipo de ação: reserva ou pedido/contacto | Usar o canal verificado que existir |
| Rodapé e metadados | Nome, tipo de registo, localização e contactos autorizados | Omitir campos opcionais desconhecidos; nunca herdar valores do molde |

O catálogo pede, por exemplo, três momentos para alguns Picos, quatro a oito espaços para certas variantes e imagens com recortes específicos. O output pode declarar “há dois momentos utilizáveis e cinco espaços fotografados”; a adaptação escolhe um protótipo compatível. Não se deve recolher ou interpretar de forma enviesada só para satisfazer um número do catálogo.

## 7. Novo percurso de entrega

1. **Receber e reaproveitar o contexto:** identificar a casa, localizar material e decisões existentes, perguntar apenas pelo que falta e é essencial.
2. **Planear cobertura:** inventariar fontes, páginas, galerias, unidades e corpora de reviews a percorrer.
3. **Confirmar entidades:** ligar cada fonte à casa ou unidade certa; manter fontes incertas fora das afirmações aprovadas.
4. **Recolher com proveniência:** guardar texto original, fotos e metadados; atribuir IDs estáveis logo na entrada.
5. **Normalizar:** distinguir unidades, tarifas, datas, contactos, métricas e duplicados.
6. **Validar afirmações:** procurar confirmação e conflitos no mesmo âmbito; registar limitações e validade temporal.
7. **Extrair argumentos:** ler integralmente o material recolhido; ligar elogios e atritos às reviews efetivas.
8. **Classificar utilização:** autorizar, condicionar, citar ou bloquear cada elemento relevante para o site.
9. **Preparar a passagem:** gerar `site-pronto.md`, atualizar o resumo e listar lacunas com alternativas concretas.
10. **Verificar:** validação estrutural e revisão semântica do pacote; atribuir estado de prontidão.
11. **Construir:** o `adaptar-molde` valida e lê o contrato, escreve e desenha, preservando o âmbito das afirmações.
12. **Conferir o site:** cruzar os textos e imagens efetivamente utilizados com os IDs e restrições, além dos testes visuais e técnicos.
13. **Devolver decisões:** alterações de material, confirmações ou restrições recebidas durante a construção atualizam o registo da casa.

### Estados de prontidão

- **Pronto para base:** identidade segura, material utilizável e caminho de ação confirmado; verificações concluídas.
- **Pronto com limitações:** a base pode ser construída com omissões/restrições explícitas; as limitações não autorizam inventar.
- **Bloqueado para construção:** falta resolver algo essencial, como identidade ou ausência de qualquer caminho de contacto/reserva confirmado para o propósito previsto.

Cobertura parcial não implica automaticamente bloquear tudo. Ausência de Instagram não impede usar provas suficientes de outros canais. Falta de foto de uma suite impede atribuir-lhe uma imagem desconhecida, mas pode permitir uma apresentação geral dos quartos.

O estado deve separar prontidão para demonstração de prontidão para publicação, preservando a distinção que a skill já faz.

## 8. Validação recomendada

### Mecânica

- Documentos e campos obrigatórios presentes, com conteúdo ou ausência explicitamente justificada.
- Versão de schema reconhecida e todos os IDs únicos.
- Todas as referências resolvem para fontes, afirmações, reviews e ficheiros existentes.
- Excertos literais correspondem ao original; cortes marcados; traduções separadas e sujeitas a revisão.
- Contagens derivadas das ligações, com duplicados e denominadores explícitos.
- Fotografias abrem corretamente; resolução e caminhos reais; índice conciliado com disco e galerias.
- Nenhum ativo retirado/recusado pode estar no conjunto utilizável.
- Nenhuma afirmação conflitante/retirada aparece autorizada como facto.
- Campos de tarifas incluem condições; notas incluem plataforma, escala e data.
- Contactos e URLs têm formato válido e resultado da verificação de destino registado.
- O mapa do site referencia apenas elementos utilizáveis da versão validada do contrato.
- Pesquisa final de placeholders e dados da casa fictícia do molde.

### Semântica

- A prova pertence à mesma casa/unidade e sustenta a proposição completa?
- O texto alargou o âmbito de “nesta tarifa” para “sempre”, ou de “um hóspede contou” para “acontece todos os dias”?
- A fotografia prova apenas a existência visual de um objeto ou está a ser usada para prometer um serviço?
- O resumo conserva conflitos e exceções das fichas detalhadas?
- Uma decisão de estilo foi confundida com confirmação factual?
- O argumento continua específico, desejável e proporcional à evidência?

As verificações semânticas devem produzir um registo dos pontos examinados e pendentes. Não marcar tudo como aprovado por o script devolver zero.

## 9. Ordem de implementação

| Prioridade | Alteração | Resultado esperado |
|---|---|---|
| P0 | Corrigir contradições de regras e definir precedência de estados | O agente deixa de receber instruções incompatíveis |
| P0 | Fazer o consumidor ler obrigatoriamente `dono.md` e `site-pronto.md` e validar antes da cópia | A ponte já existente passa a controlar a construção |
| P0 | Corrigir os seis casos demonstrados no validador | “Passou” deixa de incluir documentos vazios e referências manifestamente incoerentes |
| P0 | Corrigir generalizações de quartos, disponibilidade e tarifas | Evita promessas comerciais que a evidência não sustenta |
| P0 | Tratar desconhecidos e limpar dados do molde | Elimina preenchimentos implícitos com dados fictícios |
| P1 | Introduzir IDs e contrato estruturado, com Markdown derivado | Reduz divergências entre resumo, fichas e site |
| P1 | Matriz de cobertura e política de atualidade por classe | Permite saber exatamente o que se recolheu e o que falta |
| P1 | Melhorar relações entre fotografias, espaços e unidades | Reduz trocas de quartos e representações indevidas da região |
| P1 | Rastrear conteúdo final e devolver decisões da adaptação | Mantém investigação e site consistentes ao longo das revisões |
| P2 | Automatizar relatórios, contagens, índice de imagens e deteção de duplicados | Poupa trabalho repetitivo sem substituir juízo editorial |

Começaria por uma passagem completa no Cerrado, porque já tem um dossiê rico e expõe casos reais de conflito, fotos sem unidade confirmada e fontes bloqueadas. Depois migraria a Fataunços, distinguindo incompatibilidade de formato de lacuna factual, e ensaiaria casos de pouca informação, material só do dono, Booking indisponível e restrição nova sobre uma foto anteriormente utilizada.

Não começaria por acrescentar dezenas de instruções ao `SKILL.md`. Ele já tem 560 linhas e várias regras repetidas. Reduziria o ficheiro principal ao percurso e às decisões obrigatórias, deixando contratos, campos e exemplos nas referências. As regras que admitem verificação devem também existir no validador.

## 10. Como medir a melhoria

Não prometer uma percentagem de erro sem medir execuções reais. Medir primeiro:

- proporção das afirmações factuais finais com evidência e âmbito registados;
- afirmações proibidas ou contraditórias que chegaram ao site;
- citações alteradas sem identificação;
- imagens atribuídas a unidades sem confirmação;
- contactos, links e valores fictícios herdados do molde;
- correções pedidas pelo Diogo por erro factual, separadas de preferências de design;
- cobertura efetiva das fontes acessíveis e lacunas assumidas;
- tempo gasto pelo construtor a procurar ou reinterpretar informação.

Os objetivos verificáveis são cobertura integral de rastreabilidade dos factos publicados, ausência de violações conhecidas do contrato e nenhuma lacuna preenchida por invenção. A verdade externa continua dependente da qualidade e atualidade das fontes.

**A melhoria decisiva é esta:** o output deve permitir ao agente construir com confiança porque cada argumento, facto, citação e imagem vem acompanhado do seu significado, prova, âmbito e limite de utilização. O arquivo pode ser extenso; a decisão sobre o que pode chegar à base tem de ser curta e inequívoca.

## 11. O que os dois processos anteriores revelam sobre a intervenção do Diogo

Fontes principais: [adaptação da Fataunços](casas/casa-de-fatauncos-vouzela/site/ADAPTACAO.md) e [adaptação do Cerrado](casas/cerrado-dos-outeirinhos/site/ADAPTACAO.md). Estes documentos são registos de trabalho, não transcrições completas das conversas. Permitem identificar padrões, mas não contar rigorosamente todas as intervenções ou atribuir cada problema à versão atual das skills. Algumas regras atuais já nasceram destas correções.

### 11.1. Casa de Fataunços

| Ocorrência documentada | Onde o processo falhou | Como reduzir a repetição |
|---|---|---|
| O dono tocar piano entrou nos textos; passou a “às vezes ouve-se um piano”; só depois da intervenção do Diogo ficou apenas a existência dos pianos | Uma experiência antiga foi transformada em expectativa atual. Atenuar a frase preservou a mesma promessa implícita | Bloquear a proposição e variantes semânticas: existem pianos, mas não se promete que alguém toque. Conferir hero, momentos e história contra a mesma restrição |
| O hero e a voz da casa passaram por várias versões, incluindo frases escritas pelo Diogo | O material estava disponível, mas a função de cada texto e o critério editorial não estavam estabilizados | Distinguir título de convite, explicação factual e voz citada. Apresentar no dossiê candidatos de voz com autoria confirmada e efeito editorial descrito; o construtor escolhe e revê antes de implementar |
| A autoria da apresentação do Booking foi confirmada numa fase posterior | A prova sobre quem escreveu chegou depois da utilização editorial | Confirmar bloco/autor logo na recolha e entregar excertos localizáveis |
| O Diogo forneceu fotografias adicionais do Booking que alteraram imagens de muitas secções | A adaptação começou com um conjunto de materiais que depois mudou substancialmente | Fechar inventário e condições de utilização antes da seleção visual; quando muda a autorização ou chega material novo, atualizar o contrato e rever apenas as secções afetadas |
| Fotos grandes fornecidas pelo dono e versões ampliadas ficaram misturadas; o índice conserva caminhos e dimensões antigas | Falta de rastreabilidade entre original, tratamento e ficheiro final | Originais preservados, derivados com origem explícita e dimensão medida; o seletor não prefere automaticamente o ficheiro com nome “ampliado” |
| A coleção “Ten Master Pieces” precisou de voltar à discussão e acabou com um cartão próprio | Um diferenciador concreto existia no dossiê, mas não tinha prioridade suficiente na composição | Matriz editorial: argumento distintivo, prova, foto, papel possível e consequência de o omitir. O construtor justifica a omissão de um diferenciador prioritário |
| Surgiram rondas sucessivas sobre sobreposição de fotos/texto, linha do dia, cartões e altura útil no telemóvel | Componentes muito sensíveis à quantidade de texto, formato da imagem e altura do browser | Limites de conteúdo por variante, ensaios de conteúdo curto/longo e testes nas alturas onde o layout muda |
| O comportamento de secção presa tornou a revisita cansativa e o Diogo pediu que prendesse só na primeira passagem | O teste técnico não cobria suficientemente a experiência de voltar à secção | Critério explícito de percurso completo: descer, subir, voltar por âncora, refresh e modo livre |
| Cor, textura de madeira, tamanho do título e tratamento de links exigiram direção do Diogo | Mistura de preferência estética com legibilidade e reconhecimento de interação | Guardar preferências confirmadas no âmbito certo e avaliar CTA sobre a fotografia real, não apenas por contraste entre duas cores |

**Cuidado na interpretação das fotos:** o resumo da Fataunços regista uma decisão anterior de usar só site + dono e retirar fotos do Booking/Airbnb; o registo posterior diz que o Diogo trouxe fotos do Booking. Não se pode chamar a toda essa mudança uma falha de recolha. O problema comprovado é que a alteração de decisão não foi refletida de forma consistente no resumo e no índice. A skill atual também relata uma falha de cobertura de fotos neste caso; os dois fatores precisam de ser distinguidos.

**Estado desatualizado demonstrável:** o resumo ainda inclui o dono tocar piano entre os momentos mais contados, enquanto o registo da adaptação documenta a decisão final de não o prometer. Uma nova construção a partir desse resumo pode reintroduzir uma afirmação que já deu trabalho a retirar.

### 11.2. Cerrado dos Outeirinhos

| Ocorrência documentada | Onde o processo falhou | Como reduzir a repetição |
|---|---|---|
| O registo abre como “Terceira versão”, com mudanças de Pico, Espaços, Fecho e Hero | A escolha inicial de composição e personalidade não convergiu suficientemente com a casa e com a direção desejada | Fazer uma crítica editorial do conjunto antes de montar: o efeito comunica casa habitada, museu, hotel ou outra coisa? Usar evidência da voz e fotografias, não só idade do edifício |
| O livro antigo foi afastado por fazer a casa parecer um museu; as portadas também foram rejeitadas | Associação visual demasiado literal entre “casa antiga” e estética escolhida | Entregar contraste de posicionamento sustentado: património com vida atual; separar inferência estética da identidade efetiva |
| “A visita” deu lugar a “A serra” porque a visita era óbvia e a localização tinha mais valor | Frequência de menção não equivale a relevância suficiente para cada secção | Selecionar argumentos por especificidade, interesse para a decisão, prova e apoio visual; evitar repetir a visita dos espaços no Pico |
| Opiniões e Fecho foram fundidos porque existiam duas secções de opiniões | Cada componente funcionava isoladamente, mas o conjunto repetia a mesma função | Rever redundância narrativa antes do código; declarar que conteúdo é exclusivo, partilhado ou omitido por variante |
| As citações saíram do Pico por pedido do Diogo | A evidência foi confundida com o formato final de apresentação | O dossiê entrega provas; a composição decide onde aparecem. Registar a preferência aplicada a esta casa sem a impor automaticamente a todas |
| A fotografia dia/noite fornecida pelo Diogo foi mal interpretada; tentou-se outra mecânica para compensar um suposto desalinhamento | Alterou-se a solução antes de confirmar a relação entre os ativos recebidos | Identificar a família de imagens e testar enquadramento/recorte antes de mudar a interação |
| WhatsApp passou a telefone; a avaliação ganhou fonte e data | O molde pressupõe canais e formatos que não existem em todas as casas | Canal secundário opcional e tipado; avaliações com origem, escala, total e data |
| `casa.visita.intro` estava preenchido, mas a variante E2 não o mostrava; a decisão ficou presa a um limite de ajustes | Faltava verificar conteúdo efetivamente renderizado; uma regra administrativa impedia corrigir uma omissão útil | Contrato de campos por variante e verificação de conteúdo no DOM; permitir adaptação justificada, como a skill atual já prevê |
| O Diogo voltou a apontar salto do hero com a barra do browser, sobreposição de opiniões e excesso de texto no Pico | Regressões de comportamento já conhecidas e validação demasiado concentrada em dimensões padrão | Trazer correções transversais para o molde e testar alturas úteis, todos os estados e o maior texto real |
| O mobile dos espaços era estático e foi pedido um comportamento animado | Preferência de produto não codificada para a variante escolhida | O catálogo deve mostrar e descrever o comportamento mobile, e a escolha deve considerá-lo desde o início |

O registo do Cerrado contém restrições antigas, como limite de seis ajustes, e diz que não havia variantes de hero. A skill e o catálogo atuais já mudaram: permitem fusões e incluem variantes de hero. Essas limitações históricas não devem ser apresentadas como se ainda fossem regras atuais.

### 11.3. Problemas que continuam no molde atual

Foi feita uma conferência estática, sem alegar uma reprodução nova em browser:

- [Provas.tsx](molde/src/components/seccoes/Provas.tsx) desenha cinco estrelas fixas e mostra média/total sem fonte, escala ou data no componente.
- As variantes de Fecho [Cortina](molde/src/components/variantes/fecho/Cortina.tsx), [Moldura](molde/src/components/variantes/fecho/Moldura.tsx), [Portadas](molde/src/components/variantes/fecho/Portadas.tsx) e [Postal](molde/src/components/variantes/fecho/Postal.tsx) constroem links `wa.me` a partir do contacto de exemplo.
- [useProgresso.ts](molde/src/lib/useProgresso.ts) continua a recalcular em todos os eventos `resize`; [Hero.tsx](molde/src/components/seccoes/Hero.tsx) continua com palco `h-dvh`. A proteção descrita nos dois projetos contra mudanças só de altura em ecrãs de toque não aparece nestes ficheiros do molde.
- [Indice.tsx](molde/src/components/variantes/espacos/Indice.tsx) não renderiza `visita.intro` e o seu ramo mobile continua como lista estática. O último ponto é uma opção de produto, não um bug por si só.

Isto explica por que melhorar só o dossiê não elimina toda a intervenção. Há pressupostos e correções repetíveis na base técnica.

## 12. Lista de melhorias do pipeline orientada a menos intervenção

### Aplicar primeiro: evitar que o Diogo faça controlo de qualidade básico

1. **Contrato de entrada obrigatório.** `adaptar-molde` valida a prontidão e lê restrições e modos de uso antes de copiar/escrever. Responsável: ambas as skills e `novo-site.mjs`.
2. **Uma decisão por afirmação.** Não admitir a mesma proposição como autorizada e por confirmar. Bloqueios acompanham o ID em todas as vistas. Responsável: `al-dossier` e validador.
3. **Âmbito comercial explícito.** Inventário não sai de “restam”; uma tarifa não define todas as reservas; unidade privativa não vira espaço comum. Responsável: recolha e contrato.
4. **Corrigir os casos que o validador aceita indevidamente.** Incluir ausência justificada, IDs, citações e imagens. Responsável: validador.
5. **Preservar decisões após a construção.** Retirada do piano e entrada de novas fotos atualizam o dossiê, com histórico. Responsável: etapa de fecho da adaptação.
6. **Eliminar pressupostos do molde.** Contactos opcionais, tipos de registo, métricas por escala/fonte, falta de reviews e dados desconhecidos devem ter representação própria. Responsável: modelo de conteúdo e componentes.
7. **Integrar correções transversais já confirmadas.** Selecionar as correções de mobile, medição e conteúdo dos dois sites, adaptá-las ao molde e verificar compatibilidade entre variantes. Não copiar indiscriminadamente todo o código específico de cada casa.

### Aplicar depois: melhorar a primeira proposta

8. **Ficha editorial de passagem, curta.** Promessa sustentada, três a cinco argumentos prioritários, voz, diferenciais, repetições a evitar, limites factuais e fotografias disponíveis. Pode viver no resumo e em `pontos-fortes.md`.
9. **Distinguir peso de frequência e peso de diferenciação.** “Anfitrião simpático” pode ser frequente; uma coleção de arte utilizável pode ser muito mais distintiva. A escolha considera ambas as dimensões e a força da prova.
10. **Inventário visual pronto antes da composição.** Identificar faltas, pares de imagens relacionados, originais e derivados, recortes possíveis e divisões realmente confirmadas.
11. **Perfil editorial com âmbito.** Guardar preferências já expressas pelo Diogo, exemplos aceites/rejeitados e respetiva razão. Separar regra geral, decisão de uma casa e experiência ainda não estabilizada. Não transformar uma preferência específica em automatismo universal.
12. **Crítica do conjunto antes da implementação.** Verificar se Hero, Atmosfera, Pico e Espaços repetem a mesma história; se o principal diferenciador aparece; se o visitante percebe onde dorme, o que recebe e como reserva. A skill faz esta revisão autonomamente, sem criar uma nova ronda obrigatória de aprovação.
13. **Catálogo com contrato de conteúdo.** Para cada variante: campos realmente renderizados, imagens exigidas, número de itens suportado, comportamento mobile e tolerância a texto. Não substituir a inspeção do componente por descrições ou capturas antigas.
14. **Escrita ajustada ao espaço real.** O construtor prepara versão curta e completa a partir dos mesmos factos; corta repetição antes de reduzir progressivamente a letra para fazer caber tudo.

### Fechar o ciclo: uma correção deve beneficiar a casa seguinte

15. **Revisão factual do site efetivamente renderizado.** Texto visível, citações, associação das fotos, alt text, contactos e metadados comparados com o contrato; detetar dados preenchidos que a variante não mostra.
16. **Regressão visual e funcional proporcional.** Além dos dois tamanhos padrão, cobrir os limites onde o layout muda, ecrãs baixos/paisagem e todos os estados de citações/cartões. Usar browser real móvel para comportamentos que a emulação não reproduz, registando esse limite quando não estiver disponível.
17. **Separar validação de conteúdo e validação técnica.** Build e ausência de overflow não demonstram a qualidade da narrativa, a veracidade dos factos ou a correção de uma foto.
18. **Registo de intervenções por causa.** Para cada correção do Diogo: recolha, facto, interpretação, direção editorial, UX, bug, material novo ou mudança de âmbito. Destino do aprendizado: dossiê da casa, skill, catálogo ou molde.
19. **Distinguir base e expansão pedida.** Uma nova página de quartos ou um efeito específico pode ser uma decisão legítima de produto. Não contar essa expansão como erro da base; manter os dados dos quartos disponíveis para não obrigar a nova pesquisa.
20. **Avaliar numa nova casa sem assistência corretiva.** Registar a primeira proposta, as falhas detetadas autonomamente e as intervenções posteriores do Diogo. Comparar por causa, sem usar a qualidade do site final como prova de que a primeira execução correu bem.

### Critério de sucesso operacional

O alvo é que o Diogo deixe de precisar de recolher fotografias que a pesquisa deveria ter localizado, corrigir promessas sem prova, identificar contactos inventados, descobrir texto não renderizado e voltar a reportar bugs já resolvidos noutra casa.

Pode continuar a escolher uma direção estética diferente ou pedir uma expansão. Essas decisões devem ficar mais raras e concentradas na direção do produto, com as verificações básicas já feitas e as preferências anteriores disponíveis ao agente.
