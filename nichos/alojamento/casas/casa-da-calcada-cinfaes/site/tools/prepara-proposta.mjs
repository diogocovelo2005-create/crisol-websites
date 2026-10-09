import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const raiz = process.cwd();
const origem = path.resolve(raiz, '..', 'dossie', 'marketing', 'fotos');
const destino = path.resolve(raiz, 'public', 'fotos');

const imagens = [
  ['exterior/aerea-01.jpg', 'proposta-aerea.webp', 1920, 760, 'cover'],
  ['exterior/piscina-torre-03.jpg', 'proposta-piscina.webp', 1620, 1080, 'cover'],
  ['exterior/glicinias-alameda-01.jpg', 'proposta-glicinias.webp', 1500, 1000, 'cover'],
  ['exterior/torre-porta-01.jpg', 'proposta-porta.webp', 1200, 1500, 'cover'],
  ['interior/corredor-pedra-01.jpg', 'proposta-corredor.webp', 1500, 1000, 'cover'],
  ['interior/capela-interior-03.jpg', 'proposta-capela.webp', 1400, 1050, 'cover'],
  ['exterior/tanque-nascente-01.jpg', 'proposta-tanque.webp', 1100, 1400, 'cover'],
  ['interior/quarto-aguas-furtadas-02.jpg', 'proposta-claraboia.webp', 1200, 900, 'cover'],
  ['interior/salao-jantar-01.jpg', 'proposta-mesa.webp', 1500, 1125, 'cover'],
  ['exterior/capela-05.jpg', 'proposta-fecho.webp', 1800, 1200, 'cover'],
];

await mkdir(destino, { recursive: true });

for (const [entrada, saida, width, height, fit] of imagens) {
  await sharp(path.join(origem, entrada))
    .rotate()
    .resize({ width, height, fit, position: 'attention', withoutEnlargement: true })
    .modulate({ saturation: 0.92, brightness: 0.98 })
    .webp({ quality: 86, effort: 5 })
    .toFile(path.join(destino, saida));
  console.log(saida);
}
