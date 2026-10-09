/**
 * arranque.js — tem de ser o PRIMEIRO import de qualquer script executavel.
 *
 * Faz duas coisas, por esta ordem:
 *
 *   1. muda o directorio de trabalho para a raiz do pacote
 *   2. so depois carrega o .env
 *
 * A ordem importa. O dotenv procura o .env no directorio de trabalho, e os
 * scripts escrevem em caminhos relativos — grid/, keywords/, .state/,
 * screenshots/. Invocados a partir de outro sitio (por exemplo da raiz do
 * projeto, quando a skill dispara), sem isto o .env nao seria encontrado e a
 * grelha de Viseu iria parar a uma pasta grid/ nova, longe das outras.
 *
 * E por isso que nao se usa `import "dotenv/config"`: esse corre no momento do
 * import, antes de qualquer chdir poder acontecer.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

/** <pacote>/scripts/lib/arranque.js -> <pacote> */
export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

process.chdir(RAIZ);

// quiet: sem isto o dotenv imprime um banner em cada arranque, e os relatorios
// deste pipeline sao para se ler.
config({ quiet: true });
