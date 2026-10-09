export function render(d, { esc, capa, foto }) {
  const formatText = (text) => text 
    ? esc(text).replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    : '';
  
  return `
<main class="max-w-7xl mx-auto px-10 py-6 space-y-4">
  <!-- Header / Hero -->
  <section class="space-y-3 avoid-break">
    <div class="space-y-2 max-w-4xl">
      <span class="inline-block text-secondary font-semibold text-[0.6rem] tracking-widest uppercase">• DOCUMENTO ESTRATÉGICO & COMERCIAL • 2026</span>
      <h1 class="text-3xl md:text-5xl font-display text-primary tracking-tight leading-tight">
        Proposta de Website &mdash; <em class="font-display italic text-secondary font-normal">${esc(d.casa.nome)}</em>
      </h1>
      <p class="text-sm md:text-base font-body text-gray-600 leading-relaxed max-w-3xl">
        ${esc(d.casa.frase)}
      </p>
    </div>

    <div class="border border-outline-variant overflow-hidden avoid-break mt-3">
      <div class="relative w-full aspect-[32/9]">
        ${capa ? `<img src="${capa}" class="w-full h-full object-cover" alt="">` : ''}
      </div>
      <div class="px-4 py-2 bg-surface-container-low border-t border-outline-variant flex items-center justify-between text-[0.7rem] text-gray-600">
        <span class="italic font-display">${esc(d.casa.nome)} • O encanto da nossa quinta e a calma da região.</span>
        <span class="text-[0.6rem] uppercase tracking-wider font-semibold text-secondary">DOURO • PORTUGAL</span>
      </div>
    </div>
  </section>

  <!-- Diagnóstico Prático -->
  <section class="space-y-3 pt-1 avoid-break">
    <div class="space-y-1 mb-2">
      <span class="text-secondary font-bold text-[0.55rem] tracking-widest uppercase">DIAGNÓSTICO PRÁTICO</span>
      <h2 class="text-xl font-display text-primary border-b border-outline-variant pb-1">O Ponto de Partida vs. A Solução</h2>
    </div>

    <div class="flex flex-col md:flex-row gap-4 avoid-break">
      <!-- Left Box -->
      <div class="flex-1 bg-surface-container-low p-4 border-l-[3px] border-[#B91C1C] avoid-break space-y-2">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-[#B91C1C] text-base">warning</span>
          <h3 class="text-base font-display text-primary">${esc(d.site.situacao.titulo)}</h3>
        </div>
        <p class="font-bold text-[0.75rem] text-primary">${esc(d.site.situacao.intro)}</p>
        <ul class="space-y-2">
          ${d.site.situacao.pontos.map(p => `
            <li class="flex items-start gap-2">
              <span class="material-symbols-outlined text-[#B91C1C] text-[0.95rem] mt-0.5">close</span>
              <span class="text-[0.75rem] text-gray-700 leading-snug">${esc(p)}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Right Box -->
      <div class="flex-1 bg-surface-container-low p-4 border-l-[3px] border-[#103020] avoid-break space-y-2">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary text-base">check_circle</span>
          <h3 class="text-base font-display text-primary">${esc(d.site.proposta.titulo)}</h3>
        </div>
        <p class="font-bold text-[0.75rem] text-primary">${esc(d.site.proposta.intro)}</p>
        <ul class="space-y-2">
          ${d.site.proposta.pontos.map(p => `
            <li class="flex items-start gap-2">
              <span class="material-symbols-outlined text-primary text-[0.95rem] mt-0.5">check</span>
              <span class="text-[0.75rem] text-gray-700 leading-snug">${esc(p)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  </section>

  <!-- Pontos -->
  <section class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 avoid-break">
    ${d.site.pontos.map(([titulo, texto]) => `
    <div class="p-3 bg-surface-container-low border border-outline-variant space-y-1.5 avoid-break">
      <h3 class="text-[0.85rem] font-bold text-primary font-body">${esc(titulo)}</h3>
      <p class="text-[0.75rem] text-gray-700 leading-snug">${esc(texto)}</p>
    </div>
    `).join('')}
  </section>

  <!-- Pacotes -->
  <section class="space-y-4 pt-4 page-break">
    <div class="text-center space-y-1.5 max-w-3xl mx-auto avoid-break">
      <span class="text-secondary font-bold text-[0.6rem] tracking-widest uppercase">Opções de Investimento</span>
      <h2 class="text-2xl font-display text-primary">${esc(d.proposta.titulo)}</h2>
      <p class="text-[0.85rem] text-gray-600 font-body">${formatText(d.proposta.intro)}</p>
    </div>

    <div class="flex flex-col md:flex-row items-stretch gap-4 avoid-break">
      ${d.proposta.pacotes.map((p, idx) => `
      <div class="flex-1 border ${idx === 1 ? 'border-secondary' : 'border-outline-variant'} rounded-lg overflow-hidden bg-white flex flex-col" style="page-break-inside: avoid; break-inside: avoid;">
        <div class="p-3 ${idx === 1 ? 'bg-orange-50/50' : 'bg-surface-container-low'} border-b border-outline-variant">
          <div class="flex justify-between items-start mb-2">
            <div>
              <h3 class="text-base font-bold text-primary font-body">${esc(p.nome)}</h3>
              <span class="text-[0.55rem] font-semibold text-secondary uppercase tracking-wider">${esc(p.nota)}</span>
            </div>
            <div class="text-right">
              <div class="text-xl font-display text-primary">${esc(p.preco)}</div>
              <div class="text-[0.55rem] text-gray-500 uppercase tracking-widest mt-0.5">Valor Único</div>
            </div>
          </div>
          <p class="text-[0.75rem] text-gray-700 leading-snug">${esc(p.descricao)}</p>
          ${p.variacao ? `<p class="text-[0.6rem] text-secondary mt-2 font-medium bg-white p-1.5 border border-secondary/20 rounded">${esc(p.variacao)}</p>` : ''}
        </div>
        <div class="p-3 space-y-2 flex-1">
          ${d.proposta.linhas.map(([texto, valores]) => `
          <div class="flex items-start gap-2 avoid-break">
            <span class="material-symbols-outlined text-secondary text-[0.95rem] mt-0.5">${(valores[idx].toLowerCase().includes('não') || valores[idx] === '–' || valores[idx] === '-') ? 'close' : 'check_circle'}</span>
            <div>
              <p class="text-[0.75rem] font-semibold text-primary">${esc(texto)}</p>
              <p class="text-[0.7rem] text-gray-600">${esc(valores[idx])}</p>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      `).join('')}
    </div>
  </section>

  <!-- Elementos Adicionais & Opcionais -->
  <section class="space-y-3 pt-2 avoid-break">
    <div class="p-4 bg-[#17130D] text-[#FDF9F3] rounded-xl border border-[#3A332A] shadow-xl avoid-break">
      <h3 class="text-lg font-display text-secondary mb-2">${esc(d.proposta.extrasTitulo || 'Elementos Adicionais & Opcionais')}</h3>
      <div class="text-[0.75rem] leading-snug space-y-1 opacity-90">
        ${formatText(d.proposta.extras)}
      </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 avoid-break">
      <div class="p-3 border border-outline-variant rounded bg-surface-container-low flex flex-col gap-2">
        <span class="material-symbols-outlined text-gray-400 text-lg">language</span>
        <div><h4 class="font-bold text-[0.8rem] leading-tight">Domínio (Renovação)</h4><p class="text-[0.7rem] text-gray-600 mt-1 leading-tight">${formatText(d.proposta.dominio)}</p></div>
      </div>
      <div class="p-3 border border-outline-variant rounded bg-surface-container-low flex flex-col gap-2">
        <span class="material-symbols-outlined text-gray-400 text-lg">edit_document</span>
        <div><h4 class="font-bold text-[0.8rem] leading-tight">Alterações (Pós-Entrega)</h4><p class="text-[0.7rem] text-gray-600 mt-1 leading-tight">${formatText(d.proposta.manutencao)}</p></div>
      </div>
      <div class="p-3 border border-outline-variant rounded bg-surface-container-low flex flex-col gap-2">
        <span class="material-symbols-outlined text-gray-400 text-lg">cloud_done</span>
        <div><h4 class="font-bold text-[0.8rem] leading-tight">Hospedagem & Controlo</h4><p class="text-[0.7rem] text-gray-600 mt-1 leading-tight">${formatText(d.proposta.alojamento)}</p></div>
      </div>
    </div>
  </section>

  <!-- Passos & Bio -->
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 page-break">
    <div class="lg:col-span-7 space-y-6 avoid-break">
      <h2 class="text-2xl font-display text-primary border-b border-outline-variant pb-2">Como decorre o projeto</h2>
      <div class="space-y-5">
        ${d.autor.passos.map(([titulo, texto], i) => `
        <div class="flex gap-4 avoid-break">
          <div class="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm shrink-0">${i+1}</div>
          <div>
            <h3 class="font-bold text-[0.95rem] text-primary">${esc(titulo)}</h3>
            <p class="text-[0.85rem] text-gray-600 leading-snug mt-1">${esc(texto)}</p>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
    <div class="lg:col-span-5 space-y-5 avoid-break">
      <div class="bg-surface-container-low border border-outline-variant p-5 rounded-lg">
        <div class="flex items-center gap-4 mb-3">
          ${foto ? `<img src="${foto}" class="w-14 h-14 rounded-full object-cover border border-outline-variant" alt="${esc(d.autor.nome)}">` : ''}
          <div>
            <h3 class="font-display text-lg text-primary">${esc(d.autor.nome)}</h3>
            <p class="text-[0.65rem] text-secondary font-bold uppercase tracking-wider">Consultor & Developer</p>
          </div>
        </div>
        <p class="text-[0.85rem] text-gray-700 leading-snug">${formatText(d.autor.bio)}</p>
      </div>

      <div class="space-y-2 avoid-break">
        <h4 class="font-bold text-[0.9rem] text-primary flex items-center gap-2"><span class="material-symbols-outlined text-secondary text-lg">inventory_2</span> O que preciso de si</h4>
        <ul class="text-[0.85rem] text-gray-600 space-y-2">
          ${d.proposta.preciso.map(p => `
          <li class="flex items-start gap-2">
            <span class="material-symbols-outlined text-secondary text-[1.1rem] mt-0.5">check_circle</span>
            <span class="leading-snug">${esc(p)}</span>
          </li>`).join('')}
        </ul>
      </div>
      
      <div class="p-6 bg-[#fdf9f3] border-l-4 border-secondary space-y-2 avoid-break">
        <h3 class="text-lg font-display text-primary">${esc(d.proposta.fecho.titulo)}</h3>
        <p class="text-[0.85rem] text-gray-700 leading-snug">${esc(d.proposta.fecho.texto)}</p>
        <div class="pt-2 flex flex-wrap gap-2 text-[0.65rem] font-bold text-secondary uppercase tracking-widest">
          ${Object.values(d.contacto).filter(Boolean).map(esc).join(' &nbsp;&bull;&nbsp; ')}
        </div>
      </div>
    </div>
  </section>
</main>
`;
}
