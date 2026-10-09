# Rubrica — agregadores, idade real e concorrência local

Ler no §6, quando se está a resolver o site de uma casa.

O motor já mediu os defeitos técnicos e já deu a nota. Este ficheiro é para as
três coisas que o motor não sabe: o que conta como site, que idade o site tem
mesmo, e quem é que já é dono do cliente.

---

## 1 — Lista negra de agregadores

Um resultado de pesquisa num destes domínios **não é site próprio**. Se for o
único resultado, a casa conta como **sem site** e a nota sobe a 5.

Isto é a única correção permitida à nota, e existe porque o motor não conhece
agregadores de hotelaria. Ele reconhece o Booking, o Airbnb, o Tripadvisor e as
redes sociais, mas não os que estão nesta lista.

### Domínios verificados em campo

`hoteisweb.com` · `hotelscoimbra.com` · `centro-portugal-hotels.com` ·
`costaprata.net` · `hotels-pt.net` · `reserving.com` · `housity.net` ·
`planetofhotels.com` · `myboutiquehotel.com` · `guestreservations.com` ·
`bedandbreakfast.eu` · `a-hotel.com` · `booked.net` · `hotelmix.co.uk` ·
`guidetoeurope.com` · `chambres-hotes.fr` · `destinia.com` · `amimir.com` ·
`portugal-alojamento.pt` · `alojamento-portugal.pt` · `accoportugal.pt` ·
`bandbwww.com` · `res-menu.net` · `vivehotels.com`

### OTAs e diretórios

Óbvios, e o motor já os apanha, mas contam na mesma como sem site:
booking.com · airbnb · expedia · hotels.com · agoda.com · tripadvisor ·
trivago · hostelworld.com · vrbo.com · facebook.com · instagram.com ·
google.com/travel

### Reconhecer um agregador novo

Cinco sinais, dois bastam:

1. o mesmo layout aparece para casas diferentes em pesquisas diferentes
2. botão de reservar que sai para o Booking com parâmetro de afiliado, `aid=`
   ou `label=`
3. texto descritivo genérico, traduzido por máquina
4. sem contactos diretos da casa, só formulário do próprio agregador
5. domínio genérico-geográfico, do tipo `hoteis-<região>.com`

Sempre que apareça um novo, acrescenta-o aqui.

### Exceção

Uma página num portal **oficial de turismo**, do Turismo de Portugal, de uma
câmara ou de uma entidade regional, também não é site próprio. Mas é sinal de
vida institucional e vale a pena no hook: está no portal do município e não tem
site.

---

## 2 — Idade real do site

O rodapé mente, porque metade destes sites gera o ano por código e diz sempre o
ano corrente. A idade lê-se na construção.

| Marcador no código ou no endereço | O que indica |
|---|---|
| `.aspx` | ASP.NET WebForms, tipicamente 2008 a 2014 |
| `index.php?option=com_*` | Joomla de 2010 a 2012 |
| `index.php/pt` | Joomla |
| `wp-content` com WordPress 5.x | parado há anos |
| WooCommerce 5.x | idem |
| Slider Revolution 5.x | tema comprado entre 2015 e 2018 |
| só HTTP, sem HTTPS | abandonado, ninguém migrou |
| `og:site_name` igual a "My Site" | Wix por configurar |
| endereços com `cópia-<nome>` ou `copy-of-<nome>` | páginas duplicadas deixadas pelo editor |
| `email@domain.com` ou `+123 123 1234` | contactos em placeholder, template nunca preenchido |

### Marcadores de site recente, que mandam descartar

- Elementor em versões 3.x recentes
- WordPress 6.x com tema comprado nos últimos dois anos
- Amenitiz, SiteMinder, Mews, Cloudbeds: plataformas de hotelaria com site
  incluído, e o dono já paga a alguém
- site bilingue completo e coerente
- motor de reservas próprio integrado, não apenas um link para o Booking
- fotografia profissional recente e consistente em todas as páginas

### Plataformas gratuitas

Subdomínio gratuito conta como sem site na prática:
`*.wixsite.com` · `*.wordpress.com` · `*.webnode.pt` · `*.webnode.com` ·
`*.site123.me` · `*.my-free.website` · `*.weebly.com` · `*.jimdosite.com` ·
`*.blogspot.com` · `*.canva.site` · `*.godaddysites.com` · `*.business.site`

O último, o Google Business Sites, foi descontinuado. É gancho de urgência.

---

## 3 — Concorrência local

Consultar **antes** de trabalhar uma casa nova. Cliente de um estúdio local é
descartado, mesmo que o site esteja mau: a obra já está adjudicada.

### Distrito de Coimbra

| Estúdio | Clientes conhecidos no nicho |
|---|---|
| **Rui Veríssimo Design**, Coimbra, ruiverissimodesign.com, 239 438 458 | Vila Julieta · Quinta da Paz · Terraços do Rio · Quinta da Aldeia Nova, Arganil · Quinta da Fonte do Ão |
| **Goweb Agency** | Arouce Hostel, Lousã |
| **Mondego Web** | Sete Quintas, Miranda do Corvo |
| **DesignCorner.pt** | Pensão Santa Cruz, Coimbra |
| **Empty Box**, emptybox.eu | Despertar Saudade, Coimbra |
| **avaweb.es** | Coimbra City Charm |
| **Filprosoft** | Quinta de Vale Escuro |

### Numa região nova

A tabela constrói-se do zero, e constrói-se sozinha se o hábito se mantiver:
sempre que um site verificado tiver assinatura de estúdio no rodapé, regista o
estúdio e o cliente aqui. Ao fim de vinte casas o mapa da concorrência da
região está feito, e o lote seguinte no concelho ao lado começa com ele pronto.
