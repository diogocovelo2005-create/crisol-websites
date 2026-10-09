// Junta leads verificadas ao dashboard, com validação. Nunca toca em data/estado.json (é do utilizador).
//   node ferramentas/juntar.js data/novos-<concelho>.json
// O ficheiro de entrada: { "concelho": "...", "leads": [ ... ] }  (formato no SKILL.md)
// Se alguma lead falhar a validação, NADA é gravado e os erros são listados.
const fs = require('fs');
const path = require('path');

const entrada = process.argv[2];
if (!entrada) { console.error('uso: node ferramentas/juntar.js <ficheiro.json>'); process.exit(1); }

const DATA = path.join(__dirname, '..', 'data');
const lerJSON = (f, fb) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return fb; throw e; } };
const { concelho, leads: novas } = lerJSON(entrada);
const atual = lerJSON(path.join(DATA, 'leads.json'), { leads: [] });
const estado = lerJSON(path.join(DATA, 'estado.json'), {});

function validar(l) {
  const e = [];
  for (const c of ['id', 'nome', 'concelho', 'localidade', 'funil', 'motivo']) if (!l[c]) e.push(`falta "${c}"`);
  if (!['contactar', 'duvida', 'eliminado'].includes(l.funil)) e.push(`funil inválido "${l.funil}"`);
  const b = l.booking;
  if (b && (typeof b.nota !== 'number' || typeof b.avaliacoes !== 'number' || !b.url)) e.push('booking precisa de url, nota e avaliacoes (números)');
  // Outras plataformas (Airbnb, Vrbo, ...): o Booking não é obrigatório
  if (l.plataformas && (!Array.isArray(l.plataformas) || l.plataformas.some(p => !p.nome || !p.url)))
    e.push('plataformas tem de ser uma lista de { nome, url, nota?, avaliacoes? }');
  if (typeof l.capacidade !== 'number') e.push('falta "capacidade" (nº de pessoas do registo)');
  if (!Array.isArray(l.telefones) || l.telefones.some(t => !/^[29]\d{2} \d{3} \d{3}$/.test(t.numero) || !t.fontes?.length))
    e.push('telefones tem de ser uma lista de { numero: "912 345 678", fontes: [...] }');
  const v = l.verificacao || {};
  const semContacto = !l.telefones?.length && !l.site;
  // Sem telefone só se afirma depois de procurar em todas as fontes (registo, Google, site, redes, pesquisa)
  if (!l.telefones?.length && !v.contacto && !/^booking/i.test(l.motivo))
    e.push('verificacao.contacto em falta: diz onde procuraste o telefone');
  // Filtros automáticos: nota do Booking (só se estiver lá) e contacto.
  // Não estar no Booking não elimina (muitos AL vendem pelo Airbnb ou outra plataforma),
  // e a capacidade também não: uma casa pequena só desce na lista do dashboard.
  const regra = b && b.nota < 7 && b.avaliacoes >= 10 ? `Booking ${b.nota} com ${b.avaliacoes} avaliações`
    : semContacto ? 'sem telefone nem site'
    : null;
  if (regra && l.funil !== 'eliminado') e.push(`${regra}: tem de ser eliminado`);
  if (/^booking/i.test(l.motivo) && l.funil === 'eliminado' && !(b && b.nota < 7 && b.avaliacoes >= 10)) e.push('eliminado por Booking só com nota < 7 e 10+ avaliações');
  if (!regra) {
    // Regra de ouro: só se afirma "sem site" com as 3 verificações feitas e registadas
    for (const c of ['maps', 'pesquisa', 'dominio']) if (!v[c]) e.push(`verificacao.${c} em falta`);
    if (l.site) {
      if (!l.site.url || !['antigo', 'moderno', 'duvida'].includes(l.site.veredito)) e.push('site precisa de url e veredito antigo/moderno/duvida');
      // só o claramente antigo vai para ligar; moderno ou incerto vai para a dúvida (o Gonçalo decide)
      const esperado = { antigo: 'contactar', moderno: 'duvida', duvida: 'duvida' }[l.site.veredito];
      if (esperado && l.funil !== esperado) e.push(`site ${l.site.veredito} -> funil devia ser "${esperado}"`);
    }
  }
  return e;
}

const erros = novas.flatMap(l => validar(l).map(m => `${l.id || '?'} ${l.nome || ''}: ${m}`));
if (erros.length) { console.error(`NADA GRAVADO. ${erros.length} erro(s):\n- ` + erros.join('\n- ')); process.exit(1); }

// Dados de demonstração saem quando entram os primeiros dados reais
let leads = atual.demo ? atual.leads.filter(l => !l.id.startsWith('demo-')) : atual.leads;
const porId = new Map(leads.map(l => [l.id, l]));
let novasN = 0, atualizadas = 0, protegidas = 0;
for (const l of novas) {
  const antiga = porId.get(l.id);
  const s = estado[l.id];
  const mexida = s && (s.estado !== 'por_contactar' || s.decisao || s.estrela || s.notas?.length);
  if (!antiga) { porId.set(l.id, l); novasN++; }
  else if (mexida) { // o utilizador já trabalhou esta lead (estado, decisão, estrela ou notas): não lhe mudar a classificação
    // os factos atualizam-se; o funil fica como estava
    Object.assign(antiga, {
      booking: l.booking || antiga.booking, plataformas: l.plataformas || antiga.plataformas,
      telefones: l.telefones, email: l.email ?? antiga.email,
      motivo: l.motivo, site: l.site, verificacao: l.verificacao,
      capacidade: l.capacidade, tipos_quarto: l.tipos_quarto ?? antiga.tipos_quarto,
    });
    delete antiga.telefone;
    protegidas++;
  } else { porId.set(l.id, l); atualizadas++; }
}
leads = [...porId.values()];

const concelhos = (atual.demo ? [] : atual.concelhos || []).filter(c => c.nome !== concelho);
concelhos.push({ nome: concelho, data: new Date().toISOString().slice(0, 10), total: leads.filter(l => l.concelho === concelho).length });

const saida = { atualizado: new Date().toISOString().slice(0, 10), concelhos, leads };
const f = path.join(DATA, 'leads.json');
if (fs.existsSync(f)) fs.copyFileSync(f, path.join(DATA, 'leads.bak.json'));
fs.writeFileSync(f + '.tmp', JSON.stringify(saida, null, 2));
JSON.parse(fs.readFileSync(f + '.tmp', 'utf8'));
fs.renameSync(f + '.tmp', f);

const conta = fn => novas.filter(fn).length;
console.log(`${concelho}: ${novasN} novas, ${atualizadas} atualizadas, ${protegidas} protegidas (já trabalhadas por ti)`);
console.log(`para contactar ${conta(l => l.funil === 'contactar')} · dúvida ${conta(l => l.funil === 'duvida')} · eliminadas ${conta(l => l.funil === 'eliminado')}`);
