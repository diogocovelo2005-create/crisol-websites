// Captura de ecrã com o Edge headless que já vem com o Windows.
//   node hero.js --casa <slug> <link>   -> heros/<slug>.png      (hero da casa, do deploy ou do localhost)
//   node hero.js <https://site> <id-da-lead>  -> capturas/<id>.png  (site de um alojamento, para decidir antigo/moderno)
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let url, saida;
if (args[0] === '--casa') {
  const [, slug, link] = args;
  if (!slug || !/^https?:\/\//.test(link || '')) { console.error('uso: node hero.js --casa <slug> <link>'); process.exit(1); }
  url = link;
  saida = path.join(__dirname, 'heros', slug + '.png');
} else {
  const [alvo, id] = args;
  if (!/^https?:\/\//.test(alvo || '') || !id) { console.error('uso: node hero.js <url> <id>  |  node hero.js --casa <slug> <link>'); process.exit(1); }
  url = alvo;
  saida = path.join(__dirname, 'capturas', id + '.png');
}

// Edge ou, se não houver, Chrome (os dois aceitam as mesmas opções)
const PF = [process.env['ProgramFiles(x86)'], process.env.ProgramFiles, process.env.LOCALAPPDATA].filter(Boolean);
const EDGE = PF.flatMap(d => [path.join(d, 'Microsoft\\Edge\\Application\\msedge.exe'), path.join(d, 'Google\\Chrome\\Application\\chrome.exe')])
  .find(p => fs.existsSync(p));
if (!EDGE) { console.error('Nem Edge nem Chrome encontrados'); process.exit(1); }
fs.mkdirSync(path.dirname(saida), { recursive: true });

// Grava primeiro num temporário: se a captura falhar, a imagem anterior fica
const tmp = saida.replace(/\.png$/, '.tmp.png');
try { fs.unlinkSync(tmp); } catch {}
try {
  execFileSync(EDGE, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--window-size=1440,900', '--virtual-time-budget=6000',
    '--screenshot=' + tmp, url,
  ], { stdio: 'ignore', timeout: 60000 });
} catch {}

if (fs.existsSync(tmp) && fs.statSync(tmp).size > 5000) {
  fs.renameSync(tmp, saida);
  console.log('ok ' + path.relative(__dirname, saida));
} else {
  try { fs.unlinkSync(tmp); } catch {}
  console.log('falhou: ' + url + ' não abriu');
}
