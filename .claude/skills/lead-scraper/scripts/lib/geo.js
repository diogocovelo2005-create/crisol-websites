/**
 * Geometria partilhada pelo gen-grid.js e pelo discover.js.
 *
 * Vive numa lib porque o teste ponto-dentro-do-poligono e usado nos dois
 * sitios: o gen-grid descarta celulas fora da regiao, e o discover descarta
 * lugares cujas coordenadas caem fora dela. Duas copias do mesmo ray casting
 * divergiriam, e a divergencia seria invisivel — os dois lados continuariam
 * a devolver booleanos com ar de razoaveis.
 */

const R_TERRA_KM = 6371.0088;

/** Um grau de latitude tem sempre ~111.32 km. Longitude e que encolhe. */
export const M_POR_GRAU_LAT = 111320;

/** Metros por grau de longitude na latitude dada (0 nos polos). */
export function mPorGrauLon(lat) {
  return M_POR_GRAU_LAT * Math.cos((lat * Math.PI) / 180);
}

const rad = (g) => (g * Math.PI) / 180;

/* ────────────────────────── ponto dentro de poligono ────────────────────── */

/**
 * Ray casting num unico anel. Lanca um raio horizontal para leste e conta
 * travessias: impar = dentro.
 *
 * O teste (yi > lat) !== (yj > lat) e assimetrico de proposito — trata cada
 * aresta como fechada em baixo e aberta em cima. Sem essa assimetria, um
 * ponto exactamente a altura de um vertice conta a travessia duas vezes e
 * o resultado inverte-se. Em grelhas regulares como a nossa, onde muitos
 * pontos partilham a mesma latitude, isso deixa de ser um caso teorico.
 */
function dentroDoAnel(lng, lat, anel) {
  let dentro = false;
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const xi = anel[i][0], yi = anel[i][1];
    const xj = anel[j][0], yj = anel[j][1];
    const cruza =
      (yi > lat) !== (yj > lat) &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (cruza) dentro = !dentro;
  }
  return dentro;
}

/** Um Polygon GeoJSON: anel 0 e o exterior, os seguintes sao buracos. */
function dentroDeUmPoligono(lng, lat, aneis) {
  if (!dentroDoAnel(lng, lat, aneis[0])) return false;
  for (let i = 1; i < aneis.length; i++) {
    if (dentroDoAnel(lng, lat, aneis[i])) return false;
  }
  return true;
}

/**
 * Suporta Polygon e MultiPolygon. Concelhos com enclaves e regioes com ilhas
 * chegam do Nominatim como MultiPolygon; tratar so o Polygon deitaria fora
 * partes inteiras da regiao sem um unico aviso.
 *
 * Geometria ausente devolve sempre true — quem chama tem de ter avisado.
 */
export function dentroDoPoligono(lng, lat, geometria) {
  if (!geometria) return true;
  if (geometria.type === "Polygon") {
    return dentroDeUmPoligono(lng, lat, geometria.coordinates);
  }
  if (geometria.type === "MultiPolygon") {
    return geometria.coordinates.some((p) => dentroDeUmPoligono(lng, lat, p));
  }
  throw new Error(`Geometria nao suportada: ${geometria.type}`);
}

/* ──────────────────────────────── medidas ───────────────────────────────── */

/** Todos os aneis de um Polygon ou MultiPolygon, achatados. */
export function aneisDe(geometria) {
  if (!geometria) return [];
  if (geometria.type === "Polygon") return geometria.coordinates;
  if (geometria.type === "MultiPolygon") return geometria.coordinates.flat();
  return [];
}

/** [minLng, minLat, maxLng, maxLat] */
export function bboxDe(geometria) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
  for (const anel of aneisDe(geometria)) {
    for (const [lng, lat] of anel) {
      if (lng < minLng) minLng = lng;
      if (lat < minLat) minLat = lat;
      if (lng > maxLng) maxLng = lng;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return [minLng, minLat, maxLng, maxLat];
}

/** Area assinada de um anel na esfera, em km2. O sinal indica a orientacao. */
function areaDoAnelKm2(anel) {
  let total = 0;
  for (let i = 0; i < anel.length - 1; i++) {
    const [x1, y1] = anel[i];
    const [x2, y2] = anel[i + 1];
    total += rad(x2 - x1) * (2 + Math.sin(rad(y1)) + Math.sin(rad(y2)));
  }
  return (total * R_TERRA_KM * R_TERRA_KM) / 2;
}

/**
 * Area real do poligono em km2, com os buracos subtraidos.
 *
 * E isto — e nao a bbox — que distingue o distrito do concelho quando o
 * Nominatim devolve varios candidatos com display_name identico. A bbox de
 * uma regiao em L exagera muito; a area nao.
 */
export function areaKm2(geometria) {
  if (!geometria) return 0;
  const poligonos =
    geometria.type === "Polygon" ? [geometria.coordinates]
    : geometria.type === "MultiPolygon" ? geometria.coordinates
    : [];
  let total = 0;
  for (const aneis of poligonos) {
    total += Math.abs(areaDoAnelKm2(aneis[0]));
    for (let i = 1; i < aneis.length; i++) {
      total -= Math.abs(areaDoAnelKm2(aneis[i]));
    }
  }
  return total;
}

/** Distancia em metros entre dois pontos (haversine). */
export function distanciaM(lat1, lng1, lat2, lng2) {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_TERRA_KM * 1000 * Math.asin(Math.sqrt(a));
}

/* ──────────────────────────── empacotamento hex ─────────────────────────── */

/**
 * Centros em empacotamento hexagonal a cobrir uma bbox.
 *
 * Com distancia s entre vizinhos, o ponto mais mal servido de uma malha
 * hexagonal esta a s/raiz(3) do centro mais proximo. Logo circulos de raio r
 * cobrem tudo sse s <= r*1.732. O espacamento de r*1.5 que usamos fica
 * abaixo disso com folga: cobertura total, com sobreposicao nas bordas, que
 * e onde a API e menos fiavel.
 *
 * As linhas alternadas levam meio passo de desvio — e isso que torna a
 * malha hexagonal em vez de quadrada. Numa malha quadrada com o mesmo
 * espacamento os cantos ficariam a s/raiz(2), mais longe, e abririam buracos.
 */
export function malhaHexagonal(bbox, espacamentoM) {
  const [minLng, minLat, maxLng, maxLat] = bbox;
  const dLat = ((espacamentoM * Math.sqrt(3)) / 2) / M_POR_GRAU_LAT;
  const pontos = [];
  let linha = 0;
  for (let lat = minLat; lat <= maxLat + dLat; lat += dLat, linha++) {
    const dLng = espacamentoM / mPorGrauLon(lat);
    const desvio = linha % 2 ? dLng / 2 : 0;
    for (let lng = minLng - desvio; lng <= maxLng + dLng; lng += dLng) {
      pontos.push([lng, lat]);
    }
  }
  return pontos;
}

/* ─────────────────────── distancia a fronteira da regiao ────────────────── */

/** Distancia em metros de um ponto a um segmento, em plano local. */
function distanciaASegmentoM(lat, lng, a, b, mLon) {
  const px = lng * mLon, py = lat * M_POR_GRAU_LAT;
  const ax = a[0] * mLon, ay = a[1] * M_POR_GRAU_LAT;
  const bx = b[0] * mLon, by = b[1] * M_POR_GRAU_LAT;
  const dx = bx - ax, dy = by - ay;
  const den = dx * dx + dy * dy;
  let t = den === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / den;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/**
 * Indice das arestas da fronteira, para responder depressa a "esta fronteira
 * a menos de R metros deste ponto?".
 *
 * Existe por causa de um erro que a soma de areas nao denuncia: filtrar os
 * centros da grelha por "esta dentro do poligono" deixa a faixa da fronteira
 * descoberta, porque um ponto da regiao junto ao limite tem o centro hexagonal
 * mais proximo do lado de fora — e esse centro foi descartado. O criterio
 * correcto e "o circulo toca a regiao", que precisa da distancia a fronteira.
 */
export function criarIndiceArestas(geometria, tamanhoGrau = 0.02) {
  const baldes = new Map();
  for (const anel of aneisDe(geometria)) {
    for (let i = 0; i < anel.length - 1; i++) {
      const a = anel[i], b = anel[i + 1];
      const gy0 = Math.floor(Math.min(a[1], b[1]) / tamanhoGrau);
      const gy1 = Math.floor(Math.max(a[1], b[1]) / tamanhoGrau);
      const gx0 = Math.floor(Math.min(a[0], b[0]) / tamanhoGrau);
      const gx1 = Math.floor(Math.max(a[0], b[0]) / tamanhoGrau);
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          const k = `${gy}:${gx}`;
          if (!baldes.has(k)) baldes.set(k, []);
          baldes.get(k).push([a, b]);
        }
      }
    }
  }
  return {
    /** Ha fronteira a menos de raioM deste ponto? */
    temArestaAte(lat, lng, raioM) {
      const mLon = mPorGrauLon(lat) || 1;
      const passoLat = raioM / M_POR_GRAU_LAT;
      const passoLng = raioM / mLon;
      const gy0 = Math.floor((lat - passoLat) / tamanhoGrau);
      const gy1 = Math.floor((lat + passoLat) / tamanhoGrau);
      const gx0 = Math.floor((lng - passoLng) / tamanhoGrau);
      const gx1 = Math.floor((lng + passoLng) / tamanhoGrau);
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          for (const [a, b] of baldes.get(`${gy}:${gx}`) ?? []) {
            if (distanciaASegmentoM(lat, lng, a, b, mLon) <= raioM) return true;
          }
        }
      }
      return false;
    },
  };
}

/* ────────────────────────────── subdivisao ──────────────────────────────── */

/**
 * Fator do raio dos filhos ao subdividir um circulo saturado em 4 quadrantes.
 *
 * NAO e 0.6. Com os centros dos filhos a meio raio, em (+-R/2, +-R/2), o ponto
 * do circulo pai pior servido nao esta nas diagonais — esta sobre os eixos.
 * A distancia de (R,0) ao centro mais proximo, (R/2,R/2), e R/raiz(2) = 0.707R.
 * Um filho de raio 0.6R deixa esse ponto a descoberto por 0.107R, e como a
 * subdivisao e recursiva os buracos multiplicam-se por nivel.
 *
 * Medido com 400 mil pontos num circulo de 1000 m: fator 0.6 deixa 106 m
 * descobertos; 0.707 cobre tudo. Usa-se 0.71 pela margem.
 *
 * (O optimo teorico para cobrir um disco com 4 discos e ~0.61, mas exige uma
 * disposicao que nao e "nos quadrantes". Com centros em quadrante, 0.707 e o
 * minimo, e nao vale a pena optimizar: as chamadas de pesquisa sao gratuitas.)
 */
export const FATOR_SUBDIVISAO = 0.71;

/** Os 4 filhos de um circulo saturado. Cobrem o pai por inteiro. */
export function subdividirCirculo(lat, lng, raioM) {
  const a = raioM / 2;
  const dLat = a / M_POR_GRAU_LAT;
  const dLng = a / (mPorGrauLon(lat) || 1);
  const raio = raioM * FATOR_SUBDIVISAO;
  return [
    { lat: lat + dLat, lng: lng - dLng, raio },
    { lat: lat + dLat, lng: lng + dLng, raio },
    { lat: lat - dLat, lng: lng - dLng, raio },
    { lat: lat - dLat, lng: lng + dLng, raio },
  ];
}

/**
 * Os 4 quadrantes de um retangulo saturado.
 * Ao contrario dos circulos, retangulos ladrilham exactamente: nao ha fator
 * nenhum a acertar nem sobreposicao a pagar.
 */
export function subdividirRetangulo(low, high) {
  const mLat = (low.lat + high.lat) / 2;
  const mLng = (low.lng + high.lng) / 2;
  return [
    { low: { lat: low.lat, lng: low.lng }, high: { lat: mLat, lng: mLng } },
    { low: { lat: low.lat, lng: mLng }, high: { lat: mLat, lng: high.lng } },
    { low: { lat: mLat, lng: low.lng }, high: { lat: high.lat, lng: mLng } },
    { low: { lat: mLat, lng: mLng }, high: { lat: high.lat, lng: high.lng } },
  ];
}
