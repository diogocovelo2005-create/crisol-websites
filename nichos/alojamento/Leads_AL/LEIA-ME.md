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

## Follow-ups no Google Calendar (opcional, uma vez)
A página **Follow-up** pode pôr cada follow-up no teu Google Calendar, num calendário só para isto chamado **Leads AL**. Cada follow-up é um bloco de 15 minutos: o primeiro do dia às 9:00, o seguinte às 9:15, e assim por diante, pela ordem da página (enviar base, bases enviadas, propostas). Cada bloco tem aviso no telemóvel à hora certa, e o primeiro do dia também avisa uma hora antes. Quando adias, mudas a data ou a lead fecha, o evento muda ou desaparece sozinho. Os atrasados passam para hoje.

1. Vai a [console.cloud.google.com](https://console.cloud.google.com) com a tua conta Google e cria um projeto (ou usa um que já tenhas).
2. Em **APIs e serviços → Biblioteca**, ativa a **Google Calendar API**.
3. Em **Google Auth Platform**, carrega em **Começar**: o nome da app, o teu email, público **Externo**. Cria.
4. Em **Público-alvo → Usuários de teste → Adicionar usuários**, põe o teu email e guarda.
5. Em **Clientes → Criar cliente**, escolhe o tipo **App para computador**, cria e carrega em **Transferir JSON**.
6. Muda o nome do ficheiro para `google-credentials.json` e põe-no na pasta `data` desta aplicação.
7. No dashboard, abre **Follow-up → Ligar Google Calendar** e escolhe a tua conta. O Google avisa que "não verificou esta app": é normal, porque a app é tua. Carrega em **Continuar**.

A app só consegue mexer no calendário Leads AL, que é ela própria que cria. Não vê nem altera os teus outros calendários. Enquanto a app estiver "Em teste" na Google Cloud, o Google pede para voltares a ligar de 7 em 7 dias. O dashboard mostra uma faixa vermelha com o botão **Voltar a ligar**.

## Combinar com a equipa
Cada pessoa tem os seus dados no seu PC. **Dividam os concelhos entre vocês** para não ligarem duas vezes ao mesmo alojamento.

## Privacidade
A pasta `data` tem telefones e nomes de pessoas reais. Não a partilhes nem a envies a ninguém.

## Se alguma coisa não abrir
Faz duplo clique em **`Abrir dashboard.bat`**. Abre uma janela preta que mostra o erro.
