// Testes do normalizador das ofertas: node --test scripts/testes/oferta.test.mjs (Node 22.18+ / 24).
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizarOferta, ofertaNaFrase, listaDeOfertas, OFERTA_MAX } from "../../lib/oferta.ts";

const limpo = (entrada) => normalizarOferta(entrada).texto;
const erro = (entrada) => normalizarOferta(entrada).erro;

const CASOS = [
  // [entrada, saída esperada]
  ["Garrafa de vinho do Dão à chegada", "Garrafa de vinho do Dão à chegada"],
  ["  garrafa   de vinho\n\n do Dão  ", "Garrafa de vinho do Dão"],
  ["GARRAFA DE VINHO DO DÃO À CHEGADA!!!", "Garrafa de vinho do dão à chegada"],
  ["Saída tardia até às 14h.", "Saída tardia até às 14h"],
  ["oferecemos o jantar na 1ª noite", "Oferecemos o jantar na 1ª noite"],
  ["1ª noite com jantar", "1ª noite com jantar"],
  ["Oferta: cesto de fruta da quinta", "Cesto de fruta da quinta"],
  ["OFERTA - Cesto de fruta", "Cesto de fruta"],
  ["Promoção – garrafa de espumante", "Garrafa de espumante"],
  ["Grátis! Pão quente ao pequeno-almoço", "Pão quente ao pequeno-almoço"],
  ["Oferta de boas-vindas", "Oferta de boas-vindas"],
  ["🍷 Vinho do Porto 🎉🎉", "Vinho do Porto"],
  ["Vinho 👍🏽 tinto", "Vinho tinto"],
  ["<b>Bolo</b> caseiro", "Bolo caseiro"],
  ["<script>alert('x')</script>Bolo caseiro", "Bolo caseiro"],
  ["&lt;script&gt;alert(1)&lt;/script&gt; Bolo", "Bolo"],
  ["Bolo &amp; café", "Bolo & café"],
  ["Visite https://exemplo.com/oferta para saber mais", "Visite para saber mais"],
  ["Vinho www.quinta.pt grátis", "Vinho grátis"],
  ["Ligue 964 506 038 para o jantar", "Ligue para o jantar"],
  ["Escreva para teresa@gmail.com já", "Escreva para já"],
  ['"Jantar romântico"', "Jantar romântico"],
  ["«Jantar romântico»", "Jantar romântico"],
  ['Jantar "especial" à luz das velas', 'Jantar "especial" à luz das velas'],
  ["Cesto de fruta... e flores...", "Cesto de fruta e flores"],
  ["Café?!?! incluído", "Café? incluído"],
  ["- cesto de fruta -", "Cesto de fruta"],
  ["coração de açúcar, pão-de-ló", "Coração de açúcar, pão-de-ló"],
  ["ÇOPA DE LEGUMES", "Çopa de legumes"],
  ["Visita guiada às vinhas (2h)", "Visita guiada às vinhas (2h)"],
  ["10 % de desconto no SPA", "10 % de desconto no SPA"],
  ["massagem ★★★ relaxante", "Massagem relaxante"],
  ["Jantar\u200B na\u00A0quinta", "Jantar na quinta"],
  ["Jantar\tna\r\nquinta", "Jantar na quinta"],
  ["GARRAFA DE VINHO DO DÃO À CHEGADA já", "Garrafa de vinho do dão à chegada já"],
  ["Jantar NA QUINTA COM VINHO", "Jantar na quinta com vinho"],
  ["Visita à ADEGA", "Visita à ADEGA"],
];

for (const [entrada, esperado] of CASOS) {
  test(`limpa: ${JSON.stringify(entrada).slice(0, 60)}`, () => {
    assert.equal(limpo(entrada), esperado);
    assert.equal(erro(entrada), null);
  });
}

test("recusa o vazio e o que não tem palavras", () => {
  for (const x of ["", "   ", "\n\t", "!!!", "...", "🎉🎉🎉", "<p></p>", "123", "14", "€€€", "https://exemplo.com", "Oferta:", "Grátis!", null, undefined, {}, ["a"]]) {
    assert.ok(erro(x), `devia recusar ${JSON.stringify(x)}`);
  }
});

test("não corta em silêncio: avisa a partir do limite", () => {
  const longo = "Garrafa de vinho ".repeat(20); // ~340
  const r = normalizarOferta(longo);
  assert.match(r.erro, /caracteres; o máximo é 70/);
  assert.ok(r.texto.length > OFERTA_MAX);
  const r300 = normalizarOferta("a".repeat(300));
  assert.match(r300.erro, /300 caracteres/);
  const certo = "x".repeat(OFERTA_MAX - 1) + "y";
  assert.equal(normalizarOferta(certo).erro, null);
});

test("idempotente: limpar o limpo não muda nada", () => {
  for (const [entrada] of CASOS) {
    const uma = limpo(entrada);
    assert.equal(limpo(uma), uma);
  }
});

test("o resultado nunca leva < > nem controlos", () => {
  const sujos = ["<img src=x onerror=alert(1)>Bolo", "a<b", "Bolo\u0000caseiro", "Bolo<<>>caseiro", "&#60;script&#62;Bolo"];
  for (const x of sujos) {
    const t = limpo(x);
    assert.doesNotMatch(t, /[<>\p{Cc}]/u, `${JSON.stringify(x)} → ${t}`);
  }
});

test("acentos e ç mantêm-se, também em forma decomposta", () => {
  assert.equal(limpo("Pa\u0303o de lo\u0301 e c\u0327ha"), "Pão de ló e çha");
});

test("o nome da promoção: mesma limpeza, limite de 40, opcional", async () => {
  const { normalizarNome, NOME_MAX } = await import("../../lib/oferta.ts");
  assert.equal(NOME_MAX, 40);
  assert.deepEqual(normalizarNome("  🎃 MAGUSTO NA QUINTA!!! "), { texto: "Magusto na quinta", erro: null });
  assert.deepEqual(normalizarNome("Páscoa na quinta"), { texto: "Páscoa na quinta", erro: null });
  assert.deepEqual(normalizarNome("Promoção: Época baixa"), { texto: "Época baixa", erro: null });
  for (const vazio of ["", "   ", "!!! 🎃 ???", undefined, null]) assert.deepEqual(normalizarNome(vazio), { texto: "", erro: null });
  assert.match(normalizarNome("Promoção de outono ".repeat(4)).erro, /máximo é 40/);
  assert.match(normalizarNome("2027").erro, /palavras/);
});

test("a frase da promoção: limpeza, limite de 140, opcional", async () => {
  const { normalizarFrase, FRASE_MAX } = await import("../../lib/oferta.ts");
  assert.equal(FRASE_MAX, 140);
  assert.deepEqual(normalizarFrase("  VENHA PASSAR O NATAL CONNOSCO!!! 🎄 www.x.pt "), { texto: "Venha passar o natal connosco", erro: null });
  assert.deepEqual(normalizarFrase("Uns dias de sossego. Esperamos por si."), { texto: "Uns dias de sossego. Esperamos por si", erro: null });
  for (const vazio of ["", "  ", "🎄🎄", null]) assert.deepEqual(normalizarFrase(vazio), { texto: "", erro: null });
  assert.match(normalizarFrase("Uma frase muito comprida ".repeat(8)).erro, /máximo é 140/);
});

test("as frases das sugestões cumprem as regras", async () => {
  // lib/precos.ts usa os caminhos «@/» do Next: lêem-se as frases do próprio ficheiro.
  const { readFileSync } = await import("node:fs");
  const fonte = readFileSync(new URL("../../lib/precos.ts", import.meta.url), "utf8");
  const bloco = fonte.slice(fonte.indexOf("export const SUGESTOES"), fonte.indexOf("export const SUGESTOES_NOME"));
  const SUGESTOES = [...bloco.matchAll(/nome: "([^"]+)",\s*frases: \[([\s\S]*?)\]/g)].map((m) => ({ nome: m[1], frases: [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]) }));
  const FRASE_NEUTRA = /export const FRASE_NEUTRA = "([^"]+)"/.exec(fonte)[1];
  const { normalizarFrase } = await import("../../lib/oferta.ts");
  assert.equal(SUGESTOES.length, 12);
  for (const s of SUGESTOES) {
    assert.ok(s.frases.length >= 2 && s.frases.length <= 3, s.nome);
    for (const f of [...s.frases, FRASE_NEUTRA]) {
      assert.equal(normalizarFrase(f).texto, f, `já limpa: ${f}`);
      assert.equal(normalizarFrase(f).erro, null, f);
      assert.doesNotMatch(f, /!|inclu[íi]d|jantar|pequeno-almoço|oferec|grátis|gratuit|desconto|imperdível|único/i, f);
    }
  }
});

test("a oferta a meio de uma frase passa a minúscula, menos siglas e nomes próprios", () => {
  assert.equal(ofertaNaFrase("Garrafa de vinho à chegada"), "garrafa de vinho à chegada");
  assert.equal(ofertaNaFrase("Çopa de legumes"), "çopa de legumes");
  assert.equal(ofertaNaFrase("SPA de 1 hora"), "SPA de 1 hora");
  assert.equal(ofertaNaFrase("WiFi premium"), "WiFi premium");
  assert.equal(ofertaNaFrase("1ª noite com jantar"), "1ª noite com jantar");
  assert.equal(ofertaNaFrase("garrafa de vinho"), "garrafa de vinho");
  assert.equal(ofertaNaFrase("Á vontade"), "á vontade");
  assert.equal(ofertaNaFrase(""), "");
});

test("várias ofertas numa frase leem-se bem", () => {
  assert.equal(listaDeOfertas(["Garrafa de vinho à chegada"]), "garrafa de vinho à chegada");
  assert.equal(listaDeOfertas(["Cesto de fruta", "Garrafa de vinho"]), "cesto de fruta e garrafa de vinho");
  assert.equal(listaDeOfertas(["Cesto de fruta", "SPA de 1 hora", "Saída tardia"]), "cesto de fruta, SPA de 1 hora e saída tardia");
});

test("escolher uma sugestão não apaga a frase escrita à mão", async () => {
  const { fraseAoEscolherSugestao } = await import("../../lib/oferta.ts");
  const sugeridas = ["Frase A", "Frase B", "Frase C"];
  assert.equal(fraseAoEscolherSugestao("", sugeridas, ["Frase C", "Frase D"]), "Frase C");
  assert.equal(fraseAoEscolherSugestao("  Frase B ", sugeridas, ["Frase C"]), "Frase C");
  assert.equal(fraseAoEscolherSugestao("A minha frase", sugeridas, ["Frase C"]), null);
  assert.equal(fraseAoEscolherSugestao("", sugeridas, []), null);
});
