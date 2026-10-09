const fs = require('fs');
let c = fs.readFileSync('render.mjs', 'utf8');

const regexExtras = /<section class="extras-resumo">[\s\S]*?<\/section>/;
const match = c.match(regexExtras);
if (match) {
    c = c.replace(match[0], '');
    c = c.replace(/<article class="folha trabalho">\n.*?/, `$&${match[0]}\n    `);
    fs.writeFileSync('render.mjs', c);
}
