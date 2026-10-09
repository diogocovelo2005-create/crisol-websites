# Escolher e trocar a paleta

---

## 1. De onde vem a paleta

A paleta vem **das fotografias do cliente e da vibe da casa**. Nunca do teu
gosto e nunca de uma paleta "bonita" genérica.

1. **Olha para as fotos principais** (fachada, paisagem, interiores) e
   identifica: a cor dominante da pedra ou das paredes, a cor da natureza à
   volta, e um pormenor quente ou marcante (madeira, portadas, telhado,
   tecidos).
2. **Traduz para os papéis de cor do template.** A maioria dos templates tem
   estes cinco:

| Papel | O que é | De onde tirar |
|---|---|---|
| Fundo | A cor da página. Clara. | A parede, a cal, a areia, o linho |
| Escuro | Bandas escuras, rodapé, a "noite" | A natureza à volta ou a pedra escura |
| Texto | Texto principal sobre o fundo | Um quase-preto com o tom do escuro |
| Texto secundário | Texto corrido, legendas | Um cinzento com o tom do escuro |
| Destaque | O botão principal e pequenos acentos | O pormenor marcante |

> Exemplos (ilustrativos): casa de xisto na serra → fundo de pedra clara,
> escuro ardósia, destaque musgo. Casa caiada no Alentejo → fundo cal, escuro
> terra, destaque terracota. Casa na praia → fundo areia, escuro
> azul-profundo, destaque coral.

3. Consulta as paletas do registo para não repetires uma escolha automática.
Se duas soluções forem igualmente adequadas, prefere outra família de fundo ou
destaque. Não forces uma cor pior apenas para cumprir diferença.

## 2. Contraste obrigatório

Confirma com o script `scripts/contraste.mjs` desta skill:

```
node <pasta-da-skill>/scripts/contraste.mjs "#22261f" "#f5f0e7"
```

| Par | Mínimo |
|---|---|
| Texto sobre fundo | 4.5 |
| Texto secundário sobre fundo | 4.5 |
| Texto claro sobre escuro | 4.5 |
| Texto do botão sobre o destaque | 4.5 |
| Etiquetas pequenas (se usarem uma cor de destaque) sobre o fundo | 4.5 |

Se um par falhar, ajusta a cor desse par (mais escura ou mais clara) mantendo
a família. Não mudes a paleta inteira por causa de um par.

## 3. Como trocar

1. **Encontra todas as cores do template** (já estão no mapa de
   `ADAPTACAO.md`):
   - as do tema (ex.: `@theme` no `globals.css`);
   - **as cores escritas à mão fora do tema.** Ex.: uma secção que anima a
     cor da página guarda as cores em hexadecimal no componente; um `hover`
     com uma cor fixa; sombras e véus com `rgba(...)`.
2. **Troca os valores do tema** pelos da nova paleta.
3. Revê cores fixas e transições pela composição atual. Não conserves uma
   passagem de claro para escuro ou uma sugestão de noite por vir no exemplo.
4. Podes manter ou renomear tokens; atualiza os usos afetados de forma coerente.

## 4. Fotos

O tratamento é opcional e decidido por imagem. Compara original e resultado.
Podes ajustar, substituir ou dispensar a ferramenta existente. Não apliques
automaticamente a mesma grade, vinheta ou dessaturação a todo o conjunto;
preserva luz natural e a qualidade que tornou a fotografia uma boa escolha.

## 5. Medir depois de trocar

Com o Playwright, percorre a página inteira e confirma:
- nenhuma zona ficou com a cor antiga (procura no código os valores
  hexadecimais antigos: não pode sobrar nenhum);
- as secções que mudam de cor fazem a transição com as cores novas;
- o texto por cima de fotografias continua legível.
