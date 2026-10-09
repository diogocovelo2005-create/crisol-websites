export function renderTailwind(d, { esc, capa, foto }) {
  const formatText = (text) => text ? esc(text).replace(/\n/g, '<br>') : '';
  
  return `
<main class="max-w-7xl mx-auto px-12 py-10 space-y-12">
  <!-- Header / Hero -->
  <section class="space-y-6 avoid-break">
    <div class="space-y-4 max-w-4xl">
      <span class="inline-block text-secondary font-semibold text-[0.7rem] tracking-widest uppercase">â€¢ DOCUMENTO ESTRATÃ‰GICO & COMERCIAL â€¢ 2026</span>
      <h1 class="text-5xl md:text-[3.5rem] font-display text-primary tracking-tight leading-tight">
        Proposta de Website &mdash; <em class="font-display italic text-secondary font-normal">${esc(d.casa.nome)}</em>
      </h1>
      <p class="text-lg md:text-xl font-body text-gray-600 leading-relaxed max-w-3xl">
        ${esc(d.casa.frase)}
      </p>
    </div>

    <div class="border border-outline-variant overflow-hidden avoid-break mt-6">
      <div class="relative w-full aspect-[22/9]">
        ${capa ? `<img src="${capa}" class="w-full h-full object-cover" alt="">` : ''}
      </div>
      <div class="px-5 py-3 bg-surface-container-low border-t border-outline-variant flex items-center justify-between text-sm text-gray-600">
        <span class="italic font-display">${esc(d.casa.nome)} â€¢ O encanto da nossa quinta e a calma da regiÃ£o.</span>
        <span class="text-[0.7rem] uppercase tracking-wider font-semibold text-secondary">DOURO â€¢ PORTUGAL</span>
      </div>
    </div>
  </section>

  <!-- DiagnÃ³stico PrÃ¡tico -->
  <section class="space-y-4 pt-4 avoid-break">
    <div class="space-y-2 mb-5">
      <span class="text-secondary font-bold text-[0.65rem] tracking-widest uppercase">DIAGNÃ“STICO PRÃTICO</span>
      <h2 class="text-3xl font-display text-primary border-b border-outline-variant pb-3">O Ponto de Partida vs. A SoluÃ§Ã£o</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 avoid-break">
      <!-- Left Box -->
      <div class="bg-surface-container-low p-6 py-7 border-l-[3px] border-[#B91C1C] avoid-break space-y-5">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-[#B91C1C] text-xl">warning</span>
          <h3 class="text-xl font-display text-primary">${esc(d.site.situacao.titulo)}</h3>
        </div>
        <p class="font-bold text-[0.8rem] text-primary">${esc(d.site.situacao.intro)}</p>
        <ul class="space-y-4">
          ${d.site.situacao.pontos.map(p => `
            <li class="flex items-start gap-3">
              <span class="material-symbols-outlined text-[#B91C1C] text-[1.05rem] mt-0.5">close</span>
              <span class="text-[0.85rem] text-gray-700 leading-relaxed">${esc(p)}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <!-- Right Box -->
      <div class="bg-surface-container-low p-6 py-7 border-l-[3px] border-[#103020] avoid-break space-y-5">
        <div class="flex items-center gap-3">
          <span class="material-symbols-outlined text-secondary text-xl">check_circle</span>
          <h3 class="text-xl font-display text-primary">${esc(d.site.proposta.titulo)}</h3>
        </div>
        <p class="font-bold text-[0.8rem] text-primary">${esc(d.site.proposta.intro)}</p>
        <ul class="space-y-4">
          ${d.site.proposta.pontos.map(p => `
            <li class="flex items-start gap-3">
              <span class="material-symbols-outlined text-primary text-[1.1rem] mt-0.5">check</span>
              <span class="text-[0.85rem] text-gray-700 leading-relaxed">${esc(p)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  </section>

  <!-- Pontos -->
  <section class="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4 avoid-break">
    ${d.site.pontos.map(([titulo, texto]) => `
    <div class="p-5 bg-surface-container-low border border-outline-variant space-y-3 avoid-break">
      <h3 class="text-[1.05rem] font-bold text-primary font-body">${esc(titulo)}</h3>
      <p class="text-[0.85rem] text-gray-700 leading-relaxed">${esc(texto)}</p>
    </div>
    `).join('')}
  </section>

  <!-- Pacotes -->
  <section class="space-y-8 pt-8 page-break">
    <div class="text-center space-y-3 max-w-3xl mx-auto avoid-break">
      <span class="text-secondary font-bold text-xs tracking-widest uppercase">OpÃ§Ãµes de Investimento</span>
      <h2 class="text-4xl font-display text-primary">${esc(d.proposta.titulo)}</h2>
      <p class="text-[0.95rem] text-gray-600 font-body">${formatText(d.proposta.intro)}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 avoid-break">
      ${d.proposta.pacotes.map((p, idx) => `
      <div class="border ${idx === 1 ? 'border-secondary' : 'border-outline-variant'} rounded-lg overflow-hidden bg-white avoid-break">
        <div class="p-6 ${idx === 1 ? 'bg-orange-50/50' : 'bg-surface-container-low'} border-b border-outline-variant">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-xl font-bold text-primary font-body">${esc(p.nome)}</h3>
              <span class="text-[0.65rem] font-semibold text-secondary uppercase tracking-wider">${esc(p.nota)}</span>
            </div>
            <div class="text-right">
              <div class="text-3xl font-display text-primary">${esc(p.preco)}</div>
              <div class="text-[0.65rem] text-gray-500 uppercase tracking-widest mt-1">Valor Ãšnico</div>
            </div>
          </div>
          <p class="text-[0.85rem] text-gray-700 leading-relaxed">${esc(p.descricao)}</p>
          ${p.variacao ? `<p class="text-[0.7rem] text-secondary mt-3 font-medium bg-white p-2 border border-secondary/20 rounded">${esc(p.variacao)}</p>` : ''}
        </div>
        <div class="p-6 space-y-4">
          ${d.proposta.linhas.map(([texto, valores]) => `
          <div class="flex items-start gap-3 avoid-break">
            <span class="material-symbols-outlined text-secondary text-base mt-0.5">${valores[idx].toLowerCase().includes('nÃ£o') ? 'close' : 'check_circle'}</span>
            <div>
              <p class="text-[0.85rem] font-semibold text-primary">${esc(texto)}</p>
              <p class="text-[0.8rem] text-gray-600">${esc(valores[idx])}</p>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      `).join('')}
    </div>
  </section>

  <!-- Elementos Adicionais & Opcionais -->
  <section class="space-y-5 pt-8 avoid-break">
    <div class="p-6 bg-[#17130D] text-[#FDF9F3] rounded-xl border border-[#3A332A] shadow-xl avoid-break">
      <h3 class="text-2xl font-display text-secondary mb-4">${esc(d.proposta.extrasTitulo || 'Elementos Adicionais & Opcionais')}</h3>
      <div class="text-[0.85rem] leading-relaxed space-y-3 opacity-90">
        ${formatText(d.proposta.extras)}
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 avoid-break">
      <div class="p-5 border border-outline-variant rounded bg-surface-container-low flex gap-4">
        <span class="material-symbols-outlined text-gray-400">language</span>
        <div><h4 class="font-bold text-[0.85rem]">DomÃ­nio â€“ RenovaÃ§Ã£o Anual</h4><p class="text-[0.8rem] text-gray-600 mt-1">${formatText(d.proposta.dominio)}</p></div>
      </div>
      <div class="p-5 border border-outline-variant rounded bg-surface-container-low flex gap-4">
        <span class="material-symbols-outlined text-gray-400">edit_document</span>
        <div><h4 class="font-bold text-[0.85rem]">AlteraÃ§Ãµes apÃ³s Entrega</h4><p class="text-[0.8rem] text-gray-600 mt-1">${formatText(d.proposta.manutencao)}</p></div>
      </div>
    </div>
  </section>

  <!-- Passos & Bio -->
  <section class="grid grid-cols-1 lg:grid-cols-12 gap-10 pt-12 page-break">
    <div class="lg:col-span-7 space-y-8 avoid-break">
      <h2 class="text-3xl font-display text-primary border-b border-outline-variant pb-3">Como decorre o projeto</h2>
      <div class="space-y-5">
        ${d.autor.passos.map(([titulo, texto], i) => `
        <div class="flex gap-4 avoid-break">
          <div class="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm shrink-0">${i+1}</div>
          <div>
            <h3 class="font-bold text-[0.95rem] text-primary">${esc(titulo)}</h3>
            <p class="text-[0.85rem] text-gray-600 leading-relaxed mt-1">${esc(texto)}</p>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
    <div class="lg:col-span-5 space-y-6 avoid-break">
      <div class="bg-surface-container-low border border-outline-variant p-6 rounded-lg">
        <div class="flex items-center gap-4 mb-3">
          ${foto ? `<img src="${foto}" class="w-16 h-16 rounded-full object-cover border border-outline-variant" alt="${esc(d.autor.nome)}">` : ''}
          <div>
            <h3 class="font-display text-xl text-primary">${esc(d.autor.nome)}</h3>
            <p class="text-[0.65rem] text-secondary font-bold uppercase tracking-wider">Consultor & Developer</p>
          </div>
        </div>
        <p class="text-[0.85rem] text-gray-700 leading-relaxed">${formatText(d.autor.bio)}</p>
      </div>

      <div class="space-y-3 avoid-break">
        <h4 class="font-bold text-[0.9rem] text-primary flex items-center gap-2"><span class="material-symbols-outlined text-secondary">inventory_2</span> O que preciso de si</h4>
        <ul class="text-[0.85rem] text-gray-600 space-y-2 list-disc list-inside">
          ${d.proposta.preciso.map(p => `<li>${esc(p)}</li>`).join('')}
        </ul>
      </div>
      
      <div class="p-6 bg-[#fdf9f3] border-l-4 border-secondary space-y-3 avoid-break">
        <h3 class="text-xl font-display text-primary">${esc(d.proposta.fecho.titulo)}</h3>
        <p class="text-[0.85rem] text-gray-700 leading-relaxed">${esc(d.proposta.fecho.texto)}</p>
        <div class="pt-3 flex flex-wrap gap-3 text-[0.65rem] font-bold text-secondary uppercase tracking-widest">
          ${Object.values(d.contacto).filter(Boolean).map(esc).join(' &nbsp;&bull;&nbsp; ')}
        </div>
      </div>
    </div>
  </section>
</main>
`;
}

