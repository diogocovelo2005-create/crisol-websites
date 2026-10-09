# Leads AL

Encontra alojamentos locais sem site (ou com site antigo) e organiza as cold calls.

São duas peças nesta pasta:
- **A aplicação Leads AL:** onde vês as leads, ligas, marcas estados, estrelas e notas, e vês as métricas.
- **A skill `al-leads`:** é o Claude que vai buscar os alojamentos de um concelho e os verifica um a um.

## O que precisas
- Windows 10 ou 11.
- [VS Code](https://code.visualstudio.com) com a extensão **Claude Code** e uma conta Claude.
- O Node.js. Se não o tiveres, o instalador trata disso.

## Instalar (uma vez)
1. Extrai o zip para uma pasta tua. O ideal é ao lado das pastas dos teus sites (por exemplo `Desktop\SITES\Leads_AL`), porque a aplicação vai buscar lá as fotos das versões base.
2. Faz duplo clique em **`instalar.bat`**. Se o Windows avisar "O Windows protegeu o seu PC", carrega em **Mais informações → Executar mesmo assim**.
3. A aplicação abre sozinha. Para a pores na barra de tarefas: tecla **Windows**, escreve **Leads AL**, botão direito, **Afixar na barra de tarefas**.

## Atualizar (se já tens uma versão antiga)
1. Fecha a aplicação Leads AL.
2. Extrai o zip novo e copia o que está dentro da pasta `Leads_AL` para a tua pasta antiga. Quando o Windows perguntar, escolhe **Substituir os ficheiros no destino**.
3. Abre a aplicação como sempre. As tuas leads, estados e notas ficam como estavam, porque o zip não traz a pasta `data`.

## Ir buscar leads
1. No VS Code: **File → Open Folder** e escolhe esta pasta.
2. Abre o Claude Code e escreve, por exemplo:
   > faz o concelho de Cantanhede

   Também funciona "corre o distrito de Aveiro" ou "vê se a Casa X tem site".
3. No fim, carrega em **F5** na aplicação para veres as leads novas.

Um concelho pequeno demora alguns minutos; um grande (Coimbra, Aveiro) pode demorar bastante. O Claude vai gravando à medida que avança, por isso não se perde nada se parar a meio.

## Como funciona o funil
- **Booking abaixo de 7** (com 10 ou mais avaliações): sai.
- **Site moderno:** sai.
- **Site em dúvida:** vai para a página **Dúvida** e decides tu com um clique.
- **Sem site ou site antigo:** vai para **Ligar**.

Se o Claude errar (por exemplo, disse que não tinha site mas tinha), marca a lead como **Falha Claude** e escolhe o tipo de falha. Da próxima vez, o Claude lê essas falhas antes de começar.

## Combinar com a equipa
Cada pessoa tem os seus dados no seu PC. **Dividam os concelhos entre vocês** para não ligarem duas vezes ao mesmo alojamento.

## Privacidade
A pasta `data` tem telefones e nomes de pessoas reais. Não a partilhes nem a envies a ninguém.

## Se alguma coisa não abrir
Faz duplo clique em **`Abrir dashboard.bat`**. Abre uma janela preta que mostra o erro.
