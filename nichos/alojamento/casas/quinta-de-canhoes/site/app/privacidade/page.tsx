import type { Metadata } from "next";
import { metadados } from "@/lib/seo";
import type { ReactNode } from "react";
import { CabecalhoPagina } from "@/components/CabecalhoPagina";
import { contactos } from "@/lib/contactos";

export const metadata: Metadata = metadados({
  titulo: "Política de privacidade",
  descricao: "Como a Quinta de Canhões trata os dados dos pedidos de reserva: que dados, para quê, onde ficam, durante quanto tempo e os seus direitos.",
  caminho: "/privacidade",
});

const ATUALIZADA = "21 de outubro de 2026";

/* A política de privacidade, curta e clara. Indexável. */
export default function PaginaPrivacidade() {
  return (
    <>
      <CabecalhoPagina
        etiqueta="Privacidade"
        titulo="Política de privacidade"
        entrada="Os dados que nos dá servem para responder ao seu pedido e tratar da sua estadia. Mais nada."
        foto="casa-fachada"
        alt="A fachada de granito da Quinta de Canhões, entre agapantos e árvores"
      />

      <section className="bg-cal py-16 md:py-24">
        <div className="mx-auto max-w-[46rem] px-6 text-[1.05rem] leading-relaxed text-xisto-suave md:px-10">
          <p className="etiqueta text-xisto-suave">Última atualização: {ATUALIZADA}</p>

          <Bloco titulo="Quem é o responsável">
            <p>
              Quinta de Canhões (Teresa Gomes), {contactos.morada.rua}, {contactos.morada.localidade}, {contactos.morada.codigo}. Email:{" "}
              <a className="sublinha text-caixilho" href={`mailto:${contactos.email.texto}`}>
                {contactos.email.texto}
              </a>
              . Registo Nacional de Turismo n.º {contactos.rnet}.
            </p>
          </Bloco>

          <Bloco titulo="Que dados tratamos">
            <p>
              Os que preenche no formulário de reserva: nome, email, telemóvel, a mensagem que nos escrever, as datas, o número de adultos, as crianças por
              escalão de idade (até 3 anos, 3 a 10 anos), se traz um animal, o pequeno-almoço e a forma de pagamento que prefere. E o que nos escrever por
              email ou WhatsApp.
            </p>
          </Bloco>

          <Bloco titulo="Para quê, e com que fundamento">
            <p>
              Para responder ao seu pedido e, se avançar, gerir a reserva, o pagamento do sinal e a sua estadia. O fundamento é o seu próprio pedido: as
              diligências pré-contratuais e a execução do contrato (artigo 6.º, n.º 1, alínea b) do RGPD). Quando a lei o exigir à atividade de alojamento,
              tratamos também os dados necessários para cumprir essas obrigações legais (alínea c) do mesmo artigo).
            </p>
            <p>Não usamos os seus dados para publicidade nem os vendemos a ninguém.</p>
          </Bloco>

          <Bloco titulo="Onde ficam">
            <p>
              Cada pedido fica guardado no alojamento do site (Netlify), com o seu estado (por confirmar, confirmado, pago, cancelado) e as datas, para
              sabermos que noites estão ocupadas e não as darmos duas vezes. Segue também por email para a caixa de correio da casa. Para isso recorremos
              a dois prestadores, que tratam os dados por nossa conta:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Netlify, que aloja o site, o formulário e os pedidos;</li>
              <li>Google (Gmail), que envia e recebe os emails.</li>
            </ul>
            <p>
              Estes prestadores podem tratar dados fora da União Europeia, com as garantias previstas no RGPD que oferecem (como as cláusulas contratuais-tipo
              da Comissão Europeia). O calendário público do site só mostra as noites ocupadas, sem dados pessoais.
            </p>
          </Bloco>

          <Bloco titulo="Durante quanto tempo">
            <p>
              Os pedidos guardados no site são apagados automaticamente 12 meses depois da data de saída da estadia. Os emails ficam nas caixas de
              correio da casa o tempo necessário para tratar da estadia e, depois, só o que a lei nos obrigar a guardar (por exemplo, por razões fiscais)
              e apenas durante o prazo que a lei fixar.
            </p>
          </Bloco>

          <Bloco titulo="Os seus direitos">
            <p>
              Pode pedir-nos acesso aos seus dados, a sua retificação ou apagamento, a limitação do tratamento, opor-se a ele e pedir a portabilidade. Basta
              escrever para{" "}
              <a className="sublinha text-caixilho" href={`mailto:${contactos.email.texto}`}>
                {contactos.email.texto}
              </a>
              . Se achar que os seus dados não foram bem tratados, pode reclamar junto da Comissão Nacional de Proteção de Dados (
              <a className="sublinha text-caixilho" href="https://www.cnpd.pt" target="_blank" rel="noreferrer">
                www.cnpd.pt
              </a>
              ).
            </p>
          </Bloco>

          <Bloco titulo="Cookies" id="cookies">
            <p>
              O site não usa cookies próprios, nem ferramentas de estatística ou de publicidade. As fontes de letra são servidas pelo próprio site.
            </p>
            <p>
              O único serviço com cookies é o mapa do Google Maps no rodapé, que põe cookies da Google e lhe envia dados de navegação (de acordo com a{" "}
              <a className="sublinha text-caixilho" href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">
                política de privacidade da Google
              </a>
              ). Por isso, o mapa só carrega se o aceitar: no aviso de cookies ou no botão «Mostrar o mapa». Até lá, mostramos só a morada, e o link «Ver no
              Google Maps» abre o mapa no site da Google, sem nada no nosso.
            </p>
            <p>
              A sua escolha fica guardada no seu browser (não num cookie). Pode mudá-la ou retirar o consentimento quando quiser, em «Preferências de
              cookies», no fundo de cada página.
            </p>
          </Bloco>
        </div>
      </section>
    </>
  );
}

function Bloco({ titulo, id, children }: { titulo: string; id?: string; children: ReactNode }) {
  return (
    <div id={id} className="scroll-mt-28 mt-10 border-t border-granito-linha pt-8 [&>p+p]:mt-3 [&>ul+p]:mt-3">
      <h2 className="rustico-medio mb-3 text-[1.6rem] leading-tight text-xisto">{titulo}</h2>
      {children}
    </div>
  );
}
