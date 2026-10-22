# RECOLHA: A Família na Quinta (Lamego)
Recolha 2026-10-20, ~12:18 a 12:32 (~14 min). Pedido: casa + conceito, tão completos um como o outro.

## Identidade (para o juízo decidir)
- Telefone 965741870 e site Wix e email: iguais entre Google Maps, site Wix, Facebook e dashboard. Fonte do conceito confirmada.
- Airbnb (link do Diogo): host Ana Bem, coanfitrião Julio Americo (~ responsável do registo Júlio Américo Lopes De Bem), quinta familiar em Lamego, review de Lígia liga a casa aos animais e ao projeto. MAS o registo no Airbnb é 169351/AL e o do dashboard rnal-169288; capacidade 3 vs 4; códigos postais 5100-513 vs 5100-062. Tratei-o como a casa certa por ser o link dado, mas fica `[A_VERIFICAR]` (ver `fontes.md`, `compliance.md`). Sugestão: confirmar com o dono se há dois registos.
- O anúncio Airbnb não fala dos animais; o site Wix não fala da casa. Só as reviews os ligam.

## Recolhido
- Airbnb: anúncio e 31 comodidades; 29 reviews completas (`reviews.json`/`reviews.md`, 32 com as 3 do Google); 38 fotos (interior 28, exterior 10), largura 1920. 7 reviews em tradução automática do Airbnb, originais não abertos. Spa nas fotos parece insuflável (INFERIDO).
- Site Wix inteiro (menu: Apadrinhamento, O Nosso Projeto, Galeria + início; mapeamento: "O Nosso Projeto" = /copy-of-apadrinhamento): textos à letra em `marketing/textos.md`; 47 fotos de animais em `marketing/fotos/conceito/` e 6 em `marca/` (2 são stock: rapariga com coração, balões). Os animais não têm legenda; nomes do carrossel (Timô, Winnie, Nolan, Kiara, Baby, Lily, Baby) sem ligação às fotos. Dados de apadrinhamento: 15 EUR/ano, IBAN e MBWAY no site. Sem páginas de valores, missão, quem são, visitas ou voluntariado: o site só tem estas.
- Facebook (10 mil seguidores): só bio e um post (18-08-2025) sem sessão. Posts e álbuns bloqueados.
- Google Maps: ficha 5,0 (3), 1 crítica com texto (russo, traduzida), 2 só estrelas. Fotos não percorridas.
- Instagram: não encontrado.
- Região: 6 atrações da cache (`regiao/regiao.md`, `regiao/cache.md`, 5 fotos com crédito). Coordenadas de Lamego aproximadas (41.10,-7.80).

## Por recolher / bloqueado
Facebook (posts diários do projeto, álbuns), vídeos do site Wix (Kaio, etc.), fotos do Google, originais das traduções, formulário de apadrinhamento, Booking (não fornecido). Ver `_bruto/cobertura.json`.

## Conflitos (não resolvidos)
Registo 169351 vs 169288; 3 vs 4 pessoas; códigos postais; "estores blackout" vs reviews que dizem não haver persianas/cortinas; jacuzzi anunciado como aquecido vs 6 reviews com problemas (suja, fria, sem funcionar); humidade/mofo na casa de banho (4 reviews, Airbnb não menciona).

## Tempos
Arranque e identidade ~3 min; coletores (Airbnb parcial: só 6 reviews e miniaturas) + mão (modal Airbnb, Wix 4 páginas, fotos) ~9 min; região cache ~1 min; docs e validação ~3 min. O Airbnb.py não abre o modal de reviews/fotos: reusei `scratchpad/ab2.py` (não guardado na skill). Validador: só faltam resumo.md, pontos-fortes.md, site-pronto.md (do juízo).
