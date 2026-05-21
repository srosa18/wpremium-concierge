/* W Premium Wireframe — global components & interactions (Fase 03) */
(function(){
  'use strict';

  // =====================================================
  // GLOBAL COMPONENTS — Nav, Footer, Verifier Modal
  // =====================================================

  var NAV_LINKS = [
    {href:'salas.html',         label:'Salas'},
    {href:'airport-rooms.html', label:'Airport Rooms'},
    {href:'servicos.html',      label:'Serviços'},
    {href:'como-acessar.html',  label:'Como Acessar'},
    {href:'editorial.html',     label:'Editorial'},
    {href:'sobre.html',         label:'Sobre'},
    {href:'b2b.html',           label:'B2B'},
    {href:'contato.html',       label:'Contato'}
  ];

  function navHTML(prefix){
    prefix = prefix || '';
    var links = NAV_LINKS.map(function(l){
      return '<a href="'+prefix+l.href+'">'+l.label+'</a>';
    }).join('');
    return ''+
      '<div class="wf-banner">Wireframe Mode · W Premium Concierge Digital <span>Fase 03 · Sitemap V1</span></div>'+
      '<header class="nav">'+
      '  <div class="container nav-inner">'+
      '    <a href="'+prefix+'index.html" class="nav-logo">W <span>Premium</span></a>'+
      '    <nav class="nav-links" aria-label="Principal">'+links+'</nav>'+
      '    <div class="nav-actions">'+
      '      <button class="lang-switch" data-lang-switch aria-label="Idioma">'+
      '        <span class="lang-current">PT</span><span class="lang-sep">·</span><span class="lang-other">EN</span><span class="lang-sep">·</span><span class="lang-other">ES</span>'+
      '      </button>'+
      '      <button class="btn btn-secondary btn-sm" data-open-verifier>Verificar Acesso</button>'+
      '      <a href="'+prefix+'login.html" class="btn btn-ghost btn-sm">Entrar</a>'+
      '      <button class="nav-hamburger" aria-label="Menu" data-hamburger>'+
      '        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/></svg>'+
      '      </button>'+
      '    </div>'+
      '  </div>'+
      '</header>';
  }

  function footerHTML(prefix){
    prefix = prefix || '';
    return ''+
      '<footer class="footer" data-comment-id="global.footer" data-comment-label="Footer global">'+
      '  <div class="container">'+
      '    <div class="footer-grid">'+
      '      <div>'+
      '        <div class="nav-logo">W <span>Premium</span></div>'+
      '        <p class="small mt-2" style="max-width:280px;">Concierge digital para a maior rede premium em aeroportos brasileiros e argentinos.</p>'+
      '        <div class="footer-social mt-3">'+
      '          <a href="#" aria-label="Instagram">ig</a>'+
      '          <a href="#" aria-label="LinkedIn">in</a>'+
      '          <a href="#" aria-label="Facebook">f</a>'+
      '          <a href="#" aria-label="YouTube">yt</a>'+
      '        </div>'+
      '      </div>'+
      '      <div>'+
      '        <h5>Produto</h5>'+
      '        <ul class="footer-links">'+
      '          <li><a href="'+prefix+'salas.html">Salas</a></li>'+
      '          <li><a href="'+prefix+'airport-rooms.html">Airport Rooms</a></li>'+
      '          <li><a href="'+prefix+'servicos.html">Serviços</a></li>'+
      '          <li><a href="'+prefix+'como-acessar.html">Como Acessar</a></li>'+
      '          <li><a href="'+prefix+'formas-de-acesso.html">Formas de Acesso</a></li>'+
      '        </ul>'+
      '      </div>'+
      '      <div>'+
      '        <h5>Conteúdo &amp; Marca</h5>'+
      '        <ul class="footer-links">'+
      '          <li><a href="'+prefix+'editorial.html">Editorial</a></li>'+
      '          <li><a href="'+prefix+'sobre.html">Sobre</a></li>'+
      '          <li><a href="'+prefix+'historia.html">História</a></li>'+
      '          <li><a href="'+prefix+'premios.html">Prêmios</a></li>'+
      '          <li><a href="'+prefix+'imprensa.html">Imprensa</a></li>'+
      '        </ul>'+
      '      </div>'+
      '      <div>'+
      '        <h5>Negócios</h5>'+
      '        <ul class="footer-links">'+
      '          <li><a href="'+prefix+'b2b.html">B2B</a></li>'+
      '          <li><a href="'+prefix+'reservas-grupo.html">Reservas de Grupo</a></li>'+
      '          <li><a href="'+prefix+'parcerias-operadoras.html">Parcerias Operadoras</a></li>'+
      '          <li><a href="'+prefix+'trabalhe-conosco.html">Trabalhe Conosco</a></li>'+
      '        </ul>'+
      '      </div>'+
      '      <div>'+
      '        <h5>Suporte</h5>'+
      '        <ul class="footer-links">'+
      '          <li><a href="'+prefix+'contato.html">Contato</a></li>'+
      '          <li><a href="'+prefix+'faq.html">FAQ</a></li>'+
      '          <li><a href="'+prefix+'busca-global.html">Busca</a></li>'+
      '          <li><a href="#" data-open-verifier>Verificador</a></li>'+
      '        </ul>'+
      '      </div>'+
      '    </div>'+
      '    <div class="footer-utility">'+
      '      <div class="footer-utility-links">'+
      '        <a href="'+prefix+'termos.html">Termos de Uso</a> · '+
      '        <a href="'+prefix+'privacidade.html">Privacidade (LGPD)</a> · '+
      '        <a href="'+prefix+'cookies.html">Cookies</a> · '+
      '        <a href="'+prefix+'acessibilidade.html">Acessibilidade (WCAG 2.1 AA)</a> · '+
      '        <a href="'+prefix+'sitemap.xml">Sitemap.xml</a>'+
      '      </div>'+
      '    </div>'+
      '    <div class="footer-bottom">'+
      '      <span>© 2026 W Premium Group · Concierge Digital · Fase 03</span>'+
      '      <span class="footer-langs">'+
      '        <a href="#" class="lang-pill active">PT</a> '+
      '        <a href="#" class="lang-pill">EN</a> '+
      '        <a href="#" class="lang-pill">ES</a>'+
      '      </span>'+
      '    </div>'+
      '  </div>'+
      '</footer>';
  }

  function verifierModalHTML(prefix){
    prefix = prefix || '';
    return ''+
      '<div class="modal-backdrop" data-modal-backdrop hidden>'+
      '  <div class="modal" role="dialog" aria-label="Verificador de Acesso" aria-modal="true" data-comment-id="modal.verificador" data-comment-label="Modal · Verificador de Acesso">'+
      '    <button class="modal-close" data-modal-close aria-label="Fechar">×</button>'+
      '    <div class="modal-body">'+
      '      <div class="eyebrow">W Premium Verify · Modal</div>'+
      '      <h2 class="h2 mt-1">Você é Elegível?</h2>'+
      '      <p class="muted mt-1" style="font-size:13px;">Insira o BIN do seu cartão e descubra, em tempo real, quais salas você tem direito hoje — sem precisar sair desta página.</p>'+
      '      <form id="verif-form" class="mt-3">'+
      '        <div class="field mb-2">'+
      '          <label>Número do cartão (BIN ou completo)</label>'+
      '          <input class="input" inputmode="numeric" maxlength="19" placeholder="0000  0000  0000  0000" required>'+
      '        </div>'+
      '        <button class="btn btn-primary btn-block" type="submit">Verificar Acesso</button>'+
      '        <p class="tiny muted mt-2 text-center">Consultivo · não armazenamos seus dados.</p>'+
      '      </form>'+
      '      <div id="state-success" class="state-success mt-3" style="display:none;">'+
      '        <strong>✓ Você é Elegível!</strong>'+
      '        <p class="mt-1" style="font-size:13px;color:#2E6B4A;">Seu cartão dá acesso a <strong>15 salas</strong> W Premium agora mesmo.</p>'+
      '        <div class="mt-2 flex gap-1"><a href="'+prefix+'verificador.html" class="btn btn-primary btn-sm">Ver salas elegíveis</a><button class="btn btn-ghost btn-sm" data-verif-reset>Verificar outro</button></div>'+
      '      </div>'+
      '      <div id="state-fail" class="state-error mt-3" style="display:none;">'+
      '        <strong>Cartão sem acesso direto</strong>'+
      '        <p class="mt-1" style="font-size:13px;color:#8A3326;">Você ainda pode entrar com o W Day Pass.</p>'+
      '        <div class="mt-2 flex gap-1"><a href="'+prefix+'formas-de-acesso.html" class="btn btn-primary btn-sm">Ver Formas de Acesso</a><button class="btn btn-ghost btn-sm" data-verif-reset>Tentar outro</button></div>'+
      '      </div>'+
      '      <div class="modal-divider"></div>'+
      '      <a href="'+prefix+'como-acessar.html" class="btn-link">Ver página completa de Como Acessar →</a>'+
      '    </div>'+
      '  </div>'+
      '</div>';
  }

  // =====================================================
  // INJECTION
  // =====================================================

  function inject(){
    var prefix = document.body.getAttribute('data-prefix') || '';
    var navMount = document.querySelector('[data-nav]');
    var footerMount = document.querySelector('[data-footer]');
    var modalMount = document.querySelector('[data-modal-mount]');

    if(navMount && navMount.innerHTML.trim() === '') navMount.innerHTML = navHTML(prefix);
    if(footerMount && footerMount.innerHTML.trim() === '') footerMount.innerHTML = footerHTML(prefix);
    if(modalMount && modalMount.innerHTML.trim() === '') modalMount.innerHTML = verifierModalHTML(prefix);
  }

  function markActiveNav(){
    var path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(function(a){
      var href = a.getAttribute('href');
      if(!href) return;
      var clean = href.split('/').pop();
      if(clean === path){
        a.classList.add('active');
      }
    });
  }

  // =====================================================
  // INTERACTIONS
  // =====================================================

  function bindHamburger(){
    document.addEventListener('click', function(e){
      var btn = e.target.closest('[data-hamburger]');
      if(!btn) return;
      var links = document.querySelector('.nav-links');
      if(!links) return;
      var open = links.classList.toggle('is-open');
      if(open){
        links.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:72px;left:0;right:0;background:#fff;border-bottom:1px solid var(--border);padding:24px;gap:8px;z-index:60;';
      } else {
        links.style.cssText = '';
      }
    });
  }

  function bindAccordions(){
    document.addEventListener('click', function(e){
      var trig = e.target.closest('.acc-trigger');
      if(!trig) return;
      var acc = trig.closest('.acc');
      if(acc) acc.classList.toggle('open');
    });
  }

  function bindChips(){
    document.querySelectorAll('[data-chip-group]').forEach(function(group){
      group.querySelectorAll('.chip').forEach(function(chip){
        chip.addEventListener('click', function(){
          group.querySelectorAll('.chip').forEach(function(c){c.classList.remove('active');});
          chip.classList.add('active');
        });
      });
    });
  }

  // =====================================================
  // VERIFIER (modal + standalone page)
  // =====================================================
  function bindVerifier(){
    document.addEventListener('click', function(e){
      var open = e.target.closest('[data-open-verifier]');
      if(open){
        e.preventDefault();
        openModal();
      }
      var close = e.target.closest('[data-modal-close]');
      if(close){
        closeModal();
      }
      if(e.target.matches('[data-modal-backdrop]')){
        closeModal();
      }
      var reset = e.target.closest('[data-verif-reset]');
      if(reset){
        var ok = document.getElementById('state-success');
        var no = document.getElementById('state-fail');
        var form = document.getElementById('verif-form');
        if(ok) ok.style.display = 'none';
        if(no) no.style.display = 'none';
        if(form) {
          form.style.display = 'block';
          var i = form.querySelector('input');
          if(i) i.value = '';
        }
      }
    });

    document.addEventListener('submit', function(e){
      var form = e.target.closest('#verif-form');
      if(!form) return;
      e.preventDefault();
      var input = form.querySelector('input');
      var v = (input.value || '').replace(/\s/g,'');
      var stOk = document.getElementById('state-success');
      var stNo = document.getElementById('state-fail');
      var stIn = document.getElementById('state-input');
      if(stIn) stIn.style.display = 'none';
      if(/^[345]/.test(v) && v.length >= 6){
        if(stOk) stOk.style.display = 'block';
        if(stNo) stNo.style.display = 'none';
      } else {
        if(stNo) stNo.style.display = 'block';
        if(stOk) stOk.style.display = 'none';
      }
      form.style.display = 'none';
    });

    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape') closeModal();
    });
  }

  function openModal(){
    var bd = document.querySelector('[data-modal-backdrop]');
    if(!bd) return;
    bd.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function(){
      var input = bd.querySelector('input');
      if(input) input.focus();
    }, 50);
  }

  function closeModal(){
    var bd = document.querySelector('[data-modal-backdrop]');
    if(!bd) return;
    bd.hidden = true;
    document.body.style.overflow = '';
    // reset
    var form = document.getElementById('verif-form');
    if(form){
      form.style.display = 'block';
      var i = form.querySelector('input');
      if(i) i.value = '';
    }
    var ok = document.getElementById('state-success');
    var no = document.getElementById('state-fail');
    if(ok) ok.style.display = 'none';
    if(no) no.style.display = 'none';
  }

  // =====================================================
  // GALLERY · STARS · FORMS · SEARCH SUGGEST · TABS
  // =====================================================

  function bindGallery(){
    document.querySelectorAll('[data-gallery]').forEach(function(g){
      var dots = g.querySelectorAll('.dot');
      dots.forEach(function(d){
        d.addEventListener('click', function(){
          dots.forEach(function(x){x.classList.remove('active');});
          d.classList.add('active');
        });
      });
      var arrows = g.querySelectorAll('.gallery-arrow');
      arrows.forEach(function(a, idx){
        a.addEventListener('click', function(){
          var arr = Array.prototype.slice.call(dots);
          var active = g.querySelector('.dot.active');
          var i = arr.indexOf(active);
          var next = idx === 0 ? (i-1+arr.length)%arr.length : (i+1)%arr.length;
          arr.forEach(function(x){x.classList.remove('active');});
          arr[next].classList.add('active');
        });
      });
    });
  }

  function bindStars(){
    document.querySelectorAll('[data-star-row]').forEach(function(row){
      var stars = row.querySelectorAll('.star');
      stars.forEach(function(st, i){
        st.addEventListener('click', function(){
          stars.forEach(function(s, j){ s.classList.toggle('on', j <= i); });
        });
      });
    });
  }

  function bindForms(){
    document.addEventListener('submit', function(e){
      var f = e.target.closest('[data-form-demo]');
      if(!f) return;
      e.preventDefault();
      var msg = f.getAttribute('data-form-msg') || 'Obrigado. Recebemos sua mensagem.';
      var redirect = f.getAttribute('data-form-redirect');
      if(!f.querySelector('.note.demo-feedback')){
        var feedback = document.createElement('div');
        feedback.className = 'note demo-feedback';
        feedback.style.marginTop = '12px';
        feedback.textContent = msg;
        f.appendChild(feedback);
      }
      f.querySelectorAll('input,textarea').forEach(function(i){ if(i.type !== 'submit') i.value=''; });
      if(redirect){
        setTimeout(function(){ location.href = redirect; }, 1500);
      }
    });
  }

  function bindSearchSuggest(){
    var input = document.getElementById('airport-search');
    var box = document.getElementById('airport-suggest');
    if(!input || !box) return;
    var prefix = document.body.getAttribute('data-prefix') || '';
    var data = [
      {iata:'GRU', city:'Guarulhos · São Paulo', salas:3, slug:'aeroporto-gru.html'},
      {iata:'REC', city:'Recife', salas:2, slug:'aeroporto-rec.html'},
      {iata:'FOR', city:'Fortaleza', salas:2, slug:'aeroporto-for.html'},
      {iata:'GIG', city:'Galeão · Rio de Janeiro', salas:2, slug:'aeroporto-gig.html'},
      {iata:'POA', city:'Porto Alegre', salas:1, slug:'aeroporto-gru.html'},
      {iata:'CGH', city:'Congonhas · São Paulo', salas:1, slug:'aeroporto-gru.html'},
      {iata:'BSB', city:'Brasília', salas:1, slug:'aeroporto-gru.html'},
      {iata:'FTE', city:'El Calafate · Argentina', salas:1, slug:'aeroporto-gru.html'},
      {iata:'USH', city:'Ushuaia · Argentina', salas:1, slug:'aeroporto-gru.html'}
    ];
    function render(q){
      var qq = (q||'').toLowerCase();
      var hits = data.filter(function(d){
        return d.iata.toLowerCase().indexOf(qq) === 0 || d.city.toLowerCase().indexOf(qq) >= 0;
      });
      if(!hits.length || !qq){ box.style.display='none'; return; }
      box.innerHTML = hits.map(function(h){
        return '<a href="'+prefix+h.slug+'" class="suggest-item">'+
          '<span><strong>'+h.city+'</strong> · '+h.iata+'</span>'+
          '<span class="tiny">'+h.salas+' sala'+(h.salas>1?'s':'')+'</span></a>';
      }).join('');
      box.style.display='block';
    }
    input.addEventListener('input', function(){ render(input.value); });
    input.addEventListener('focus', function(){ if(input.value) render(input.value); });
    document.addEventListener('click', function(e){
      if(!box.contains(e.target) && e.target !== input) box.style.display='none';
    });
  }

  // =====================================================
  // INIT
  // =====================================================

  document.addEventListener('DOMContentLoaded', function(){
    inject();
    markActiveNav();
    bindHamburger();
    bindAccordions();
    bindChips();
    bindVerifier();
    bindGallery();
    bindStars();
    bindForms();
    bindSearchSuggest();
  });
})();
