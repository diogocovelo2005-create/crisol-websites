#!/usr/bin/env node
/**
 * dns-snapshot.js — retrato completo do DNS ANTES de qualquer alteração.
 *
 *   node scripts/dns-snapshot.js --dominio dominio.pt --out ./legado/dns.json
 *
 * Este ficheiro é a apólice de seguro. Sem ele não há reversão possível.
 * Sem dependências: usa o módulo dns do Node.
 */
import dns from 'node:dns/promises';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i++)
    if (process.argv[i].startsWith('--')) {
      const k = process.argv[i].slice(2);
      a[k] = process.argv[i + 1]?.startsWith('--') || i + 1 >= process.argv.length ? true : process.argv[++i];
    }
  return a;
}
const A = args();
if (!A.dominio) { console.error('Falta --dominio'); process.exit(1); }
const d = A.dominio.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

const tipos = ['A', 'AAAA', 'MX', 'TXT', 'NS', 'SOA', 'CAA'];
const registos = {};

for (const t of tipos) {
  try { registos[t] = await dns.resolve(d, t); }
  catch (e) { registos[t] = { erro: e.code }; }
}

// subdomínios comuns que costumam existir e que é fácil esquecer
registos.subdominios = {};
for (const sub of ['www', 'mail', 'webmail', 'autodiscover', 'ftp', 'cpanel']) {
  const nome = `${sub}.${d}`;
  try { registos.subdominios[nome] = { CNAME: await dns.resolveCname(nome) }; }
  catch {
    try { registos.subdominios[nome] = { A: await dns.resolve4(nome) }; }
    catch { /* não existe, ignora */ }
  }
}

const out = A.out || `./dns-${d}.json`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ dominio: d, data: new Date().toISOString(), registos }, null, 2));

console.log(`\nDNS de ${d} guardado em ${out}\n`);

const mx = Array.isArray(registos.MX) ? registos.MX : [];
if (mx.length) {
  console.log('⚠  ESTE DOMÍNIO TEM EMAIL ATIVO');
  mx.forEach((r) => console.log(`     MX  ${r.priority}  ${r.exchange}`));
  const spf = (Array.isArray(registos.TXT) ? registos.TXT.flat() : []).filter((t) => t.includes('v=spf1'));
  spf.forEach((t) => console.log(`     SPF ${t.slice(0, 90)}`));
  console.log('\n   NÃO alteres MX nem TXT. Muda apenas os registos A e CNAME do site.');
  console.log('   Se vais trocar nameservers, recria TODOS estes registos ANTES da troca.');
  console.log('   Na dúvida, prepara a instrução e deixa o cliente ou o fornecedor executar.\n');
} else {
  console.log('   Sem registos MX: não parece haver email neste domínio.');
  console.log('   Confirma com o cliente antes de assumir.\n');
}

const soa = Array.isArray(registos.SOA) ? registos.SOA[0] : registos.SOA;
if (soa?.minttl >= 3600) {
  console.log(`   TTL alto (${soa.minttl}s). Baixa para 300 uns dias antes da mudança`);
  console.log('   para que a reversão propague em minutos e não em horas.\n');
}
