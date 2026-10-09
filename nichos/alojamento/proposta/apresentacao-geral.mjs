import comum from './oferta.mjs';

export default {
  ...comum,
  ficheiro: 'proposta-apresentacao',
  data: 'Outubro de 2026',
  apresentacao: {
    sobre: [
      'Olá, o meu nome é Diogo Covelo. Tenho 21 anos, sou de Viseu e sou engenheiro de formação.',
      'O meu propósito não é fazer um discurso de vendas, mas sim gerir expectativas com honestidade. O meu objetivo é ajudá-lo a criar uma presença online sólida para o seu Alojamento Local. O resultado que pretendo entregar é um website prático, estruturado e atrativo, focado em trazer-lhe mais reservas diretas e em diminuir a sua dependência exclusiva de plataformas externas.',
      'A minha metodologia é totalmente direta. Não há agências intermediárias, gestores de conta ou equipas subcontratadas. Sou eu que trabalho no seu projeto do início ao fim. Qualquer questão técnica, dúvida ou alteração que precise, sou eu que dou a cara.',
      'Trabalho com orçamentos definitivos e prazos realistas. O que lhe prometo é total dedicação para que o site se torne numa ferramenta rentável e sem surpresas escondidas no futuro.'
    ]
  },
  proposta: {
    ...comum.proposta,
    titulo: 'Opções de Investimento',
    intro: 'Uma visão clara sobre os custos, sem letras pequeninas.',
    pacotes: [
      {
        nome: 'Base',
        preco: '400€',
        nota: 'valor único pelo site',
        descricao: 'A presença essencial. Um site direto, acolhedor e focado na conversão e marcação de estadias.'
      },
      {
        nome: 'Completo',
        preco: '600–800€',
        nota: 'valor único pelo site',
        descricao: 'A Base, com páginas próprias para aprofundar cada detalhe, cada quarto e a informação da região.',
        variacao: 'O valor exato varia com o número de páginas e o volume de conteúdo.'
      }
    ],
    linhas: [
      ['Organização do site', ['Uma página estruturada com tudo', 'Várias páginas organizadas por tema']],
      ['Apresentação e fotografias', ['Incluídas', 'Incluídas']],
      ['Detalhe dos Quartos', ['Destaques na página principal', 'Página própria por tipo de quarto']],
      ['Design Responsivo', ['Adaptado a telemóvel e PC', 'Adaptado a telemóvel e PC']],
      ['Contactos e WhatsApp', ['Incluídos', 'Incluídos']],
      ['Motor / Botão de Reserva', ['Ligação ao vosso sistema atual', 'Ligação ao vosso sistema atual']],
      ['Perguntas frequentes', ['Não incluídas', 'Incluídas']],
      ['Otimização básica Google', ['–', 'Trabalho adicional incluído']]
    ],
    extrasTitulo: 'Elementos Adicionais & Opcionais',
    extras: 'Caso o projeto exija funcionalidades mais avançadas, estas são orçamentadas separadamente. Exemplos:\n\n• **Tradução Bilingue** (Estrutura multilingue)\n• **Otimização AEO/GEO** (Recomendação avançada para IA e pesquisas locais)\n• **Formulários de Reserva Complexos** (Caso não use plataformas externas)\n• **Tour Virtual / Walkthrough AI** (Vídeo imersivo do espaço)\n\n*(Estes são apenas alguns exemplos. Podemos adicionar outras ferramentas no futuro se fizer sentido).*',
    dominio: 'A renovação anual fica a seu cargo (habitualmente entre 10€ a 30€ anuais). Usamos o atual ou ajudo a registar um novo.',
    manutencao: 'Alterações após a entrega são orçamentadas por pedido. Não há nenhuma mensalidade de manutenção obrigatória.',
    alojamento: 'A conta de hospedagem pode ficar em seu nome. Terá independência e controlo total sobre o site a qualquer momento.',
    fecho: {
      titulo: 'Pronto para conversarmos?',
      texto: 'Se esta forma de trabalhar transparente e direta faz sentido para si, responda a esta mensagem. Teremos uma conversa rápida, sem qualquer compromisso, para perceber se sou a pessoa certa para ajudar o seu negócio.',
    }
  }
};
