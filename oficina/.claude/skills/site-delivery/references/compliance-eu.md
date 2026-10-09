# Conformidade (UE)

Não é aconselhamento jurídico. É a lista do que um site profissional na UE precisa de ter para não criar um problema ao cliente, e o que pesquisar quando o caso é específico.

## RGPD — formulários e dados

Qualquer formulário que recolha nome, email ou telefone está a tratar dados pessoais.

O que o site precisa:

- **Política de privacidade** acessível de qualquer página, indicando quem é o responsável pelo tratamento, que dados são recolhidos, com que finalidade e fundamento, por quanto tempo, com quem são partilhados, e como exercer os direitos de acesso, retificação e apagamento.
- **Consentimento explícito** no formulário: uma checkbox não pré-marcada. Consentimento tácito não é consentimento.
- **Minimização**: não peças o que não usas. Um formulário de contacto não precisa da morada.
- **Destino dos dados**: se o formulário envia por email através de um serviço de terceiros, esse serviço é subcontratante e deve estar mencionado na política.

Numa profissão sujeita a segredo profissional, acrescenta a advertência de que o formulário não é canal seguro para informação sensível e que o envio não cria relação profissional. Advogados e médicos vão valorizar isto.

## Cookies

A regra prática que evita quase todos os problemas: **se não tens cookies não essenciais, não precisas de banner.**

- Cookies estritamente necessários (sessão, segurança, preferência de idioma): sem consentimento prévio.
- Analítica, marketing, píxeis, mapas embebidos, vídeos do YouTube: exigem consentimento **antes** de carregarem.
- O banner tem de permitir recusar com a mesma facilidade com que permite aceitar. "Aceitar tudo" em destaque e "gerir preferências" escondido é padrão obscuro.

Num site institucional pequeno, a decisão mais limpa é escolher analítica sem cookies e não ter banner nenhum. Menos fricção, menos risco, e o cliente agradece.

Se houver vídeos ou mapas embebidos, carrega-os só depois de consentimento — ou substitui por uma imagem estática com link. Um `iframe` do YouTube deixa cookies antes de qualquer clique.

## Acessibilidade — mudou de estatuto

Isto deixou de ser boa prática e passou a ser obrigação legal para uma parte dos clientes.

A Diretiva (UE) 2019/882 — o European Accessibility Act — tornou-se exigível a 28 de junho de 2025, vinculando os operadores económicos abrangidos em todos os 27 Estados-Membros, com referência à WCAG 2.1 AA através da norma EN 301 549. Abrange comércio eletrónico, banca ao consumidor, telecomunicações, transportes, e-books e meios audiovisuais.

**A isenção que interessa:** o artigo 4.º(5) isenta as microempresas do lado dos serviços — menos de 10 trabalhadores e volume de negócios ou balanço até 2 milhões de euros. A isenção é automática, não requer pedido, e aplica-se a serviços mas não a produtos.

**Como usar isto na prática:** pergunta a dimensão do cliente. A maioria dos clientes locais é microempresa e está isenta. Mas: a isenção desaparece no momento em que a empresa cresce, sem período de transição; e há contratos anteriores a 28 de junho de 2025 com prazo de conformidade até 28 de junho de 2027.

E independentemente da lei: um site acessível é um site que funciona com teclado, tem contraste legível e funciona em leitores de ecrã. Isso beneficia toda a gente e não custa mais se for feito desde o início. Custa muito se for feito no fim.

O mínimo que deve estar sempre presente:

- Contraste de texto conforme WCAG AA
- Foco visível em todos os elementos interativos
- Navegação completa por teclado
- `alt` descritivo em imagens com conteúdo; `alt=""` nas decorativas
- Etiquetas associadas a todos os campos de formulário
- Hierarquia de cabeçalhos sem saltos
- Não transmitir informação só por cor

## Menções obrigatórias

Verifica o que se aplica ao país e ao setor. Frequentes em Portugal e na UE:

- Identificação da entidade: denominação, NIF, sede
- Livro de reclamações eletrónico, quando aplicável
- Plataforma de resolução alternativa de litígios de consumo, quando aplicável
- Número de registo profissional e entidade reguladora, nas profissões reguladas

Quando o cliente for de profissão regulada, isto liga-se à Fase 2 do SKILL.md: as regras do setor ficam escritas em `PROJETO.md`, pesquisadas na altura.
