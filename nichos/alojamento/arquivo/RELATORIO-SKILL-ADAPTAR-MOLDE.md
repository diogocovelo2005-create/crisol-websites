# Relatório simples: skill `adaptar-molde`

> Relatório histórico, anterior à revisão de 2026-09-23. As descrições abaixo
> de escolha de variantes e secções fixas já não definem o processo atual.
> A fonte atual é [SKILL.md](.claude/skills/adaptar-molde/SKILL.md): fotografias
> e experiência primeiro, composição livre e protótipos apenas como exemplos
> opcionais. A entrega continua a ser uma base apresentável, não o site final.

## 1. Para que serve

A skill `adaptar-molde` transforma o dossiê de um alojamento numa landing page
base, pronta para ser mostrada ao potencial cliente em localhost.

O objetivo não é produzir imediatamente o site final. É criar uma primeira
proposta convincente, com boa qualidade e baixo custo de tempo e tokens, antes
de o cliente confirmar que quer avançar.

A skill parte de um molde e de protótipos já construídos. Escolhe uma
combinação, adapta-a à casa e verifica o resultado no browser.

## 2. Inputs

### Inputs obrigatórios

| Input | O que contém | De onde vem |
|---|---|---|
| Nome ou `slug` da casa | Identifica a pasta do projeto | Pedido do utilizador |
| Dossiê da casa | Factos, história, serviços, localização, contactos, opiniões e voz | `nichos/alojamento/casas/<slug>/dossie/` |
| Fotografias | Exterior, interiores, espaços, detalhes e envolvente | Dossiê ou pasta da casa |
| Molde | Estrutura, estilos, ferramentas e componentes base | `nichos/alojamento/molde/` |
| Registo de protótipos | Código, mecânica e liberdade de cada variante | `molde/src/components/variantes/registo.ts` |

Sem dossiê, a skill não começa. Não inventa informação para preencher campos
em falta.

### Inputs opcionais

- Preferências ou indicações dadas pelo Diogo.
- Logótipo e identidade visual existentes.
- Links de reserva, telefone, email e redes sociais.
- Restrições específicas do cliente.
- Sites de referência.
- Histórico de sites anteriores em `nichos/alojamento/VARIACOES.md`.

O histórico ajuda a evitar repetições automáticas, mas não proíbe reutilizar
uma variante que seja adequada.

## 3. Outputs

### Output principal

Uma landing page funcional em:

```text
nichos/alojamento/casas/<slug>/site/
```

Durante o trabalho, o resultado pode ser visto num endereço local, normalmente:

```text
http://localhost:3300
```

### Ficheiros e resultados produzidos

| Output | Para que serve |
|---|---|
| Site Next.js | Landing page completa da casa |
| `src/lib/casa.ts` | Conteúdo estruturado e factual do alojamento |
| `src/app/page.tsx` | Ordem e combinação final das secções |
| `public/fotos/` | Fotografias escolhidas e preparadas para o site |
| Componentes adaptados | Alterações aos protótipos necessárias para esta casa |
| `ADAPTACAO.md` | Resumo das decisões e verificações |
| Entrada em `VARIACOES.md` | Memória da combinação usada |
| Relatório de verificação | Resultado de browser, responsive, consola, contraste e build |

A skill entrega localmente. Não publica o site nem o envia ao cliente.

## 4. Processo do input ao output

```text
Pedido e slug
      ↓
Verificação do dossiê
      ↓
Cópia do molde para a pasta da casa
      ↓
Leitura dos factos, voz e fotografias
      ↓
Mapa das imagens e direção da página
      ↓
Escolha e combinação dos protótipos
      ↓
Conteúdo, imagens, paleta e tipografia
      ↓
Adaptações específicas à casa
      ↓
Verificação completa no browser
      ↓
Limpeza, registo e entrega em localhost
```

### Passo 1: preparar o projeto

A skill recebe o `slug` e executa o script de criação. O script:

1. Confirma que o dossiê existe.
2. Confirma que não vai substituir um site já existente.
3. Copia o molde para a pasta da casa.
4. Instala as dependências existentes do projeto.
5. Inicia a base que será adaptada.

### Passo 2: compreender a casa

A skill lê o dossiê antes de escolher qualquer layout. Resume:

- a principal promessa da casa;
- os factos que ajudam a convencer o visitante;
- a voz e o ambiente do alojamento;
- o que as opiniões reais repetem;
- os contactos e caminhos de reserva;
- as fotografias realmente disponíveis.

### Passo 3: organizar as fotografias

É criado um mapa simples das imagens. Para cada fotografia, a skill identifica:

- o que mostra;
- se é horizontal ou vertical;
- a sua qualidade;
- os recortes possíveis;
- as secções onde pode ser usada.

Uma fotografia só é usada quando corresponde ao texto. Se não existir a imagem
certa, a skill muda a composição ou o texto em vez de usar uma imagem errada.

### Passo 4: escolher os protótipos

A skill lê primeiro o registo técnico. Para cada protótipo, o registo indica:

- onde está o código;
- como funciona a interação;
- que conteúdo mínimo precisa;
- qual é o gesto que lhe dá identidade;
- que partes podem ser adaptadas.

A skill cria uma shortlist pequena, lê apenas o código das opções relevantes e
testa-as no catálogo interativo. Depois escolhe uma combinação para Hero,
Pilares, Atmosfera, Pico, Espaços, Opiniões e Fecho.

Não existe uma regra rígida que associe uma variante a um tipo de casa. A
escolha considera o conjunto real de conteúdo, imagens, ritmo e conversão.

### Passo 5: montar a página

A skill coloca os componentes escolhidos em `page.tsx` e define a ordem das
secções.

A ordem deve criar um percurso compreensível:

1. Apresentar a promessa.
2. Mostrar provas e características.
3. Criar desejo.
4. Dar confiança.
5. Conduzir à reserva ou ao contacto.

Uma secção pode mudar de posição, ser simplificada, fundida ou omitida quando o
conteúdo não a justificar.

### Passo 6: escrever o conteúdo

O conteúdo é escrito em `casa.ts` usando apenas o dossiê.

A skill adapta:

- títulos e subtítulos;
- descrições;
- factos práticos;
- narrativa da experiência;
- nomes dos espaços;
- opiniões reais;
- chamadas para ação;
- contactos.

As opiniões não são reescritas e os factos não são inventados.

### Passo 7: criar a identidade visual

A skill escolhe:

- paleta baseada nas fotografias e na casa;
- fonte para títulos e texto;
- tratamento das imagens;
- ritmo, espaçamento e hierarquia;
- detalhes gráficos e ornamentais.

O contraste é medido. A escolha não é alterada apenas para parecer diferente
de outro site quando isso pioraria o resultado.

### Passo 8: adaptar os protótipos

Os protótipos são uma base. A skill pode alterar:

- composição e proporções;
- posição de textos e imagens;
- recortes;
- responsive;
- velocidade, direção e intensidade das animações;
- navegação e controlos;
- momentos de scroll;
- detalhes da mecânica.

Não existe um limite numérico de alterações. Mudanças simples são feitas
livremente. Mudanças estruturais recebem mais validação.

Se nenhum protótipo encaixar, a skill parte do mais próximo e cria a menor
solução específica necessária. Não precisa de forçar uma opção inadequada.

### Passo 9: verificar no browser

A página é percorrida num browser real em desktop e mobile. A skill verifica:

- começo, meio e fim das animações;
- comportamento ao continuar e regressar no scroll;
- refresh a meio da página;
- botões, setas, links e contactos;
- teclado e foco;
- movimento reduzido;
- correspondência entre imagens e texto;
- recortes em desktop e mobile;
- contraste e legibilidade;
- erros de consola;
- scroll horizontal;
- lint, tipos e build.

As capturas podem ser usadas como apoio, mas não substituem esta verificação.

### Passo 10: limpar e entregar

Depois da verificação, a skill:

1. Remove o catálogo e componentes não utilizados do site do cliente.
2. Guarda as decisões principais em `ADAPTACAO.md`.
3. Regista a combinação em `VARIACOES.md`.
4. Entrega o endereço localhost e um resumo curto.

## 5. Decisões que a skill toma sozinha

A skill pode decidir sem perguntar ao Diogo:

- que protótipos usar;
- que ordem dar às secções;
- que imagens correspondem a cada conteúdo;
- que texto escrever a partir dos factos;
- que paleta e fontes usar;
- que adaptações visuais ou de movimento são necessárias;
- que problemas corrigir depois de testar no browser.

Só deve pedir intervenção quando faltar informação essencial, quando a ação
ultrapassar a landing page ou quando for necessária autorização externa, como
publicar ou alterar um serviço fora do repositório.

## 6. Resumo

Em termos simples:

```text
INPUT
Dossiê + fotografias + contactos + molde + indicações opcionais

PROCESSO
Compreender → selecionar → combinar → escrever → adaptar → testar

OUTPUT
Landing page base personalizada + localhost + registo das decisões e testes
```

O sistema procura equilibrar três objetivos: usar código aprovado, adaptar a
página suficientemente à casa e reduzir ao mínimo o trabalho manual do Diogo.
