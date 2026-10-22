import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[4] / ".claude/skills/al-dossier/scripts"))
from contrato_base import Contrato

c = Contrato(__file__)
AB = "https://www.airbnb.pt/rooms/1452014258760429542"
WIX = "https://lusitanoquinta.wixsite.com/mysite"
HOJE = c.hoje

# ---------------- entidades ----------------
c.entidade("CASA-1", "casa", "Casa \"A Família na Quinta\" (chalé de pedra, Lamego; 169288/AL)")
c.entidade("ESP-OPEN", "espaco", "Open space de 60 m²: cama, sala e cozinha", "CASA-1")
c.entidade("ESP-VARANDA", "espaco", "Varanda privativa com spa e duche exterior", "CASA-1")
c.entidade("ESP-WC", "espaco", "Casa de banho", "CASA-1")
c.entidade("ESP-QUINTA", "espaco", "A quinta e o projeto dos animais (Quinta Lusitano / \"A Família na Quinta\")", "CASA-1")
c.entidade("CANAL-AIRBNB", "canal", "Airbnb 1452014258760429542", "CASA-1")
c.entidade("CANAL-WIX", "canal", "Site Wix do projeto (lusitanoquinta.wixsite.com/mysite)", "ESP-QUINTA")
c.entidade("CANAL-FB", "canal", "Facebook A Família na Quinta", "ESP-QUINTA")
c.entidade("CANAL-GMAPS", "canal", "Google Maps \"Dream Valley - A Familia na Quinta\"", "CASA-1")

# ---------------- evidências ----------------
c.ev("EV-AB-DESC", "casa", ["CASA-1", "ESP-OPEN", "ESP-VARANDA"], AB + " ; marketing/textos.md",
     bloco="Airbnb: descrição, O espaço, Acesso dos viajantes, Outras coisas a ter em conta",
     excerto="moradia única de 60 m² em open space! Localizada em uma quinta familiar [...] spa de hidromassagem aquecido sob o céu aberto e do duche exterior com água quente",
     atualidade="anúncio ativo a 2026-10-20")
c.ev("EV-AB-COMOD", "casa", ["CASA-1"], AB + " ; factos.md, Comodidades", bloco="Airbnb: Mostrar todas as 31 comodidades",
     excerto="Cozinha, Wi-Fi, Estacionamento gratuito no local, Banheira de hidromassagem, TV com Disney+, Netflix, Ar condicionado; indisponível: detetor de fumo, detetor de monóxido de carbono, aquecimento, máquina de lavar",
     atualidade="anúncio ativo a 2026-10-20")
c.ev("EV-AB-REGRAS", "casa", ["CASA-1"], AB, bloco="Airbnb: Coisas a saber / Regras da casa; Onde irá dormir",
     excerto="Check-in após as 14:00; Check-out até às 11:00; Máximo de 3 hóspedes; 1 cama queen, 1 sofá-cama, 1 berço; Check-in autónomo com o cofre de chaves",
     atualidade="anúncio ativo a 2026-10-20")
c.ev("EV-AB-REG", "casa", ["CASA-1"], AB, bloco="Airbnb: Dados do registo", excerto="169351/AL")
c.ev("EV-AB-NOTA", "plataforma", ["CANAL-AIRBNB"], AB + " ; reviews.md", bloco="Airbnb: avaliações",
     excerto="4,79 · 29 avaliações; limpeza 4,8; precisão 4,8; check-in 5,0; comunicação 4,9; localização 4,5; qualidade-preço 4,5")
c.ev("EV-AB-HOST", "plataforma", ["CASA-1"], AB, bloco="Airbnb: Quem sou / Coanfitriões",
     excerto="Ana Bem, Anfitriã/o desde 2025 [...] Coanfitriões Julio Americo")
c.ev("EV-AB-FOTOS", "casa", ["CASA-1"], "marketing/fotos.md, Interior e Exterior (Airbnb)", bloco="Airbnb: Mostrar todas as fotos (38)")
c.ev("EV-RNT-169288", "registo_publico", ["CASA-1"], "https://rnt.turismodeportugal.pt/RNT/RNAL.aspx?nr=169288 ; compliance.md",
     bloco="RNAL 169288/AL",
     excerto="Nome do Alojamento CASA \"A FAMILIA NA QUINTA\" [...] Modalidade Moradia [...] 4 1 2 [...] Rua da Senhora Pilar 5100-513 Rio de Asnos Freguesia: Ferreiros de Avões Concelho: Lamego [...] Júlio Américo Lopes De Bem; seguro válido até 2026-05-22",
     publicado_em="2025-09-03", atualidade="lido a 2026-10-20")
c.ev("EV-RNT-169351", "registo_publico", ["CASA-1"], "https://rnt.turismodeportugal.pt/RNT/RNAL.aspx?nr=169351 ; compliance.md",
     bloco="RNAL 169351/AL", excerto="Nome do Alojamento COSTA BREEZE [...] Modalidade Apartamento [...] Costa de Caparica [...] Concelho: Almada",
     atualidade="lido a 2026-10-20: é outro AL")
c.ev("EV-GMAPS", "casa", ["CASA-1", "CANAL-GMAPS"], "_bruto/gmaps_ficha.txt ; canais.md", bloco="Google Maps: ficha",
     excerto="Dream Valley - A Familia na Quinta; Casa de férias; 5,0 (3); Rua Senhora do Pilar, 5100-062 Lamego; 455P+RH; 965 741 870; site lusitanoquinta.wixsite.com")
c.ev("EV-WIX-INICIO", "casa", ["ESP-QUINTA", "CANAL-WIX"], WIX + " ; marketing/textos.md", bloco="Wix: página inicial",
     excerto="é um blog diário que relata o nosso dia a dia na \"Quinta Lusitano\". Por detrás desse blog, há um projeto solidário de ajuda animal. Acolhemos animais de quinta necessitados de abrigo e amor e damos-lhes uma família e um lar para a vida inteira!",
     atualidade="site sem data; a galeria é de 2021")
c.ev("EV-WIX-PROJETO", "casa", ["ESP-QUINTA", "CANAL-WIX"], WIX + "/copy-of-apadrinhamento ; marketing/textos.md", bloco="Wix: O Nosso Projeto",
     excerto="O nosso projeto consiste na criação de um Santuário Animal Auto-Sustentável [...] idealizamos um santuário que não viva apenas da solidariedade [...] temos como foco central o acolhimento e não o resgate",
     atualidade="sem data")
c.ev("EV-WIX-APAD", "casa", ["ESP-QUINTA", "CANAL-WIX"], WIX + "/apadrinhamento ; marketing/textos.md", bloco="Wix: Apadrinhamento",
     excerto="O Apadrinhamento é de 15€ anuais, recebes uma fotografia do afilhado com uma dedicatória de \"A Família na Quinta\"! Só precisas de escolher o bebé que queres apadrinhar, deixares o nome do menino e a tua morada!",
     atualidade="sem data; site com fotos de 2021")
c.ev("EV-WIX-GALERIA", "casa", ["ESP-QUINTA", "CANAL-WIX"], "_bruto/wix_apadrinhamento.html (galleryData, title e createdDate de cada foto) ; marketing/fotos.md",
     bloco="Wix: galeria de apadrinhamento, 25 fotos com nome", excerto="Maéva, Noel, Dylan, Evelyne, Keyla, Kaio, Jade, Ariel, Maggie, Lana, Winnie, Timô, Lily, Baby, Kiara, Nolan, Holly, Woody, Nala, Mel, Tommy, Rudolpho, Kiku, Benji, Amber",
     publicado_em="2021-02-06 a 2021-05-05", atualidade="antigo: mais de 5 anos")
c.ev("EV-WIX-HISTORIAS", "casa", ["ESP-QUINTA", "CANAL-WIX"], WIX + " ; marketing/textos.md", bloco="Wix: página inicial (blocos de notícias)",
     excerto="A Kiara e o Nolan tiveram um inicio de vida muito triste [...] Primeira vez na televisão! [...] Compra uma Mascote!", atualidade="sem data; antigo (fotos de 2021)")
c.ev("EV-WIX-PEDIDOS", "casa", ["ESP-QUINTA", "CANAL-WIX"], WIX + "/copy-of-apadrinhamento ; marketing/textos.md", bloco="Wix: Precisamos da tua contribuição",
     excerto="Estábulo para cabras e ovelhas [...] Coelheira [...] IBAN PT50 [...] MBWAY 965741870", atualidade="sem data")
c.ev("EV-FB", "casa", ["ESP-QUINTA", "CANAL-FB"], "https://www.facebook.com/afamilianaquinta ; _bruto/fb_home.txt", bloco="Facebook: bio",
     excerto="Acolhemos animais de quinta necessitados de abrigo e amor e damos-lhes uma família e um lar para a vida inteira! Partilhamos aqui o nosso dia a dia! [...] 10 mil seguidores",
     publicado_em="último post visível 2025-08-18")
c.ev("EV-FOTOS-CONCEITO", "casa", ["ESP-QUINTA"], "marketing/fotos.md, Conceito", bloco="Wix: imagens das 4 páginas (47)",
     publicado_em="2021", atualidade="antigo; nenhuma mostra a casa")
c.ev("EV-DONO", "dono", ["CASA-1", "ESP-QUINTA"], "dono.md (chamada com o Diogo, 2026-10-20)",
     excerto="Eu quero um site focado na casa com o conceito do alinhamento e do projeto deles por trás", publicado_em="2026-10-20")
c.ev("EV-REV-LIGIA", "hospede", ["CASA-1", "ESP-QUINTA"], "reviews.md, A-004", bloco="Airbnb, Lígia, setembro de 2026",
     excerto="Os animais da quinta foram uma agradável surpresa à chegada [...] É um projeto com grande valor", publicado_em="2026-09")
c.ev("EV-REV-VISTA", "hospede", ["CASA-1", "ESP-VARANDA"], "reviews.md, A-005, A-010, A-011, A-015, A-016, A-019, A-021, A-027, A-028, G-001",
     bloco="10 reviews, Airbnb e Google", publicado_em="2025-08 a 2026-05")
c.ev("EV-REV-BELEZA", "hospede", ["CASA-1"], "reviews.md, 17 reviews (ver pontos-fortes.md, ponto 2)", publicado_em="2025-08 a 2026-10")
c.ev("EV-REV-SPA-OK", "hospede", ["ESP-VARANDA"], "reviews.md, A-002, A-004, A-015, A-017, A-025", publicado_em="2025-08 a 2026-10")
c.ev("EV-REV-SPA-PROB", "hospede", ["ESP-VARANDA"], "reviews.md, A-001, A-003, A-009, A-012, A-014, A-022",
     excerto="água suja; cloro; avaria de filtração; pouco limpa; não funcionava (reembolso parcial); não estava ligado, água fria", publicado_em="2025-09 a 2026-10")
c.ev("EV-REV-HUMID", "hospede", ["ESP-WC"], "reviews.md, A-005, A-010, A-012, A-013", publicado_em="2026-01 a 2026-05")
c.ev("EV-REV-CORT", "hospede", ["ESP-OPEN"], "reviews.md, A-013, A-018, A-022 (contra: A-004)", publicado_em="2025-09 a 2026-01")
c.ev("EV-REV-APE", "hospede", ["CASA-1"], "reviews.md, A-005", excerto="não era realmente uma localização acessível a pé", publicado_em="2026-05")
c.ev("EV-REV-RUIDO", "hospede", ["CASA-1"], "reviews.md, A-017, A-022", publicado_em="2025-09")
c.ev("EV-REV-HOST", "hospede", ["CASA-1"], "reviews.md, A-002, A-004, A-007, A-008, A-012, A-015, A-017, A-020, A-021, A-022, A-025, G-001", publicado_em="2025-07 a 2026-10")
c.ev("EV-REV-PRIV", "hospede", ["CASA-1"], "reviews.md, A-001, A-005, A-006, A-009, A-011, A-020, A-025, A-026, A-029, G-001", publicado_em="2025-07 a 2026-10")
c.ev("EV-REV-UMA", "hospede", ["CASA-1"], "reviews.md, A-003 (cabaz), A-022 (Superhost), A-009 (esquentador)", publicado_em="2025-09 a 2026-10")
c.ev("EV-OSRM", "terceiro", ["CASA-1"], "regiao/cache.md e regiao/regiao.md (OSRM a partir do plus code 455P+RH ≈ 41.10956, -7.81356)",
     atualidade="calculado a 2026-10-20, sem trânsito")
c.ev("EV-AB-PLAT", "plataforma", ["CANAL-AIRBNB"], AB, bloco="Airbnb: Anúncios em destaque (texto da plataforma)",
     excerto="Este é um dos poucos espaços na região com esta comodidade.")

# ---------------- afirmações: a casa ----------------
A = c.af
A("AF-01", "CASA-1", "Alojamento inteiro: uma moradia de 60 m² em open space, numa quinta familiar em Lamego.", "facto", "geral", "casa", "confirmado", "afirmar",
  ["EV-AB-DESC", "EV-RNT-169288"])
A("AF-02", "ESP-OPEN", "Construção tradicional em pedra, com teto e vigas de madeira à vista e decoração moderna.", "facto", "geral", "casa", "confirmado", "afirmar",
  ["EV-AB-DESC", "EV-AB-FOTOS"])
A("AF-03", "ESP-OPEN", "Um quarto em open space com cama queen e sofá-cama; uma casa de banho com duche.", "facto", "inventario", "casa", "confirmado", "afirmar",
  ["EV-AB-REGRAS", "EV-RNT-169288", "EV-AB-FOTOS"])
A("AF-03B", "ESP-OPEN", "Há berço.", "facto", "inventario", "casa", "confirmado", "afirmar_com_condicao", ["EV-AB-REGRAS"],
  condicao="Só a pedido/confirmação; listado no Airbnb, não visto nas fotos.")
A("AF-04", "CASA-1", "Até 3 hóspedes.", "facto", "politica", "casa", "confirmado", "afirmar_com_condicao", ["EV-AB-REGRAS"],
  ambito={"fonte": "anúncio do Airbnb", "data": "2026-10-20", "tipo": "regra da casa no canal"}, condicao="Dizer «até 3 hóspedes» como regra do anúncio; o RNT regista 4 utentes: confirmar com o dono (Mário) antes de publicar qualquer número.")
A("AF-04N", "CASA-1", "Capacidade de 4 pessoas.", "facto", "politica", "registo_publico", "conflitante", "nao_usar", ["EV-RNT-169288", "EV-AB-REGRAS"],
  condicao="RNT 4 utentes vs Airbnb 3 hóspedes.")
A("AF-05", "ESP-VARANDA", "Varanda privativa, de uso exclusivo, com spa de hidromassagem, mesa, cadeiras, espreguiçadeiras e guarda-sol.", "facto", "inventario", "casa", "confirmado", "afirmar",
  ["EV-AB-DESC", "EV-AB-FOTOS", "EV-REV-SPA-OK"])
A("AF-06", "ESP-VARANDA", "O spa é aquecido / está sempre pronto e a funcionar.", "promessa_subjetiva", "geral", "casa", "conflitante", "nao_usar",
  ["EV-AB-DESC", "EV-REV-SPA-PROB"], condicao="6 reviews de set 2025 a out 2026 com spa sujo, frio, com cloro ou avariado (uma com reembolso parcial).")
A("AF-06B", "ESP-VARANDA", "O spa é um jacuzzi embutido/de alvenaria.", "inferencia", "inventario", "casa", "conflitante", "nao_usar", ["EV-AB-FOTOS"],
  condicao="As fotos mostram um spa redondo, escuro, aparentemente insuflável: não o descrever como embutido.")
A("AF-07", "ESP-VARANDA", "Duche exterior com água quente na varanda.", "facto", "inventario", "casa", "confirmado", "afirmar", ["EV-AB-DESC", "EV-AB-COMOD", "EV-REV-SPA-OK"])
A("AF-08", "CASA-1", "Todo o espaço, a varanda e o spa são exclusivos dos hóspedes; entrada privada.", "facto", "politica", "casa", "confirmado", "afirmar", ["EV-AB-DESC", "EV-REV-PRIV"])
A("AF-09", "CASA-1", "Estacionamento gratuito em frente ao portão.", "facto", "inventario", "casa", "confirmado", "afirmar", ["EV-AB-DESC", "EV-AB-FOTOS"])
A("AF-10", "CASA-1", "Check-in autónomo com cofre de chaves; check-in a partir das 14:00, check-out até às 11:00.", "facto", "politica", "casa", "confirmado", "afirmar_com_condicao",
  ["EV-AB-REGRAS"], ambito={"fonte": "anúncio do Airbnb", "data": "2026-10-20"}, condicao="Confirmar horários com o dono antes de publicar.")
A("AF-11", "ESP-OPEN", "Cozinha equipada: frigorífico com congelador, micro-ondas, chaleira, torradeira, tachos e panelas, loiça e talheres; mesa de refeições.", "facto", "inventario", "casa", "confirmado", "afirmar",
  ["EV-AB-COMOD", "EV-AB-FOTOS"])
A("AF-12", "CASA-1", "Ar condicionado, Wi-Fi e TV com Netflix e Disney+.", "facto", "inventario", "casa", "confirmado", "afirmar", ["EV-AB-COMOD", "EV-AB-DESC"])
A("AF-13N", "CASA-1", "Máquina de lavar roupa, aquecimento, detetor de fumo ou de monóxido de carbono.", "facto", "inventario", "casa", "confirmado", "nao_usar", ["EV-AB-COMOD"],
  condicao="Indisponíveis no Airbnb: não os prometer.")
A("AF-14", "ESP-OPEN", "Estores blackout / quarto escuro de manhã.", "facto", "inventario", "casa", "conflitante", "nao_usar", ["EV-AB-COMOD", "EV-REV-CORT", "EV-REV-LIGIA"],
  condicao="Anúncio e Lígia (set 2026) dizem que há; 3 reviews (set 2025 a jan 2026) dizem que faltam. Confirmar com o dono.")
A("AF-15", "CASA-1", "A poucos minutos de carro do centro de Lamego (Sé de Lamego a cerca de 2,9 km, 4 min de carro).", "facto", "geral", "terceiro", "confirmado", "afirmar_com_condicao",
  ["EV-OSRM", "EV-AB-DESC", "EV-REV-APE"], condicao="Sempre «de carro» e «cerca de»; nunca a pé.")
A("AF-15N", "CASA-1", "A 3 minutos da Câmara / a 5 minutos do centro, sem dizer que é de carro; dá para ir a pé.", "facto", "geral", "casa", "conflitante", "nao_usar", ["EV-AB-DESC", "EV-REV-APE"])
A("AF-16", "ESP-VARANDA", "Da varanda e das janelas vê-se o vale e as montanhas.", "facto", "geral", "casa", "confirmado", "afirmar_com_condicao", ["EV-AB-FOTOS", "EV-REV-VISTA"],
  condicao="Não prometer vista «sem nada à volta» nem silêncio: há casas vizinhas e uma review fala de obras à vista (set 2025).")
A("AF-17", "CANAL-AIRBNB", "Nota 4,79 em 5 no Airbnb, com 29 avaliações.", "metrica", "avaliacao", "plataforma", "confirmado", "afirmar_com_condicao", ["EV-AB-NOTA"],
  ambito={"fonte": "Airbnb", "data": "2026-10-20", "reviews": 29}, condicao="Com a data; rever antes de publicar. Reviews com pouco peso no site (pedido do dono).")
A("AF-18", "CANAL-AIRBNB", "Superhost.", "metrica", "avaliacao", "hospede", "desconhecido", "nao_usar", ["EV-REV-UMA"], condicao="Só uma review (set 2025) o diz.")
A("AF-19", "CASA-1", "Um dos poucos espaços na região com banheira de hidromassagem.", "promessa_subjetiva", "geral", "plataforma", "desconhecido", "nao_usar", ["EV-AB-PLAT"])
A("AF-20", "CASA-1", "Registo de Alojamento Local n.º 169288/AL.", "facto", "geral", "registo_publico", "confirmado", "afirmar_com_condicao", ["EV-RNT-169288", "EV-AB-REG"],
  condicao="Só depois de o dono confirmar: o anúncio do Airbnb mostra 169351/AL, que no RNT é outro AL (Almada).")
A("AF-20N", "CASA-1", "Registo 169351/AL.", "facto", "geral", "casa", "conflitante", "nao_usar", ["EV-AB-REG", "EV-RNT-169351"])
A("AF-21", "CASA-1", "Fica em Lamego, numa quinta familiar, a norte do centro (Rio de Asnos, freguesia de Ferreiros de Avões).", "facto", "geral", "registo_publico", "confirmado", "afirmar_com_condicao",
  ["EV-RNT-169288", "EV-GMAPS", "EV-AB-DESC"], condicao="«Lamego» e «quinta familiar» podem dizer-se já; o lugar e a freguesia só com o dono.")
A("AF-21N", "CASA-1", "Morada completa com código postal.", "facto", "contacto", "registo_publico", "conflitante", "nao_usar", ["EV-RNT-169288", "EV-GMAPS"],
  condicao="5100-513 (RNT) vs 5100-062 (Google).")
A("AF-22", "CASA-1", "Recebem a Ana e o Júlio, da família da quinta.", "facto", "geral", "plataforma", "confirmado", "afirmar_com_condicao", ["EV-AB-HOST", "EV-REV-HOST", "EV-RNT-169288"],
  condicao="Confirmar com o dono como querem aparecer (o contacto do Diogo é o Mário) e o parentesco; nada de fotos dos anfitriões (não há).")
A("AF-23", "CASA-1", "Cabaz de boas-vindas à chegada.", "facto", "geral", "hospede", "desconhecido", "nao_usar", ["EV-REV-UMA"], condicao="Uma menção (out 2026).")
A("AF-24", "CASA-1", "Telefone 965 741 870 e email lusitanoquinta@gmail.com.", "facto", "contacto", "casa", "confirmado", "afirmar_com_condicao", ["EV-GMAPS", "EV-WIX-INICIO", "EV-FB"],
  condicao="Confirmar com o dono que são os contactos para reservas da casa (o email é do projeto).")
A("AF-25", "CANAL-AIRBNB", "Reserva no Airbnb.", "facto", "contacto", "casa", "confirmado", "afirmar", ["EV-AB-DESC"])
A("AF-26", "CASA-1", "O nome «Dream Valley».", "facto", "geral", "casa", "desconhecido", "nao_usar", ["EV-GMAPS"], condicao="Só aparece no Google.")
A("AF-27", "CASA-1", "A casa chama-se «A Família na Quinta».", "facto", "geral", "registo_publico", "confirmado", "afirmar", ["EV-RNT-169288", "EV-GMAPS"])
A("AF-28", "ESP-WC", "Casa de banho sem humidade / quente.", "promessa_subjetiva", "geral", "hospede", "conflitante", "nao_usar", ["EV-REV-HUMID"],
  condicao="4 reviews (jan a mai 2026) falam de humidade ou mofo.")
A("AF-29", "CASA-1", "Silêncio absoluto / sem ruído.", "promessa_subjetiva", "geral", "hospede", "conflitante", "nao_usar", ["EV-REV-RUIDO", "EV-REV-PRIV"])

# ---------------- afirmações: o projeto ----------------
A("AF-P01", "ESP-QUINTA", "A casa e o projeto «A Família na Quinta» são da mesma família e têm o mesmo nome: a casa está registada como CASA «A FAMILIA NA QUINTA» e a ficha Google da casa leva ao site do projeto.", "facto", "geral", "registo_publico", "confirmado", "afirmar",
  ["EV-RNT-169288", "EV-GMAPS", "EV-WIX-INICIO", "EV-DONO"])
A("AF-P02", "ESP-QUINTA", "Na quinta onde fica a casa vivem animais do projeto.", "facto", "geral", "hospede", "confirmado", "afirmar_com_condicao", ["EV-REV-LIGIA", "EV-DONO", "EV-AB-DESC"],
  condicao="Sem dizer quantos, quais, onde ficam em relação à casa, nem que se veem da varanda; confirmar com o dono antes do site definitivo (prova de hóspede: uma menção, set 2026).")
A("AF-P03", "ESP-QUINTA", "O projeto acolhe animais de quinta resgatados da exploração, de maus tratos e da morte, e dá-lhes um lar para a vida inteira.", "facto", "geral", "casa", "confirmado", "afirmar_com_condicao",
  ["EV-WIX-INICIO", "EV-WIX-APAD", "EV-FB"], condicao="Nas palavras do projeto, sem números de animais nem de resgates; o Facebook (bio atual) repete-o.")
A("AF-P04", "ESP-QUINTA", "O objetivo é construir um santuário animal auto-sustentável, que não viva só de donativos.", "facto", "geral", "casa", "confirmado", "afirmar_com_condicao", ["EV-WIX-PROJETO"],
  condicao="Como objetivo em construção («Precisamos do Teu Apoio Para Construirmos o Nosso Santuário»), nunca como santuário pronto ou certificado.")
A("AF-P05", "ESP-QUINTA", "«temos como foco central o acolhimento e não o resgate»", "promessa_subjetiva", "geral", "casa", "confirmado", "citar", ["EV-WIX-PROJETO"])
A("AF-P06", "ESP-QUINTA", "Os animais são de quinta: cabras, ovelhas, porcos, coelhos, patos, póneis, burros (e um canário).", "facto", "geral", "casa", "confirmado", "afirmar_com_condicao",
  ["EV-FOTOS-CONCEITO", "EV-WIX-GALERIA"], atualidade="fotos de 2021", condicao="Espécies em geral, sem números nem como inventário de hoje; confirmar a lista atual com o dono.")
A("AF-P07", "ESP-QUINTA", "Nomes dos animais (Kaio, Kiara, Nolan, Winnie, Timô e os outros da galeria de 2021).", "facto", "geral", "casa", "historico", "nao_usar", ["EV-WIX-GALERIA"],
  condicao="Galeria de 2021: o dono tem de dizer quais vivem hoje na quinta e com que foto.")
A("AF-P08", "ESP-QUINTA", "Histórias de animais (a Kiara e o Nolan resgatados, a Kiara a dar à luz; a ida à televisão).", "facto", "geral", "casa", "historico", "nao_usar", ["EV-WIX-HISTORIAS"])
A("AF-P09", "ESP-QUINTA", "Apadrinhamento de um animal por 15 € por ano.", "facto", "tarifa", "casa", "confirmado", "afirmar_com_condicao", ["EV-WIX-APAD"],
  ambito={"fonte": "site Wix do projeto", "publicado": "sem data (site de 2021)", "lido": "2026-10-20"}, condicao="Confirmar valor e se o apadrinhamento continua aberto antes de publicar.")
A("AF-P10", "ESP-QUINTA", "Quem apadrinha escolhe o animal, deixa o nome e a morada e recebe uma fotografia do afilhado com dedicatória de «A Família na Quinta».", "facto", "politica", "casa", "confirmado", "afirmar_com_condicao",
  ["EV-WIX-APAD", "EV-FOTOS-CONCEITO"], condicao="Confirmar com o dono que o processo é este hoje.")
A("AF-P11", "ESP-QUINTA", "IBAN do projeto.", "facto", "contacto", "casa", "confirmado", "nao_usar", ["EV-WIX-PEDIDOS"], condicao="Não replicar sem autorização do dono.")
A("AF-P12", "ESP-QUINTA", "Donativos por MB WAY para o 965 741 870.", "facto", "contacto", "casa", "confirmado", "afirmar_com_condicao", ["EV-WIX-PEDIDOS"],
  condicao="Só com autorização expressa do dono.")
A("AF-P13", "ESP-QUINTA", "Projetos por financiar: estábulo maior para cabras e ovelhas; coelheira.", "facto", "geral", "casa", "historico", "nao_usar", ["EV-WIX-PEDIDOS"],
  condicao="Podem já estar feitos.")
A("AF-P14", "ESP-QUINTA", "Loja de mascotes (peluches) do projeto.", "facto", "geral", "casa", "historico", "nao_usar", ["EV-WIX-HISTORIAS"])
A("AF-P15", "CANAL-FB", "Página no Facebook com cerca de 10 mil seguidores, onde partilham o dia a dia da quinta.", "metrica", "geral", "casa", "confirmado", "afirmar_com_condicao", ["EV-FB"],
  ambito={"fonte": "Facebook", "data": "2026-10-20"}, condicao="«cerca de 10 mil» com data; não dizer «todos os dias» (o último post visível é de agosto de 2025).")
A("AF-P16", "ESP-QUINTA", "Os hóspedes podem visitar, tocar ou alimentar os animais.", "facto", "geral", "casa", "desconhecido", "nao_usar", ["EV-REV-LIGIA"],
  condicao="Nenhuma fonte o diz. Por confirmar com o dono.")
A("AF-P17", "ESP-QUINTA", "Cada estadia na casa ajuda a sustentar os animais.", "inferencia", "geral", "casa", "desconhecido", "nao_usar", ["EV-WIX-PROJETO", "EV-DONO"],
  condicao="Plausível (santuário com «fonte sólida de rendimento»), mas ninguém o escreveu. É a ligação mais forte se o dono a confirmar.")
A("AF-P18", "ESP-QUINTA", "«Acolhemos animais de quinta necessitados de abrigo e amor e damos-lhes uma família e um lar para a vida inteira!»", "promessa_subjetiva", "geral", "casa", "confirmado", "citar",
  ["EV-WIX-INICIO", "EV-FB"])

# ---------------- testemunhos ----------------
A("AF-T01", "ESP-QUINTA", "Os animais da quinta foram uma surpresa boa à chegada; o projeto tem grande valor (Lígia).", "testemunho", "avaliacao", "hospede", "confirmado", "citar", ["EV-REV-LIGIA"])
A("AF-T02", "ESP-VARANDA", "A vista do vale, da varanda e das janelas.", "testemunho", "avaliacao", "hospede", "confirmado", "citar", ["EV-REV-VISTA"])
A("AF-T03", "CASA-1", "Mais bonita ao vivo do que nas fotos; paredes de pedra acolhedoras.", "testemunho", "avaliacao", "hospede", "confirmado", "citar", ["EV-REV-BELEZA"])
A("AF-T04", "CASA-1", "Sítio para desligar, a dois, com privacidade.", "testemunho", "avaliacao", "hospede", "confirmado", "citar", ["EV-REV-PRIV"])
A("AF-T05", "CASA-1", "Anfitriões atentos e rápidos a responder.", "testemunho", "avaliacao", "hospede", "confirmado", "citar", ["EV-REV-HOST"])
A("AF-T06", "ESP-VARANDA", "Uma noite sob as estrelas no spa.", "testemunho", "avaliacao", "hospede", "confirmado", "inspiracao_editorial", ["EV-REV-SPA-OK"],
  condicao="Tom apenas: não transformar em promessa de spa aquecido ou sempre pronto (AF-06).")

# ---------------- região ----------------
REG = [("SE", "se-de-lamego", "Sé de Lamego: catedral do séc. XII, com a torre românica e a fachada do início do séc. XVI; a cerca de 2,9 km (4 min de carro).",
        "«Monumento Nacional», horários, data de conclusão."),
       ("CASTELO", "castelo-de-lamego", "Castelo de Lamego: castelo medieval no ponto mais alto da cidade, com a torre de menagem ameada; a cerca de 2,1 km (4 min de carro).",
        "«Monumento Nacional» e data do decreto, data da Cisterna, altitude, horários e preços."),
       ("REMEDIOS", "santuario-dos-remedios", "Santuário de Nossa Senhora dos Remédios: barroco, primeira pedra em 1750, projeto atribuído a Nasoni, escadório começado em 1777, Pátio dos Reis com obelisco de cerca de 15 m, Imóvel de Interesse Público; a cerca de 4,2 km (8 min de carro).",
        "Número de degraus, horários, «de Nasoni» sem «atribuído», minutos a pé."),
       ("BALSEMAO", "capela-de-balsemao", "Capela de São Pedro de Balsemão: de origem alto-medieval, com três naves e o sarcófago do bispo D. Afonso Pires; a cerca de 6,5 km (12 min de carro).",
        "Data concreta (séc. VI, VII ou 588), «Monumento Nacional», horários."),
       ("MUSEU", "museu-do-douro", "Museu do Douro: museu da região do Douro em Peso da Régua, na Casa da Companhia, criado por lei em 1997; a cerca de 11,1 km (15 min de carro).",
        "Entrada gratuita aos sábados sem a condição de residente, data de inauguração, horários, preços."),
       ("PORTOREI", "porto-de-rei", "Parque Fluvial de Porto de Rei (Resende): praia fluvial no Douro com piscina, cais e parque de merendas, muito procurada no verão; a cerca de 14,8 km (23 min de carro).",
        "Horários, época balnear, «vigiada».")]
for sig, fid, pode, proib in REG:
    c.ev(f"EV-REG-{sig}", "terceiro", ["CASA-1"], f"nichos/alojamento/regiao/{fid}.md ; regiao/cache.md", atualidade="ficha «verificado: sim»; distância OSRM 2026-10-20")
    A(f"AF-REG-{sig}", "CASA-1", pode, "facto", "geral", "terceiro", "confirmado", "afirmar_com_condicao", [f"EV-REG-{sig}", "EV-OSRM"],
      condicao="Distância sempre com «cerca de» e «de carro»; foto só com o crédito do ativo.")
    A(f"AF-REG-{sig}-NAO", "CASA-1", "Não afirmar: " + proib, "facto", "geral", "terceiro", "desconhecido", "nao_usar", [f"EV-REG-{sig}"])

# ---------------- citações ----------------
c.citar("CIT-01", "A-004", "Os animais da quinta foram uma agradável surpresa à chegada", data="2026-09")
c.citar("CIT-02", "A-004", "É um projeto com grande valor, que merece o nosso apoio para que possa continuar e quem sabe, crescer.", data="2026-09")
c.citar("CIT-03", "A-004", "A Ana foi muito simpática e deu todas as indicações necessárias com clareza.", data="2026-09")
c.citar("CIT-04", "A-029", "Fotos não fazem justiça ao espaço... é ainda mais bonito.", data="2025-08")
c.citar("CIT-05", "A-021", "Uma bonita vista da varanda e das janelas no interior da casa.", data="2025-08")
c.citar("CIT-06", "A-028", "Adoramos estar na casinha ! Super acolhedora e com vista deslumbrante!", data="2025-08")
c.citar("CIT-07", "A-001", "Casa muito bem organizada um espaço muito bom para se afastar da cidade e poder relaxar.", data="2026-10")
c.citar("CIT-08", "A-009", "Um ótimo espaço, alojamento muito bem aproveitado e ideal para uma escapadinha em casal.", data="2026-02")
c.citar("CIT-09", "A-021", "Óptima comunicação e amabilidade da Ana e Júlio.", data="2025-08")
c.citar("CIT-10", "A-007", "Local com ótima estrutura e bem aconchegante, anfitriã muito atenciosa e responde prontamente.", data="2026-05")
c.citar("CIT-11", "A-006", "Espaço muito limpo, organizado e óptimo para descansar.", data="2026-06")
# tradução automática do Airbnb (original não capturado): ver DEC-5
c.citar("CIT-12", "A-019", "A vista era incrível, um dos melhores amanheceres!", data="2025-09")
c.citar("CIT-13", "A-015", "O espaço é lindo e adoro as paredes de pedra que o tornam muito acolhedor!", data="2025-10")
c.citar("CIT-14", "A-015", "Desfrutei de uma bela noite sob as estrelas na banheira de hidromassagem.", data="2025-10")
c.citar("CIT-15", "A-002", "A localização era perfeita para começarmos a nossa descoberta do Vale do Douro.", data="2026-10")

# ---------------- ativos ----------------
BASE = "Publicada pela casa (Airbnb) ou pelo projeto (site Wix); serve para a versão de demonstração: confirmar com o dono antes do site definitivo."
CONC = ["Foto do site do projeto (carregada em 2021): mostra animais da quinta nessa altura; não dizer que são os animais de hoje nem que estão junto da casa.",
        "Sem nomes nem histórias inventados; os nomes da galeria de 2021 só com o dono a confirmar."]
exc = {"exterior/airbnb-26.jpeg": {"restricoes": ["Quase igual a exterior/airbnb-03.jpeg: não usar as duas lado a lado."]},
       "exterior/airbnb-30.jpeg": {"restricoes": ["Mostra o spa: não legendar como «aquecido» nem «jacuzzi embutido» (AF-06, AF-06B)."]},
       "exterior/airbnb-03.jpeg": {"restricoes": ["Mostra o spa: não legendar como «aquecido» (AF-06)."]}}
fotos_md = (c.D / "marketing" / "fotos.md").read_text(encoding="utf-8")
import re
for p in re.findall(r"\| (conceito/[\w.]+) \|", fotos_md):
    exc[p] = {"restricoes": list(CONC)}
def mais(p, uso=None, r=None):
    if uso: exc[p]["uso"] = uso
    if r: exc[p]["restricoes"] = exc[p]["restricoes"] + r
P = "conceito/3c4517_"
for f in ["807d0bb71ed6491f936b8ef77d46104c.jpg", "f3fc53ceaa5a4091b3b3d87323d0ae47.jpg"]:
    mais(P + f, "restrito", ["Pessoa identificável: só com autorização dela, via o dono."])
mais(P + "86e283345d784f879774e038e5477336.jpg", "nao_usar", ["Pessoa identificável com um cão doméstico: não mostra a quinta nem os animais do projeto."])
mais(P + "93a7092c4b884e17aa75547d8e5324f1.jpg", "restrito", ["Só pés de pessoas com galochas: não mostra animais."])
mais(P + "89d2ef8549aa435680f1e3b45d39fc54.jpg", "restrito", ["Peluches da loja do projeto (2021, histórico): não são animais; a loja pode já não existir."])
for f in ["1869fe1d64294cc68267dea159c909c2.jpg", "452b02bcafa649e5befc386a78bb0a5e.jpg"]:
    mais(P + f, "restrito", ["Postal/cartão com texto escrito à mão na imagem: só para ilustrar o apadrinhamento (AF-P10), sem texto por cima e sem recorte do texto."])
mais(P + "8d6b04f9d0234281b5811c4991488713.png", "restrito", ["Quase igual a conceito/3c4517_8d2ae3b9782d460ca916af1b51e9d5f3.jpg: usar só uma."])
for f in ["6fe4de7dc15c4263a66b0e0e96bf52d6.jpg", "bfb73ba7d78a473b988b0ae496d1a240.jpg", "d3dabda8556d43d884af52869e8681c4.jpg"]:
    mais(P + f, None, ["Decoração de Natal: só fora de contexto sazonal se o desenho o aceitar."])
for f in ["2513edbc025646eb8a03b929c54eeccf.jpg"]:
    mais(P + f, "restrito", ["Colagem de 3 fotos com rosto parcial de pessoa: evitar como foto principal."])
exc["marca/37e0cab3e3eab9253f214920616b7ca2.jpg"] = {"uso": "nao_usar", "restricoes": ["Imagem de banco: não é da quinta nem da casa."]}
exc["marca/3c4517_9e48c6439e7c45d49f736d80e924189e.png"] = {"uso": "nao_usar", "restricoes": ["Imagem de banco: não é da quinta nem da casa."]}
exc["marca/e316f544f9094143b9eac01f1f19e697.png"] = {"uso": "nao_usar", "restricoes": ["Ícone do Facebook (marca de terceiros): usar o ícone do próprio sistema do site, não este."]}
for f in ["marca/035244_00464e7939644b71b41d864548ca468f.png", "marca/035244_652d12a4071147d4a2fff8f8d2ff5db1.png"]:
    exc[f] = {"uso": "nao_usar", "restricoes": ["Ícone genérico do Wix (200×200), sem valor de marca."]}
exc["marca/3c4517_0568cfa1f935410a97ae3ef438071335.png"] = {"uso": "restrito", "restricoes": ["Logótipo do projeto: usar só com aval do dono, sem alterar."]}
exc["marca/3c4517_46b128c912634123a2ae85ca67550eb7.jpg"] = {"uso": "restrito", "restricoes": ["Banner com o título escrito na imagem e colagem de animais: não recortar o texto, não pôr texto por cima; preferir as fotos individuais."]}
c.fotos_da_casa(BASE, excecoes=exc)
# entidade confirmada só nas fotos da casa (galeria do anúncio confirmado pelo Diogo)
for a in c.dados["ativos"]:
    if a["caminho"].startswith(("marketing/fotos/interior/", "marketing/fotos/exterior/")):
        a["entidade_confirmada"] = "CASA-1"

TER = [("regiao/se-de-lamego.jpg", "Sé de Lamego", "Ricardo Saraiva de Almeida", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0",
        "https://commons.wikimedia.org/wiki/File:S%C3%A9_de_Lamego_1_-_2017-05-04.jpg", "2026-10-16 (Casa da Real Companhia)", []),
       ("regiao/santuario-dos-remedios.jpg", "Santuário de Nossa Senhora dos Remédios: vista geral", "Concierge.2C", "CC BY-SA 3.0", "https://creativecommons.org/licenses/by-sa/3.0",
        "https://commons.wikimedia.org/wiki/File:Lamego_-_Santu%C3%A1rio_de_Nossa_Senhora_dos_Rem%C3%A9dios_-_Vista_geral_(1).jpg", "2026-10-16 (Casa da Real Companhia)", []),
       ("regiao/capela-de-balsemao.jpg", "Capela de São Pedro de Balsemão", "Pedro Nuno Caetano", "CC BY 2.0", "https://creativecommons.org/licenses/by/2.0",
        "https://commons.wikimedia.org/wiki/File:S._Pedro_de_Balsem%C3%A3o_I.jpg", "2026-10-16 (Casa da Real Companhia)", []),
       ("regiao/museu-do-douro.jpg", "Museu do Douro, Peso da Régua", "FWinkel", "CC BY-SA 4.0", "https://creativecommons.org/licenses/by-sa/4.0",
        "https://commons.wikimedia.org/wiki/File:Museu_do_Douro_in_Peso_da_R%C3%A9gua.jpg", "2026-10-16 (Casa da Real Companhia)", []),
       ("regiao/porto-de-rei.jpg", "Parque Fluvial de Porto de Rei", "Vitor Oliveira from Torres Vedras, PORTUGAL", "CC BY-SA 2.0", "https://creativecommons.org/licenses/by-sa/2.0",
        "https://commons.wikimedia.org/wiki/File:Praia_Fluvial_de_Porto_de_Rei_-_Portugal_(29051552232).jpg", "2026-10-16 (Casa da Real Companhia)",
        ["Assinatura do autor («Portuguese_eyes / Vitor Oliveira») no canto inferior esquerdo: manter visível."])]
for cam, ass, aut, lic, ul, url, quando, extra in TER:
    c.foto_terceiro(cam, ass, aut, lic, ul, url, extra=extra)
    a = c.dados["ativos"][-1]
    a["restricoes"] = [r.replace(f"Licença conferida no Commons a {HOJE}.", f"Licença conferida no Commons a {quando}; ficha da cache «verificado: sim», não reaberta.") for r in a["restricoes"]]

# ---------------- decisões ----------------
c.decisao("DEC-1", "informativo",
          "Pedido do dono (via Diogo, 2026-10-20): site metade casa, metade conceito (Quinta Lusitano / apadrinhamento), numa só história que liga as duas; a casa apresentada de forma objetiva; do conceito, o principal; reviews com pouco peso; storytelling cuidado. O ponto de ligação provado está em AF-P01, AF-P02 e CIT-01/CIT-02.",
          ["AF-P01", "AF-P02", "AF-P03", "AF-P04", "AF-T01", "AF-17"], fonte="Diogo, depois da chamada com o dono")
c.decisao("DEC-2", "bloquear_uso", "Imagens de banco e ícones do site Wix não entram no site novo.",
          ["ATIVO-marca_37e0cab3e3eab9253f214920616b7ca2", "ATIVO-marca_3c4517_9e48c6439e7c45d49f736d80e924189e", "ATIVO-marca_e316f544f9094143b9eac01f1f19e697",
           "ATIVO-marca_035244_00464e7939644b71b41d864548ca468f", "ATIVO-marca_035244_652d12a4071147d4a2fff8f8d2ff5db1"])
c.decisao("DEC-3", "bloquear_uso", "O IBAN do projeto não se replica no site novo sem autorização do dono.", ["AF-P11"])
c.decisao("DEC-4", "informativo",
          "Identidade do anúncio do Airbnb confirmada pelo Diogo. Para os factos do site vale o anúncio; nenhum número de registo ou capacidade em conflito se afirma sem condição. O RNT confirma 169288/AL como esta casa; o 169351/AL do anúncio é de outro AL em Almada: o Mário deve corrigir o anúncio.",
          ["AF-04", "AF-04N", "AF-20", "AF-20N"], fonte="Diogo; RNT lido pelo juízo")
c.decisao("DEC-5", "informativo",
          "CIT-12 a CIT-15 são tradução automática do Airbnb (original não capturado): no site, identificar como tradução ou ir buscar o original antes de usar. Preferir CIT-01 a CIT-11, escritas em português.",
          ["CIT-12", "CIT-13", "CIT-14", "CIT-15"])
c.decisao("DEC-6", "bloquear_uso", "Nomes e histórias dos animais (galeria e notícias do site, 2021) ficam fora até o dono dizer quais vivem hoje na quinta.",
          ["AF-P07", "AF-P08"])

# ---------------- cobertura ----------------
c.dados["cobertura"] = []
c.cobertura("COB-01", "Airbnb: anúncio e comodidades", "textos", "completo_no_universo_observado", "página + modal de 31 comodidades", 31, 31, "«Mostrar original» das traduções não aberto")
c.cobertura("COB-02", "Airbnb: reviews", "reviews", "completo_no_universo_observado", "modal de 29 avaliações", 29, 29, "15 em tradução automática do Airbnb, sem original")
c.cobertura("COB-03", "Airbnb: fotos", "fotos", "completo_no_universo_observado", "modal Mostrar todas as fotos", 38, 38, "o Airbnb não indica total; guardadas a largura 1920")
c.cobertura("COB-04", "Site Wix do projeto (4 páginas do menu)", "textos", "parcial", "Início, Apadrinhamento, O Nosso Projeto, Galeria", 4, 4,
            "Páginas fora do menu (A Nossa História, Momentos Importantes, Projeto Baby Miau, Contribuir, MERCH, Blog) não abertas; vídeos e formulário de apadrinhamento não explorados")
c.cobertura("COB-05", "Site Wix: fotos", "fotos", "completo_no_universo_observado", "imagens das 4 páginas do menu", 53, 53, "fotos de 2021; nomes só na galeria de apadrinhamento")
c.cobertura("COB-06", "Facebook A Família na Quinta", "textos", "bloqueado", "vista pública sem sessão", 1, 1, "só bio, seguidores e um post truncado (2025-08-18); posts e álbuns exigem sessão")
c.cobertura("COB-07", "Instagram", "canais", "nao_encontrado", "pesquisa web", 0, 0, "nenhum resultado")
c.cobertura("COB-08", "Google Maps", "reviews", "parcial", "ficha + 3 críticas", 3, 3, "2 só com estrelas; original russo não aberto; fotos não percorridas")
c.cobertura("COB-09", "RNT (169288 e 169351)", "compliance", "completo_no_universo_observado", "RNAL.aspx?nr=", 2, 2, "seguro sem renovação visível")
c.cobertura("COB-10", "Booking", "canais", "nao_aplicavel", None, None, None, "não fornecido nem procurado nesta corrida")
c.cobertura("COB-11", "Região (cache)", "factos", "completo_no_universo_observado", "regiao.py usar, a partir do plus code", 6, 6, "Castelo de Lamego sem foto")

c.gravar(prontidao="com_limitacoes",
         notas="Casa confirmada pelo Diogo (Airbnb 1452014258760429542) e pelo RNT (169288/AL). O site junta casa e projeto dos animais: a ligação está provada (RNT, Google, Lígia, dono), mas a convivência dos hóspedes com os animais, o papel da casa no sustento do santuário, os animais de hoje e o valor do apadrinhamento estão por confirmar com o dono. Registo e capacidade em conflito no anúncio.")
