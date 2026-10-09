# site-delivery

A segunda metade do ciclo de um website: o que faz um site funcionar depois de estar bonito.

```bash
npm install && npx playwright install chromium
```

| Script | Para quê |
|---|---|
| `crawl-old-site.js` | Salvaguardar conteúdo e inventariar URLs de um site existente |
| `dns-snapshot.js` | Retrato do DNS antes de qualquer alteração — sem dependências |
| `check-redirects.js` | Garantir que nenhum URL antigo fica em 404 |
| `preflight.js` | Verificação do site novo antes de mexer no domínio |

Os dois primeiros correm-se no início de uma migração; os dois últimos antes de lançar.

`dns-snapshot.js` não precisa do Playwright e pode correr isolado.
