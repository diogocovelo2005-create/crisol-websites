export function render(d, { esc, capa, foto }) {
  const formatText = (text) => text 
    ? esc(text).replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    : '';
  
  return `
<main class="max-w-7xl mx-auto px-10 py-4 space-y-4">
  
  <!-- ================= PAGE 1 ================= -->
  
  <section class="flex flex-col avoid-break pb-4 h-full min-h-[90vh]">
    <!-- Title and Subtitle -->
    <h1 class="text-[2.25rem] font-display text-primary leading-[1.15] mb-4 mt-2">Criação de Websites<br>para Alojamentos Locais</h1>
    <p class="text-[0.85rem] text-gray-700 font-medium mb-6 leading-snug">Um website que apresenta a sua casa com cuidado<br>e facilita o contacto e a reserva direta.</p>
    
    <!-- Photo and Bio -->
    <div class="flex gap-5 items-center mb-6">
      ${foto ? `<img src="${foto}" class="w-28 h-36 object-cover rounded shadow-sm shrink-0" style="object-position: center 20%;" alt="Diogo Covelo">` : ''}
      <div class="flex flex-col justify-center space-y-1.5 shrink-0">
        <h2 class="text-[1.2rem] font-bold font-body text-primary mb-0.5">Diogo Covelo</h2>
        <p class="text-[0.7rem] text-gray-500 font-medium">961 472 733</p>
        <p class="text-[0.7rem] text-gray-500 font-medium">diogocovelo2005@gmail.com</p>
      </div>
      <div class="h-20 w-px bg-outline-variant/60 mx-1 shrink-0"></div>
      <div class="flex flex-col justify-center">
        <p class="text-[0.8rem] text-gray-600 leading-relaxed pr-2">
          "Sou o Diogo Covelo, tenho 21 anos, sou de Viseu e sou licenciado em Engenharia. Gosto de conhecer cada alojamento e perceber o que o distingue. Nos websites que crio, procuro transmitir isso a quem nunca lá esteve, para que consiga imaginar como seria ficar lá."
        </p>
      </div>
    </div>
    
    <!-- Box: DO INTERESSE À RESERVA -->
    <div class="border border-outline-variant/80 rounded-xl p-5 mb-4 relative bg-white/40">
      <h3 class="text-[0.65rem] font-bold text-secondary uppercase tracking-widest mb-4">DO INTERESSE À RESERVA</h3>
      
      <div class="grid grid-cols-3 gap-5">
        <div class="flex flex-col pr-2">
          <div class="text-[1.75rem] font-display text-secondary leading-none mb-3">01</div>
          <h4 class="font-bold text-[0.85rem] text-primary mb-1.5">Interesse</h4>
          <p class="text-[0.75rem] text-gray-600 leading-relaxed">O hóspede já encontrou a sua casa e quer perceber melhor a oferta.</p>
        </div>
        <div class="flex flex-col border-l border-outline-variant/60 pl-5 pr-2">
          <div class="text-[1.75rem] font-display text-secondary leading-none mb-3">02</div>
          <h4 class="font-bold text-[0.85rem] text-primary mb-1.5">Decisão</h4>
          <p class="text-[0.75rem] text-gray-600 leading-relaxed">Imagens e uma narrativa envolvente fazem o hóspede sentir-se em casa antes de a conhecer.</p>
        </div>
        <div class="flex flex-col border-l border-outline-variant/60 pl-5">
          <div class="text-[1.75rem] font-display text-secondary leading-none mb-3">03</div>
          <h4 class="font-bold text-[0.85rem] text-primary mb-1.5">Contacto ou reserva</h4>
          <p class="text-[0.75rem] text-gray-600 leading-relaxed">Pode falar consigo ou seguir para o sistema de reservas que já utiliza.</p>
        </div>
      </div>
    </div>
    
    <p class="text-[0.75rem] text-gray-600 leading-relaxed mb-6">Uma reserva feita diretamente consigo pode evitar comissões. As visitas ao site dependem<br>também da procura e da divulgação.</p>
    
    <!-- Separator line -->
    <div class="w-full h-px bg-outline-variant/80 mb-6"></div>
    
    <!-- Methodology Title -->
    <h3 class="text-[0.65rem] font-bold text-secondary uppercase tracking-widest mb-5">COMO VAMOS TRABALHAR</h3>
    
    <!-- Steps -->
    <div class="space-y-7 mb-6 relative">
      <!-- Vertical Timeline Line -->
      <div class="absolute left-[1.25rem] top-4 bottom-8 w-[2px] bg-secondary/20 z-0 -ml-[1px]"></div>

      <div class="flex gap-5 items-start avoid-break relative z-10">
        <div class="w-10 flex justify-center bg-[#fdf9f3] py-1 shrink-0">
          <span class="text-[1.85rem] font-display text-secondary leading-none">01</span>
        </div>
        <div class="pt-0.5">
          <h4 class="font-bold text-[0.95rem] text-primary mb-1">Conhecer a casa</h4>
          <p class="text-[0.85rem] text-gray-600 leading-relaxed">Falamos do alojamento, dos hóspedes e do que pretende transmitir no site.</p>
        </div>
      </div>
      
      <div class="flex gap-5 items-start avoid-break relative z-10">
        <div class="w-10 flex justify-center bg-[#fdf9f3] py-1 shrink-0">
          <span class="text-[1.85rem] font-display text-secondary leading-none">02</span>
        </div>
        <div class="pt-0.5">
          <h4 class="font-bold text-[0.95rem] text-primary mb-1">Mostrar uma primeira direção</h4>
          <p class="text-[0.85rem] text-gray-600 leading-relaxed">Preparo uma versão base, sem compromisso. Antes de avançar, acordamos o projeto, o<br>preço e o prazo.</p>
        </div>
      </div>
      
      <div class="flex gap-5 items-start avoid-break relative z-10">
        <div class="w-10 flex justify-center bg-[#fdf9f3] py-1 shrink-0">
          <span class="text-[1.85rem] font-display text-secondary leading-none">03</span>
        </div>
        <div class="pt-0.5">
          <h4 class="font-bold text-[0.95rem] text-primary mb-1">Construir e afinar consigo</h4>
          <p class="text-[0.85rem] text-gray-600 leading-relaxed">Desenvolvo o site com os textos e fotografias acordados. Revemos o resultado e<br>ajustamos os detalhes.</p>
        </div>
      </div>
      
      <div class="flex gap-5 items-start avoid-break relative z-10">
        <div class="w-10 flex justify-center bg-[#fdf9f3] py-1 shrink-0">
          <span class="text-[1.85rem] font-display text-secondary leading-none">04</span>
        </div>
        <div class="pt-0.5">
          <h4 class="font-bold text-[0.95rem] text-primary mb-1">Publicar e verificar</h4>
          <p class="text-[0.85rem] text-gray-600 leading-relaxed">Depois da sua aprovação, publico o site e verifico a apresentação, os contactos e as<br>ligações de reserva.</p>
        </div>
      </div>
    </div>
    

  </section>


  <!-- ================= PAGE 2 ================= -->

  <!-- Pacotes de Precos -->
  <!-- Pacotes de Precos -->
  <section class="space-y-4 pt-6 page-break">
    <div class="text-center space-y-2 max-w-3xl mx-auto avoid-break">
      <span class="text-secondary font-bold text-[0.65rem] tracking-widest uppercase">Opções de Investimento</span>
      <h2 class="text-[1.75rem] font-display text-primary">${esc(d.proposta.titulo)}</h2>
      <p class="text-[0.9rem] text-gray-600 font-body">${formatText(d.proposta.intro)}</p>
    </div>

    <div class="flex flex-col md:flex-row items-stretch gap-4 avoid-break mt-1">
      ${d.proposta.pacotes.map((p, idx) => `
      <div class="flex-1 border ${idx === 1 ? 'border-secondary' : 'border-outline-variant'} rounded-lg overflow-hidden bg-white flex flex-col" style="page-break-inside: avoid; break-inside: avoid;">
        <div class="p-3.5 ${idx === 1 ? 'bg-orange-50/50' : 'bg-surface-container-low'} border-b border-outline-variant">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-[1.05rem] font-bold text-primary font-body">${esc(p.nome)}</h3>
              <span class="text-[0.55rem] font-semibold text-secondary uppercase tracking-wider">${esc(p.nota)}</span>
            </div>
            <div class="text-right">
              <div class="text-[1.35rem] font-display text-primary">${esc(p.preco)}</div>
              <div class="text-[0.55rem] text-gray-500 uppercase tracking-widest mt-0.5">Valor Único</div>
            </div>
          </div>
          <p class="text-[0.75rem] text-gray-700 leading-snug">${esc(p.descricao)}</p>
          ${p.variacao ? `<p class="text-[0.65rem] text-secondary mt-1.5 font-medium bg-white p-1.5 border border-secondary/20 rounded">${esc(p.variacao)}</p>` : ''}
        </div>
        <div class="p-3.5 space-y-2 flex-1">
          ${d.proposta.linhas.map(([texto, valores]) => `
          <div class="flex items-start gap-1.5 avoid-break">
            <span class="material-symbols-outlined text-secondary text-[0.95rem] mt-0.5">${(valores[idx].toLowerCase().includes('não') || valores[idx] === '–' || valores[idx] === '-') ? 'close' : 'check_circle'}</span>
            <div>
              <p class="text-[0.8rem] font-semibold text-primary leading-tight">${esc(texto)}</p>
              <p class="text-[0.7rem] text-gray-600 leading-tight mt-0.5">${esc(valores[idx])}</p>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      `).join('')}
    </div>
  </section>

  <!-- Elementos Adicionais & Opcionais -->
  <section class="space-y-3 pt-3 avoid-break">
    <div class="p-4 bg-[#17130D] text-[#FDF9F3] rounded-xl border border-[#3A332A] shadow-xl avoid-break">
      <h3 class="text-[1.05rem] font-display text-secondary mb-1.5">${esc(d.proposta.extrasTitulo || 'Elementos Adicionais & Opcionais')}</h3>
      <div class="text-[0.8rem] leading-snug space-y-1.5 opacity-90">
        ${formatText(d.proposta.extras)}
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 avoid-break">
      <div class="p-3.5 border border-outline-variant rounded bg-surface-container-low flex flex-col gap-1.5">
        <span class="material-symbols-outlined text-gray-400 text-lg">language</span>
        <div><h4 class="font-bold text-[0.8rem] leading-tight">Domínio (Renovação)</h4><p class="text-[0.7rem] text-gray-600 mt-1 leading-tight">${formatText(d.proposta.dominio)}</p></div>
      </div>
      <div class="p-3.5 border border-outline-variant rounded bg-surface-container-low flex flex-col gap-1.5">
        <span class="material-symbols-outlined text-gray-400 text-lg">edit_document</span>
        <div><h4 class="font-bold text-[0.8rem] leading-tight">Alterações (Pós-Entrega)</h4><p class="text-[0.7rem] text-gray-600 mt-1 leading-tight">${formatText(d.proposta.manutencao)}</p></div>
      </div>
      <div class="p-3.5 border border-outline-variant rounded bg-surface-container-low flex flex-col gap-1.5">
        <span class="material-symbols-outlined text-gray-400 text-lg">cloud_done</span>
        <div><h4 class="font-bold text-[0.8rem] leading-tight">Hospedagem & Controlo</h4><p class="text-[0.7rem] text-gray-600 mt-1 leading-tight">${formatText(d.proposta.alojamento)}</p></div>
      </div>
    </div>
  </section>

  <!-- O que preciso & Fecho -->
  <section class="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 avoid-break">
    <div class="space-y-2.5">
      <h4 class="font-bold text-[0.9rem] text-primary flex items-center gap-1.5"><span class="material-symbols-outlined text-secondary text-lg">inventory_2</span> O que preciso de si</h4>
      <ul class="text-[0.85rem] text-gray-600 space-y-1.5">
        ${d.proposta.preciso.map(p => `
        <li class="flex items-start gap-1.5">
          <span class="material-symbols-outlined text-secondary text-[1.1rem] mt-0.5">check_circle</span>
          <span class="leading-snug">${esc(p)}</span>
        </li>`).join('')}
      </ul>
    </div>
    
    <div class="p-4 bg-[#fdf9f3] border-l-4 border-secondary space-y-2 flex flex-col justify-center">
      <h3 class="text-[1.15rem] font-display text-primary">${esc(d.proposta.fecho.titulo)}</h3>
      <p class="text-[0.85rem] text-gray-700 leading-snug">${esc(d.proposta.fecho.texto)}</p>
      <div class="pt-1.5 flex flex-wrap gap-2 text-[0.6rem] font-bold text-secondary uppercase tracking-widest">
        ${Object.values(d.contacto).filter(Boolean).map(esc).join(' &nbsp;&bull;&nbsp; ')}
      </div>
    </div>
  </section>

</main>
`;
}
