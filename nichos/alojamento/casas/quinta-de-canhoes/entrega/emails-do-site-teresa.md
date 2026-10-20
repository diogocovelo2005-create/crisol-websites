# Os emails das reservas do site

O formulário de reserva do site envia emails aos hóspedes pelo seu Gmail,
automaticamente: quando faz um pedido, quando confirma, quando propõe outras
datas e quando recebe o sinal. Os emails que o site envia ficam na sua pasta
«Enviados», e as respostas dos hóspedes chegam à sua caixa de entrada, como
qualquer outro email.

Para o site poder enviar pelo seu Gmail, o Google pede uma **palavra-passe de
aplicação**: uma senha só para o site, diferente da sua palavra-passe normal.

> **Importante:** se um dia mudar a palavra-passe da sua conta Google, a senha
> do site deixa de funcionar e os emails das reservas param. Nesse caso, repita
> os passos 2 e 3 abaixo (cerca de 5 minutos).

---

## Passo 1 · Ligar a verificação em dois passos (só uma vez)

1. Abra **myaccount.google.com/security** com a sua conta.
2. Em «Como inicia sessão no Google», carregue em **Verificação em dois passos**.
3. Siga as instruções: o Google pede o seu número de telemóvel e envia um código
   por SMS.

Se já estiver ligada, passe ao passo 2.

## Passo 2 · Criar a senha para o site

1. Abra **myaccount.google.com/apppasswords**.
2. Em «Nome da app», escreva **Site Quinta de Canhões** e carregue em **Criar**.
3. Aparece uma senha de 16 letras num quadro amarelo. **Não feche essa janela**:
   vai precisar dela no passo seguinte. O Google só a mostra uma vez.

Não envie esta senha a ninguém por email nem por WhatsApp.

## Passo 3 · Guardar a senha no site (Netlify)

1. Noutra janela, entre em **app.netlify.com** e abra o site da Quinta de
   Canhões.
2. No menu da esquerda: **Site configuration** → **Environment variables**.
3. Carregue em **GMAIL_PASSE_APP** → **Options** → **Edit**.
4. Apague o valor antigo, cole a senha de 16 letras e carregue em **Save**.
5. Para o site começar a usar a senha nova: no menu da esquerda, **Deploys** →
   **Trigger deploy** → **Deploy site**. Espere 2 a 3 minutos até aparecer
   «Published».

## Passo 4 · Experimentar

Abra o site, vá a **Reservar** e faça um pedido com o seu próprio email. Deve
receber o email «Novo pedido» em poucos minutos. Se não chegar, veja na pasta
de spam e, se mesmo assim não estiver lá, repita o passo 2 e o passo 3.
