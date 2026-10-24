// Pontuação de 0 a 10 e escalão (A, B, C): a ordem pela qual se liga. Não elimina ninguém.
// Usada pelo dashboard (app.js, no browser) e pelas ferramentas (Node).
//
// Reescrita a 22/10/2026 (decisão do Diogo): simples, 4 coisas, e a que mais pesa é o TIPO DE NEGÓCIO.
//   sub-nicho   🟢 4 · 🟡 2 · resto 0     (quinta de vinho, eventos, solar/turismo de habitação, hotel rural, hostel bom…)
//   preço       caro (130 €+/noite) 2 · médio (80–130 €) 1 · barato ou desconhecido 0
//   avaliações  150+ 2 · 50+ 1            (é quem tem clientes)
//   site        sem site / domínio perdido 2 · antigo 1 · em dúvida ou moderno 0
// Escalões: A = 7 ou mais (ligar primeiro) · B = 4 a 6 · C = 3 ou menos.
// As GESTORAS (empresas que gerem casas de outros, pequenas e grandes) não entram nesta conta: têm separador próprio,
// sempre no topo. As 2 vendas fechadas até hoje são turismo de habitação: por isso o sub-nicho pesa tanto.
// Voltar a medir quando houver 100 chamadas com resposta feitas com estas regras.
(function (raiz) {
  const sa = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // [id, nome, cor]
  const SUBNICHOS = {
    'quinta-vinho': ['Quinta com vinho', 'verde'],
    'quinta-eventos': ['Quinta de eventos', 'verde'],
    'turismo-habitacao': ['Solar / turismo de habitação', 'verde'],
    'hotel-guest-house': ['Hotel rural / guest house', 'verde'],
    'hostel-bom': ['Hostel (bom)', 'verde'],
    'gestora': ['Gestora', 'verde'],
    'moradia-grande': ['Moradia grande / piscina', 'amarelo'],
    'casa-de-campo': ['Casa de campo', 'amarelo'],
    'glamping-retiro': ['Glamping / retiro', 'amarelo'],
    'restaurante-quartos': ['Restaurante com quartos', 'amarelo'],
    'hostel': ['Hostel', 'amarelo'],
    'quinta': ['Quinta', 'amarelo'],
    'moradia': ['Moradia (5–9 pessoas)', 'vermelho'],
    'apartamento-quartos': ['Apartamento / quartos', 'vermelho'],
    'cadeia': ['Cadeia hoteleira', 'vermelho'],
    'outro': ['Outro', 'vermelho'],
  };
  const avaliacoes = l => (l.booking?.avaliacoes || 0) + (l.plataformas || []).reduce((n, p) => n + (p.avaliacoes || 0), 0);

  // Sub-nicho a partir do que se sabe da casa (o montar.js pode fixá-lo em l.subnicho)
  function subnicho(l) {
    if (l.subnicho && SUBNICHOS[l.subnicho]) return l.subnicho;
    if (l.gestora) return 'gestora';
    const tipo = sa(l.tipo), nome = sa([l.nome, ...(l.unidades || [])].join(' ')), desc = sa(l.descricao);
    const tudo = `${nome} ${tipo} ${desc} ${sa((l.etiquetas || []).join(' '))}`;
    if (/cadeia|\bgrupo hoteleiro\b/.test(tudo)) return 'cadeia';
    if (/hostel/.test(tudo)) {
      // hostel que vale a pena: grande (20+ camas ou 150+ avaliações), independente e com quartos privados
      const grande = l.capacidade >= 20 || avaliacoes(l) >= 150;
      const independente = !/pousada de juventude|movijovem|municipal|juventude/.test(tudo);
      return grande && independente && l.quartos_privados !== false ? 'hostel-bom' : 'hostel';
    }
    if (/casament|eventos|wedding|event venue/.test(tudo)) return 'quinta-eventos';
    if (/habitac/.test(tipo) || /\bsolar\b|\bpaco\b|casa senhorial|manor/.test(nome)) return 'turismo-habitacao';
    const vinho = /vinho|vinha|wine|vineyard|winery|adega|enoturismo|port wine|provas/.test(`${nome} ${desc}`);
    // quinta com vinho: só com sinal de vinho (no nome ou na descrição); uma quinta de turismo rural sem vinho é casa de campo
    if (/quinta/.test(nome) && vinho) return 'quinta-vinho';
    if (vinho && /espaco rural/.test(tipo)) return 'quinta-vinho';
    if (/glamping|yoga|retiro|retreat|eco ?lodge|eco-resort|tenda|yurt|cabana/.test(tudo)) return 'glamping-retiro';
    if (/restaurante com|restaurante e alojamento|restaurante/.test(sa((l.etiquetas || []).join(' ')))) return 'restaurante-quartos';
    if (/^hotel|hotel rural/.test(tipo) || /hotel rural/.test(nome)) return 'hotel-guest-house';
    // guest house / hospedagem com 6+ quartos (~12+ pessoas)
    if (/hospedagem|guest ?house/.test(`${tipo} ${nome}`) && (l.quartos >= 6 || l.capacidade >= 12)) return 'hotel-guest-house';
    if (/espaco rural/.test(tipo)) return l.capacidade >= 12 ? 'hotel-guest-house' : 'casa-de-campo';
    if (/moradia|villa|vivenda/.test(`${tipo} ${nome}`) && (l.capacidade >= 10 || l.piscina || /piscina|pool/.test(`${nome} ${desc}`))) return 'moradia-grande';
    if (/quinta/.test(nome)) return 'quinta';
    if (/moradia|vivenda|villa/.test(`${tipo} ${nome}`)) return 'moradia';
    if (/apartamento|quartos/.test(tipo)) return 'apartamento-quartos';
    if (/hospedagem/.test(tipo)) return 'casa-de-campo';
    return 'outro';
  }

  function pontuacao(l) {
    const sn = subnicho(l), [nomeSn, cor] = SUBNICHOS[sn];
    const partes = [];
    partes.push([cor === 'verde' ? 4 : cor === 'amarelo' ? 2 : 0, nomeSn]);
    // preço de 1 noite para 2 pessoas (mediana das datas do Booking); nos hostels não conta (é por cama)
    const p = /hostel/.test(sn) ? null : l.preco;
    partes.push(p >= 130 ? [2, `${p} €/noite`] : p >= 80 ? [1, `${p} €/noite`] : [0, p ? `${p} €/noite` : 'preço desconhecido']);
    const av = avaliacoes(l);
    partes.push(av >= 150 ? [2, `${av} avaliações`] : av >= 50 ? [1, `${av} avaliações`] : [0, `${av} avaliações`]);
    const v = l.site?.veredito;
    partes.push(!l.site ? [2, 'sem site'] : v === 'antigo' ? [1, 'site antigo'] : [0, v === 'duvida' ? 'site em dúvida' : 'site moderno']);
    const pontos = partes.reduce((n, [x]) => n + x, 0);
    return {
      pontos, subnicho: sn, cor,
      escalao: sn === 'gestora' ? 'G' : pontos >= 7 ? 'A' : pontos >= 4 ? 'B' : 'C',
      porque: partes.map(([x, txt]) => `${txt} +${x}`).join(' · '),
    };
  }
  pontuacao.subnicho = subnicho;
  pontuacao.SUBNICHOS = SUBNICHOS;
  if (typeof module !== 'undefined') module.exports = pontuacao;
  else raiz.pontuacao = pontuacao;
})(this);
