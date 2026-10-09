/**
 * Registo técnico do catálogo.
 *
 * Este ficheiro descreve o que existe; não decide que estética pertence a
 * cada casa. A escolha nasce do conjunto real de conteúdo, fotografias e voz.
 * A mecânica completa continua no componente indicado em `ficheiro`.
 */

export const SECCOES = [
  { id: 'hero', titulo: 'Hero' },
  { id: 'pilares', titulo: 'Pilares' },
  { id: 'atmosfera', titulo: 'Atmosfera' },
  { id: 'pico', titulo: 'Pico' },
  { id: 'espacos', titulo: 'Espaços' },
  { id: 'opinioes', titulo: 'Opiniões' },
  { id: 'fecho', titulo: 'Fecho' },
] as const;

export type SeccaoPrototipo = (typeof SECCOES)[number]['id'];
export type EstadoPrototipo = 'aprovado' | 'por-avaliar';

export type RequisitosConteudo = {
  campos: readonly string[];
  imagens: { minimo: number; descricao: string };
  itens?: { minimo: number; maximo?: number; descricao: string };
  mobile: string;
};

export type Prototipo = {
  codigo: string;
  seccao: SeccaoPrototipo;
  nome: string;
  ficheiro: string;
  estado: EstadoPrototipo;
  mecanica: string;
  pede: string;
  manter: string;
  podeMudar: string;
};

export const PROTOTIPOS = [
  {
    codigo: 'H1', seccao: 'hero', nome: 'Cinema silencioso', estado: 'aprovado',
    ficheiro: 'src/components/variantes/PrototiposBase.tsx#HeroH1',
    mecanica: 'Plano fotográfico total e estático; promessa e CTA assentam na metade inferior.',
    pede: 'Uma fotografia horizontal forte e espaço legível para o texto.',
    manter: 'Entrada direta, hierarquia clara e CTA separado do parágrafo.',
    podeMudar: 'Alinhamento, densidade do véu, recorte, escala tipográfica e ritmo vertical.',
  },
  {
    codigo: 'H2', seccao: 'hero', nome: 'Nome que assenta', estado: 'aprovado',
    ficheiro: 'src/components/variantes/PrototiposBase.tsx#HeroH2',
    mecanica: 'O nome começa dominante e reduz continuamente até ficar centrado no cabeçalho; o texto sobe ligeiramente e desvanece.',
    pede: 'Uma fotografia calma e um nome que continue legível nas duas escalas.',
    manter: 'A passagem suave do nome-imagem para nome-navegação.',
    podeMudar: 'Escala inicial, posição do texto, distância percorrida, véu e duração, depois de testar o percurso inteiro.',
  },
  {
    codigo: 'H3', seccao: 'hero', nome: 'Imagem que respira', estado: 'aprovado',
    ficheiro: 'src/components/variantes/PrototiposBase.tsx#HeroH3',
    mecanica: 'A fotografia começa enquadrada, cresce até preencher o ecrã e permanece aberta.',
    pede: 'Uma fotografia suficientemente grande para suportar o recorte inicial e final.',
    manter: 'Expansão monotónica; nunca voltar a encolher no fim.',
    podeMudar: 'Margem inicial, raio, ponto de conclusão, véu e colocação da mensagem.',
  },
  {
    codigo: 'H4', seccao: 'hero', nome: 'Abertura para a casa', estado: 'aprovado',
    ficheiro: 'src/components/variantes/PrototiposBase.tsx#HeroH4',
    mecanica: 'Duas metades da mesma fotografia abrem lentamente para revelar a continuação.',
    pede: 'Uma fotografia cujo assunto sobreviva à divisão vertical.',
    manter: 'A abertura deve ter tempo para ser percebida e entregar a secção seguinte.',
    podeMudar: 'Direção ou assimetria da abertura, duração, véus e conteúdo revelado, sem criar um vazio intermédio.',
  },
  {
    codigo: 'PI1', seccao: 'pilares', nome: 'Faixa essencial', estado: 'aprovado',
    ficheiro: 'src/components/variantes/PrototiposBase.tsx#PilaresPI1',
    mecanica: 'Factos curtos, distribuídos numa faixa calma e lidos num relance.',
    pede: 'Três ou quatro factos concretos e comparáveis.',
    manter: 'Leitura rápida e peso visual inferior às secções narrativas.',
    podeMudar: 'Ícones, divisores, alinhamento, ordem e densidade.',
  },
  {
    codigo: 'PI3', seccao: 'pilares', nome: 'Cartões de estadia', estado: 'aprovado',
    ficheiro: 'src/components/variantes/PrototiposBase.tsx#PilaresPI3',
    mecanica: 'Factos em cartões compactos, com um cartão de destaque.',
    pede: 'Factos curtos e um dado que mereça destaque.',
    manter: 'Um cartão dominante e os restantes com leitura uniforme.',
    podeMudar: 'Número de cartões, proporções, destaque, cantos, ícones e composição responsiva.',
  },
  {
    codigo: 'A1', seccao: 'atmosfera', nome: 'Colagem em profundidade', estado: 'aprovado',
    ficheiro: 'src/components/variantes/PrototiposBase.tsx#AtmosferaA1',
    mecanica: 'Texto e duas fotografias sobrepostas constroem contexto e intimidade.',
    pede: 'Uma imagem de ambiente, um pormenor e história suficiente para dois ou três parágrafos curtos.',
    manter: 'Relação entre plano geral e detalhe.',
    podeMudar: 'Sobreposição, proporções, lado do texto, recortes e quantidade de texto.',
  },
  {
    codigo: 'A3', seccao: 'atmosfera', nome: 'Arquivo da casa', estado: 'aprovado',
    ficheiro: 'src/components/variantes/PrototiposBase.tsx#AtmosferaA3',
    mecanica: 'A narrativa é organizada em marcos com texto, data e fotografia.',
    pede: 'Dois ou mais acontecimentos verificáveis; as datas podem ser substituídas por marcos sem data.',
    manter: 'Progressão clara entre os marcos.',
    podeMudar: 'Número, formato e ordem dos marcos, proporção das imagens e posição da introdução.',
  },
  {
    codigo: 'P1', seccao: 'pico', nome: 'Relógio', estado: 'aprovado',
    ficheiro: 'src/components/variantes/pico/Relogio.tsx',
    mecanica: 'Três momentos avançam com o scroll; fotografia, texto, marcador e atmosfera mudam em conjunto.',
    pede: 'Três imagens e três momentos que formem uma sequência legível.',
    manter: 'Sincronia entre momento ativo, fotografia e marcador.',
    podeMudar: 'Forma de contar, cores, posição do marcador, duração e transições entre momentos.',
  },
  {
    codigo: 'P2', seccao: 'pico', nome: 'Provas em papel', estado: 'aprovado',
    ficheiro: 'src/components/variantes/pico/Provas.tsx',
    mecanica: 'Pares de fotografias entram como provas físicas enquanto três momentos se sucedem.',
    pede: 'Idealmente seis imagens coerentes; pode reutilizar uma imagem apenas quando o resultado não parecer repetido.',
    manter: 'Sensação tátil de provas acumuladas e correspondência com o momento ativo.',
    podeMudar: 'Número de imagens por momento, rotação, textura, sombras, velocidade e forma de contar.',
  },
  {
    codigo: 'P4', seccao: 'pico', nome: 'Caderno', estado: 'aprovado',
    ficheiro: 'src/components/variantes/pico/Caderno.tsx',
    mecanica: 'A imagem mantém-se presente enquanto os três textos percorrem a outra metade.',
    pede: 'Três imagens e textos que beneficiem de leitura mais demorada.',
    manter: 'Contraponto entre imagem estável e narrativa em movimento.',
    podeMudar: 'Lados, proporções, ritmo, transição da imagem, tipografia e forma de contar.',
  },
  {
    codigo: 'P5', seccao: 'pico', nome: 'Livro antigo', estado: 'aprovado',
    ficheiro: 'src/components/variantes/pico/Livro.tsx',
    mecanica: 'Uma abertura forte introduz o objeto; o scroll vira folhas entre três momentos.',
    pede: 'Três imagens que tolerem o tratamento gráfico escolhido.',
    manter: 'Leitura inequívoca de livro e mudança de folha.',
    podeMudar: 'Tratamento fotográfico, papel, ornamentos, capa, duração e intensidade do gesto.',
  },
  {
    codigo: 'E1', seccao: 'espacos', nome: 'Faixa lateral', estado: 'aprovado',
    ficheiro: 'src/components/variantes/espacos/Faixa.tsx',
    mecanica: 'A primeira descida percorre os espaços horizontalmente; depois a galeria fica livre e navegável.',
    pede: 'Quatro a oito espaços com fotografias distinguíveis.',
    manter: 'Uma só passagem guiada e controlo livre depois dela.',
    podeMudar: 'Larguras, legendas, intervalo, controlos, ordem e comportamento específico no telemóvel.',
  },
  {
    codigo: 'E2', seccao: 'espacos', nome: 'Índice', estado: 'aprovado',
    ficheiro: 'src/components/variantes/espacos/Indice.tsx',
    mecanica: 'A primeira passagem ativa nomes e imagens em sequência; no fim liberta o scroll e mostra setas.',
    pede: 'Quatro a oito espaços; nomes curtos ajudam, mas não são obrigatórios.',
    manter: 'Correspondência imediata entre nome ativo e fotografia; começar sempre no primeiro espaço.',
    podeMudar: 'Tipografia do índice, cores, transição, posição das setas e apresentação móvel.',
  },
  {
    codigo: 'E3', seccao: 'espacos', nome: 'Revista', estado: 'aprovado',
    ficheiro: 'src/components/variantes/espacos/Revista.tsx',
    mecanica: 'Os espaços aparecem como páginas editoriais alternadas, sem prender o scroll.',
    pede: 'Quatro a seis imagens com qualidade suficiente para ocupar áreas grandes.',
    manter: 'Ritmo editorial com variação controlada entre páginas.',
    podeMudar: 'Alternância, proporções, recortes, numeração, legendas e respiros.',
  },
  {
    codigo: 'E4', seccao: 'espacos', nome: 'Mosaico', estado: 'aprovado',
    ficheiro: 'src/components/variantes/espacos/Mosaico.tsx',
    mecanica: 'Uma grelha apresenta vários espaços em simultâneo; interação revela informação adicional.',
    pede: 'Um conjunto de imagens que continue legível em recortes diferentes.',
    manter: 'Visão simultânea da casa e acesso equivalente à informação sem hover.',
    podeMudar: 'Número de células, grelha, proporções, destaque e interação no toque.',
  },
  {
    codigo: 'E5', seccao: 'espacos', nome: 'Baralho', estado: 'aprovado',
    ficheiro: 'src/components/variantes/espacos/Baralho.tsx',
    mecanica: 'Na primeira passagem, cartões grandes sobrepõem-se em sequência; depois ficam livres com setas.',
    pede: 'Quatro a seis imagens capazes de funcionar em cartões amplos.',
    manter: 'Começar no primeiro cartão, completar uma só passagem guiada e libertar o utilizador.',
    podeMudar: 'Profundidade, cantos, rotação, intervalo, controlos e solução móvel.',
  },
  {
    codigo: 'O1', seccao: 'opinioes', nome: 'Carrossel calmo', estado: 'por-avaliar',
    ficheiro: 'src/components/variantes/PrototiposBase.tsx#OpinioesO1',
    mecanica: 'Uma opinião ocupa o centro com estrelas e indicadores discretos.',
    pede: 'Opiniões reais.',
    manter: 'A leitura da citação é o foco absoluto.',
    podeMudar: 'Composição, navegação, densidade, fundo e tipografia.',
  },
  {
    codigo: 'O3', seccao: 'opinioes', nome: 'Opinião que decide', estado: 'aprovado',
    ficheiro: 'src/components/variantes/PrototiposBase.tsx#OpinioesO3',
    mecanica: 'Prova social, CTA forte e contactos partilham o mesmo painel; as opiniões podem avançar automaticamente ou por setas.',
    pede: 'Opiniões reais, destino de reserva e contactos válidos.',
    manter: 'Citação legível e caminho de conversão evidente.',
    podeMudar: 'Autoplay, proporções, CTA, hierarquia dos contactos, fundo e movimento da troca.',
  },
  {
    codigo: 'F1', seccao: 'fecho', nome: 'Moldura que cresce', estado: 'aprovado',
    ficheiro: 'src/components/variantes/fecho/Moldura.tsx',
    mecanica: 'Uma moldura pequena cresce até a imagem dominar o ecrã e sustentar o convite final.',
    pede: 'Uma imagem forte; recortes diferentes podem ser usados por breakpoint.',
    manter: 'Crescimento contínuo da moldura e CTA final inequívoco.',
    podeMudar: 'Forma inicial, recorte, velocidade, posição do convite e proporção final.',
  },
  {
    codigo: 'F2', seccao: 'fecho', nome: 'Portadas', estado: 'aprovado',
    ficheiro: 'src/components/variantes/fecho/Portadas.tsx',
    mecanica: 'Duas folhas na cor da paleta abrem para revelar a fotografia e o convite.',
    pede: 'Uma imagem forte que suporte a revelação central.',
    manter: 'Leitura de abertura em duas folhas.',
    podeMudar: 'Cor ligada à paleta, textura, direção, assimetria, ritmo e composição revelada.',
  },
  {
    codigo: 'F3', seccao: 'fecho', nome: 'Cortina que sobe', estado: 'aprovado',
    ficheiro: 'src/components/variantes/fecho/Cortina.tsx',
    mecanica: 'Uma cortina de conteúdo sobe e revela uma imagem fixa com o convite final.',
    pede: 'Uma imagem de ambiente capaz de preencher o ecrã.',
    manter: 'Revelação vertical clara e transição sem salto para o rodapé.',
    podeMudar: 'Conteúdo da cortina, véu, ritmo, distância, CTA e alinhamento.',
  },
  {
    codigo: 'F4', seccao: 'fecho', nome: 'Postal', estado: 'aprovado',
    ficheiro: 'src/components/variantes/fecho/Postal.tsx',
    mecanica: 'Imagem e bloco de convite coexistem como um postal; a fotografia aproxima-se subtilmente.',
    pede: 'Uma imagem e contactos completos.',
    manter: 'Fecho direto, compacto e orientado para contacto.',
    podeMudar: 'Proporções, selo, zoom, lado da imagem, contactos destacados e tratamento gráfico.',
  },
] as const satisfies readonly Prototipo[];

export type CodigoPrototipo = (typeof PROTOTIPOS)[number]['codigo'];

/*
  Contrato de entrada para cada variante. `pede` continua a explicar a
  intencao editorial; esta tabela torna verificaveis os limites que impedem
  uma variante de esconder texto, repetir imagens ou falhar no telemovel.
*/
export const REQUISITOS: Record<CodigoPrototipo, RequisitosConteudo> = {
  H1: { campos: ['hero.etiqueta', 'hero.titulo', 'hero.texto', 'hero.imagem'], imagens: { minimo: 1, descricao: 'Hero horizontal legivel com veu.' }, mobile: 'Texto no terco inferior; CTA quebra em linhas sem sobrepor a fotografia.' },
  H2: { campos: ['nome', 'hero.etiqueta', 'hero.titulo', 'hero.texto', 'hero.imagem'], imagens: { minimo: 1, descricao: 'Hero calmo que tolera nome sobreposto.' }, mobile: 'Nome e texto mantem-se legiveis sem depender de hover ou de altura dinamica.' },
  H3: { campos: ['hero.etiqueta', 'hero.titulo', 'hero.texto', 'hero.imagem'], imagens: { minimo: 1, descricao: 'Imagem com margem suficiente para recorte e expansao.' }, mobile: 'Recorte abre sem cortar CTA ou titulo.' },
  H4: { campos: ['hero.etiqueta', 'hero.titulo', 'hero.texto', 'hero.imagem'], imagens: { minimo: 1, descricao: 'Assunto sobrevive a divisao vertical.' }, mobile: 'As metades e a mensagem mantem leitura no ecran estreito.' },
  PI1: { campos: ['pilares'], imagens: { minimo: 0, descricao: 'Nao usa fotografia.' }, itens: { minimo: 3, maximo: 4, descricao: 'Factos curtos.' }, mobile: 'Grelha de duas colunas sem truncar factos.' },
  PI3: { campos: ['pilares'], imagens: { minimo: 0, descricao: 'Nao usa fotografia.' }, itens: { minimo: 3, maximo: 5, descricao: 'Factos, incluindo um destaque apenas se confirmado.' }, mobile: 'Cartoes empilham e mantem ordem logica.' },
  A1: { campos: ['atmosfera.etiqueta', 'atmosfera.titulo', 'atmosfera.texto', 'atmosfera.imagem', 'atmosfera.imagemPequena'], imagens: { minimo: 2, descricao: 'Plano de ambiente e pormenor distintos.' }, mobile: 'As imagens deixam de sobrepor texto e preservam os dois enquadramentos.' },
  A3: { campos: ['atmosfera.texto', 'marcos[]'], imagens: { minimo: 2, descricao: 'Imagem por marco ou reutilizacao declarada.' }, itens: { minimo: 2, descricao: 'Marcos verificaveis, com data apenas quando conhecida.' }, mobile: 'Linha do tempo torna-se vertical e le-se por ordem.' },
  P1: { campos: ['pico.etiqueta', 'pico.titulo', 'pico.intro', 'pico.momentos[]'], imagens: { minimo: 3, descricao: 'Uma imagem por momento.' }, itens: { minimo: 3, maximo: 3, descricao: 'Sequencia de momentos.' }, mobile: 'Marcador e texto usam altura estavel; nenhum momento fica fora do ecran.' },
  P2: { campos: ['pico.etiqueta', 'pico.titulo', 'pico.intro', 'pico.momentos[]'], imagens: { minimo: 3, descricao: 'Tres minimas; seis preferidas para pares sem repeticao visivel.' }, itens: { minimo: 3, maximo: 3, descricao: 'Sequencia de momentos.' }, mobile: 'Provas reduzem densidade e mantem texto e controlos acessiveis.' },
  P4: { campos: ['pico.etiqueta', 'pico.titulo', 'pico.intro', 'pico.momentos[]'], imagens: { minimo: 3, descricao: 'Uma imagem por momento.' }, itens: { minimo: 3, maximo: 3, descricao: 'Momentos de leitura demorada.' }, mobile: 'Imagem e texto alternam verticalmente sem scroll preso excessivo.' },
  P5: { campos: ['pico.etiqueta', 'pico.titulo', 'pico.intro', 'pico.momentos[]'], imagens: { minimo: 3, descricao: 'Imagens que aceitam o tratamento de pagina.' }, itens: { minimo: 3, maximo: 3, descricao: 'Folhas do livro.' }, mobile: 'Viragem simplifica sem esconder conteudo ou controlo.' },
  E1: { campos: ['visita.espacos[]'], imagens: { minimo: 4, descricao: 'Fotografia distinguivel por espaco.' }, itens: { minimo: 4, maximo: 8, descricao: 'Espacos.' }, mobile: 'Galeria passa a gesto e botoes, sem faixa horizontal presa.' },
  E2: { campos: ['visita.espacos[]'], imagens: { minimo: 4, descricao: 'Fotografia distinguivel por espaco.' }, itens: { minimo: 4, maximo: 8, descricao: 'Espacos.' }, mobile: 'Indice torna-se lista com controlo explicito e imagem ativa.' },
  E3: { campos: ['visita.espacos[]'], imagens: { minimo: 4, descricao: 'Imagens aptas a pagina ampla.' }, itens: { minimo: 4, maximo: 6, descricao: 'Espacos.' }, mobile: 'Paginas editoriais ficam numa coluna e conservam legendas.' },
  E4: { campos: ['visita.espacos[]'], imagens: { minimo: 3, descricao: 'Imagens legiveis em recortes variados.' }, itens: { minimo: 3, maximo: 9, descricao: 'Espacos.' }, mobile: 'Informacao abre por toque e teclado, nunca apenas hover.' },
  E5: { campos: ['visita.espacos[]'], imagens: { minimo: 4, descricao: 'Imagens capazes de ocupar cartoes grandes.' }, itens: { minimo: 4, maximo: 6, descricao: 'Espacos.' }, mobile: 'Cartoes e setas ficam navegaveis sem movimento obrigatorio.' },
  O1: { campos: ['reviews.citacoes[]', 'reviews.avaliacao?'], imagens: { minimo: 0, descricao: 'Nao usa fotografia.' }, itens: { minimo: 1, descricao: 'Citacoes literais com autor e plataforma.' }, mobile: 'Citacao e indicadores mantem-se legiveis; sem citacoes a seccao desaparece.' },
  O3: { campos: ['reviews.citacoes[]', 'acoes[]', 'contacto'], imagens: { minimo: 1, descricao: 'Imagem de fecho.' }, itens: { minimo: 1, descricao: 'Citacoes literais.' }, mobile: 'Painel empilha CTA e apenas os contactos confirmados; sem citacoes a seccao desaparece.' },
  F1: { campos: ['fecho.etiqueta', 'fecho.titulo', 'fecho.texto', 'fecho.imagem', 'acoes[]'], imagens: { minimo: 1, descricao: 'Imagem de fecho; versao vertical recomendada.' }, mobile: 'Texto cabe na altura segura e a moldura mede o bloco real.' },
  F2: { campos: ['fecho.etiqueta', 'fecho.titulo', 'fecho.texto', 'fecho.imagem', 'acoes[]'], imagens: { minimo: 1, descricao: 'Imagem de fecho com centro utilizavel.' }, mobile: 'Portadas abrem sem tapar CTA ou prender o teclado.' },
  F3: { campos: ['fecho.etiqueta', 'fecho.titulo', 'fecho.texto', 'fecho.imagem', 'acoes[]', 'reviews.citacoes?'], imagens: { minimo: 1, descricao: 'Imagem de ambiente de ecran inteiro.' }, mobile: 'Cortina e texto nao dependem de citacao; citacao ausente nao deixa vazio.' },
  F4: { campos: ['fecho.etiqueta', 'fecho.titulo', 'fecho.texto', 'fecho.imagem', 'acoes[]', 'contacto'], imagens: { minimo: 1, descricao: 'Imagem de fecho.' }, mobile: 'Postal empilha imagem, acoes e apenas contactos confirmados.' },
};

export function requisitosDo(codigo: CodigoPrototipo) {
  return REQUISITOS[codigo];
}

export function prototiposDaSeccao(seccao: SeccaoPrototipo) {
  return PROTOTIPOS.filter((prototipo) => prototipo.seccao === seccao);
}
