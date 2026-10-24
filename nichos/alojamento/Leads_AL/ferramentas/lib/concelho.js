// Contorno oficial do concelho (OpenStreetMap) e "este ponto é deste concelho?".
// O código postal não chega (o 5040 é da Régua e de Mesão Frio; o Booking escreve "Peso da Régua" em moradas de Lamego),
// e as terras do registo não chegam (uma casa de Moura Morta ficava de fora por nenhuma casa do registo ser de lá).
//   const { poligono, dentro } = require('./lib/concelho.js');
//   await poligono('Peso da Régua')   -> guarda data/poligono-<concelho>.json (uma vez)
//   dentro(geo, lat, lng)             -> true/false
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', '..', 'data');
const nf = c => c.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '-');

async function poligono(concelho) {
  const f = path.join(DATA, `poligono-${nf(concelho)}.json`);
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8'));
  const u = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(concelho)}&countrycodes=pt&format=json&polygon_geojson=1&limit=5`;
  const r = await (await fetch(u, { headers: { 'User-Agent': 'LeadsAL-prospecao/1.0' } })).json();
  const b = r.find(x => x.class === 'boundary' && x.type === 'administrative' && /Polygon/.test(x.geojson?.type));
  if (!b) throw new Error(`OpenStreetMap não deu o contorno de ${concelho}`);
  fs.writeFileSync(f, JSON.stringify(b.geojson));
  return b.geojson;
}
const lerPoligono = concelho => { try { return JSON.parse(fs.readFileSync(path.join(DATA, `poligono-${nf(concelho)}.json`), 'utf8')); } catch { return null; } };

// raio: ponto dentro de um anel [[lng, lat], ...]
function noAnel(anel, x, y) {
  let d = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const [xi, yi] = anel[i], [xj, yj] = anel[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
}
function dentro(geo, lat, lng) {
  if (!geo || lat == null || lng == null) return null;
  const pols = geo.type === 'MultiPolygon' ? geo.coordinates : [geo.coordinates];
  return pols.some(([fora, ...buracos]) => noAnel(fora, lng, lat) && !buracos.some(b => noAnel(b, lng, lat)));
}
// distância (km, aproximada) do ponto à fronteira do concelho: o Airbnb desloca o ponto do mapa até ~500 m
function distFronteira(geo, lat, lng) {
  const pols = geo.type === 'MultiPolygon' ? geo.coordinates : [geo.coordinates];
  const kx = 111.32 * Math.cos(lat * Math.PI / 180), ky = 110.57;
  let m = Infinity;
  for (const pol of pols) for (const anel of pol) for (let i = 1; i < anel.length; i++) {
    const [x1, y1] = anel[i - 1], [x2, y2] = anel[i];
    const ax = (x1 - lng) * kx, ay = (y1 - lat) * ky, bx = (x2 - lng) * kx, by = (y2 - lat) * ky;
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    const t = l2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l2)) : 0;
    m = Math.min(m, Math.hypot(ax + t * dx, ay + t * dy));
  }
  return m;
}
module.exports = { poligono, lerPoligono, dentro, distFronteira };
