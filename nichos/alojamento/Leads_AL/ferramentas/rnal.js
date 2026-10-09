// Lista completa de alojamentos de um concelho, a partir dos registos oficiais do Turismo de Portugal.
//   node ferramentas/rnal.js "Cantanhede"
// Escreve data/candidatos-<concelho>.json e imprime um resumo.
// RNAL = alojamento local · RNET = empreendimentos turísticos (turismo rural, de habitação, ...)
const fs = require('fs');
const path = require('path');

const concelho = process.argv[2];
if (!concelho) { console.error('uso: node ferramentas/rnal.js "<Concelho>"'); process.exit(1); }

const BASE = 'https://webservices.turismodeportugal.pt/RNT_External/rest/RNT/';
const DATA = path.join(__dirname, '..', 'data');
// Tipologias RNET que não são clientes (estruturas grandes, já com equipa e site)
const RNET_FORA = /hoteleiro|campismo|aldeamento|conjunto tur/i;

async function buscar(lista) {
  const url = `${BASE}${lista}?Concelho=${encodeURIComponent(concelho)}`;
  for (let t = 1; t <= 4; t++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(180000) });
      const txt = await r.text();
      return JSON.parse(txt); // o download às vezes vem cortado: JSON inválido -> repete
    } catch (e) {
      console.error(`${lista}: tentativa ${t} falhou (${e.message.slice(0, 60)})`);
    }
  }
  throw new Error(`${lista} falhou 4 vezes — não continuar com lista incompleta`);
}

// Todos os números do registo, formatados "912 345 678", sem repetidos
const telefones = (...nums) => [...new Set(nums
  .map(x => String(x || '').replace(/\D/g, '').slice(-9))
  .filter(d => /^[29]\d{8}$/.test(d))
  .map(d => `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`))]
  .map(numero => ({ numero, fontes: ['registo'] }));

(async () => {
  const [rnal, rnet] = await Promise.all([buscar('list_RNAL'), buscar('list_RNET')]);
  const existentes = new Set((() => {
    try { return JSON.parse(fs.readFileSync(path.join(DATA, 'leads.json'), 'utf8')).leads.map(l => l.id); }
    catch { return []; }
  })());

  // RNAL: o mesmo titular com várias unidades = UMA lead (liga-se a uma pessoa, não a um apartamento)
  const porTitular = new Map();
  for (const { RNAL_Registo: r } of rnal) {
    const chave = r.TitulardaExploracao?.Contribuinte || r.NrRegisto;
    if (!porTitular.has(chave)) porTitular.set(chave, []);
    porTitular.get(chave).push(r);
  }
  const candidatos = [...porTitular.values()].map(us => {
    us.sort((a, b) => a.DataRegisto.localeCompare(b.DataRegisto));
    const r = us[0], t = r.TitulardaExploracao || {};
    return {
      id: 'rnal-' + r.NrRegisto.replace(/\D/g, ''),
      nome: r.NomeAlojamento.trim(),
      unidades: us.length > 1 ? us.map(u => u.NomeAlojamento.trim()) : undefined,
      concelho: r.Concelho, localidade: r.Localidade, morada: `${r.Endereco}, ${r.CodPostal}`,
      tipo: `AL · ${r.Modalidade}`, telefones: telefones(...us.flatMap(u => [u.TitulardaExploracao?.Telemovel, u.TitulardaExploracao?.Telefone])),
      responsavel: t.Nome?.trim(), // só o nome; NIF e email do titular não saem daqui
      capacidade: us.reduce((n, u) => n + (Number(u.NrUtentes) || 0), 0), // soma de todas as unidades do titular
      registo: r.DataRegisto, fonte: 'RNAL',
    };
  });

  let foraRnet = 0;
  for (const { RNET_Registo: r } of rnet) {
    if (RNET_FORA.test(r.Tipologia)) { foraRnet++; continue; }
    candidatos.push({
      id: 'rnet-' + String(r.NrRegisto).replace(/\D/g, ''),
      nome: (r.Marca || r.Nome).trim(), concelho: r.Concelho, localidade: r.Localidade,
      morada: `${r.Endereco}, ${r.CodPostal}`, tipo: r.Tipologia.replace('Empreendimento de ', ''),
      telefones: telefones(r.Telefone, r.Telemovel), responsavel: r.EntidadeExploradora?.trim(),
      capacidade: Number(r.Capacidade) || 0,
      registo: r.DataRegisto, fonte: 'RNET',
    });
  }

  for (const c of candidatos) if (existentes.has(c.id)) c.ja_existe = true;
  const ficheiro = path.join(DATA, `candidatos-${concelho.toLowerCase().replace(/\s+/g, '-')}.json`);
  fs.mkdirSync(DATA, { recursive: true });
  fs.writeFileSync(ficheiro, JSON.stringify({ concelho, data: new Date().toISOString().slice(0, 10), candidatos }, null, 2));

  const novos = candidatos.filter(c => !c.ja_existe);
  console.log(`${concelho}: ${rnal.length} registos RNAL -> ${porTitular.size} titulares; RNET ${rnet.length} (${foraRnet} hotéis/campismo fora)`);
  console.log(`${candidatos.length} candidatos, ${novos.length} novos, ${candidatos.length - novos.length} já no dashboard, ${novos.filter(c => !c.telefones.length).length} novos sem telefone`);
  console.log(`${novos.filter(c => c.capacidade < 10).length} novos com capacidade < 10 pessoas (ficam, com prioridade mais baixa)`);
  console.log('->', path.relative(process.cwd(), ficheiro));
})().catch(e => { console.error('ERRO:', e.message); process.exit(1); });
