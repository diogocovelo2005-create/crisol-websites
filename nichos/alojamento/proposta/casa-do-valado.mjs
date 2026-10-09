import comum from './oferta.mjs';

export default {
  ...comum,
  ficheiro: 'proposta-casa-do-valado',
  data: 'Outubro de 2026',
  casa: {
    nome: 'Casa do Valado',
    frase: 'Um site simples, bonito e direto para receber hóspedes e reservas diretas sem intermediários nem complicações.',
    meta: ['Resende, Douro', 'Turismo Rural'],
    capa: '../casas/casa-do-valado-resende/site/public/fotos/fachada-02.jpg',
  },
  site: {
    situacao: {
      titulo: 'O Problema de Hoje',
      intro: 'Informação dispersa e perda desnecessária de margem:',
      pontos: [
        'Os hóspedes perdem-se à procura de fotos de qualidade e preços atualizados nas redes sociais.',
        'Comissões pesadas de 15% a 25% na Booking e no Airbnb que diminuem o lucro real de cada noite.',
        'Demora a responder pelo WhatsApp por falta de respostas pré-organizadas com os detalhes da casa.'
      ]
    },
    proposta: {
      titulo: 'O Que Vamos Fazer',
      intro: 'Um site direto, acolhedor e feito para reservas:',
      pontos: [
        'Canal próprio com apresentação nobre da quinta e fotografias em grande formato dos quartos.',
        'Botão direto de WhatsApp para os hóspedes falarem consigo com apenas um toque no telemóvel.',
        'Localização clara com Google Maps e formulário limpo para grupos familiares e estadias longas.'
      ]
    },
    pontos: [
      ['Poupar Comissões', 'Ao direcionar as reservas para o seu site, deixa de pagar taxas às plataformas. Isto dá-lhe margem para oferecer um pequeno desconto ao cliente direto, enquanto ainda retém muito mais lucro.'],
      ['Apresentação Clara', 'Mostrar a essência do Valado e os quartos em detalhe, eliminando as objeções e dúvidas que impedem as reservas.'],
      ['Sem Fricção', 'O foco do site será reter o visitante e levá-lo rapidamente à ação: entrar em contacto e marcar a estadia sem qualquer intermediário.'],
    ],
    resultados: 'O objetivo é transformar visitantes curiosos em reservas confirmadas. Um site de excelência posiciona a Casa do Valado num patamar superior de qualidade, garantindo maior rentabilidade e independência do seu negócio a longo prazo.',
    objetivo: 'Mais reservas diretas, menos comissões a terceiros e maior controlo sobre as suas vendas.',
  },
  proposta: {
    ...comum.proposta,
    titulo: 'Opções de Investimento',
    intro: 'Escolha a base para arrancar rápido, ou a versão completa se precisar de separar as áreas da casa.',
    pacotes: [
      {
        nome: 'Base',
        preco: '400€',
        nota: 'valor único pelo site',
        descricao: 'O site que já lhe apresentei, adaptado à casa com fotografias, textos e os ajustes necessários.'
      },
      {
        nome: 'Completo',
        preco: '600–800€',
        nota: 'valor único pelo site',
        descricao: 'A Base, com páginas próprias para aprofundar a casa, os quartos, os espaços e a informação útil.',
        variacao: 'O valor varia com o número de páginas e o detalhe do conteúdo.'
      }
    ],
    linhas: [
      ['Organização do site', ['Uma página com toda a informação', 'Várias páginas, organizadas por tema']],
      ['Apresentação da casa e fotografias', ['Incluídas', 'Incluídas']],
      ['Quartos', ['Apresentados na página principal', 'Página própria por tipo de quarto']],
      ['Computador e telemóvel', ['Adaptado a ambos', 'Adaptado a ambos']],
      ['Contactos e WhatsApp', ['Incluídos', 'Incluídos']],
      ['Botão «Reservar»', ['Abre a página de marcações existente', 'Abre a página de marcações existente']],
      ['Perguntas frequentes', ['Não incluídas', 'Incluídas']],
      ['Textos e títulos para pesquisas no Google', ['–', 'Trabalho adicional incluído']]
    ],
    extrasTitulo: 'Elementos Adicionais & Opcionais',
    extras: 'Os seguintes serviços funcionam como expansões do seu site e são orçamentados à parte, consoante as suas necessidades:\n\n• **Tradução Bilingue** (Estrutura multilingue)\n• **Otimização AEO/GEO** (Recomendação por IA e locacional)\n• **Formulários de Reserva Avançados** (Integração direta)\n• **Tour Virtual / Walkthrough AI** (Vídeo imersivo gerado a partir de fotos)\n\n*(Estes são apenas alguns exemplos. Existem mais funcionalidades que podemos adicionar no futuro caso faça sentido).*',
    dominio: 'A renovação anual fica a seu cargo (habitualmente entre 10€ a 30€ anuais). Usamos o seu atual ou ajudo a registar um novo.',
    manutencao: 'Alterações após a entrega são orçamentadas por pedido. Não há nenhuma mensalidade de manutenção.',
    alojamento: 'A conta de hospedagem pode ficar em seu nome. Terá independência e controlo total sobre o site, caso no futuro decida geri-lo por conta própria.',
    fecho: {
      titulo: 'Pronto para o próximo passo?',
      texto: 'Qualquer dúvida ou ajuste que seja necessário fazer nesta proposta inicial, sinta-se à vontade para me ligar. O meu objetivo é que este site seja exatamente aquilo de que a casa precisa para faturar mais e melhor.',
    }
  }
};
