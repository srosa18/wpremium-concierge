/* ============================================
   FEEDBACK WIDGET · MVP
   Salva comentários no Supabase por dobra de conteúdo.

   Setup:
   1. Crie um projeto em https://supabase.com (free)
   2. SQL Editor → cole o conteúdo de FEEDBACK_SETUP.md (cria a tabela)
   3. Settings → API → copie:
      - Project URL → SUPABASE_URL abaixo
      - anon/public key → SUPABASE_ANON_KEY abaixo
   4. Commit. Pronto.

   Para esconder o widget (ex: screenshot pro cliente final):
   adicione classe "fb-off" no <body>, ou ?fb=off na URL.
   ============================================ */

(function(){
  'use strict';

  // ====================================================
  // CONFIG · troque pelos valores do seu projeto Supabase
  // ====================================================
  var SUPABASE_URL = 'https://itwaxivhuxtnatjuoebe.supabase.co';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0d2F4aXZodXh0bmF0anVvZWJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzI5NzMsImV4cCI6MjA5NDk0ODk3M30.mbjL6lV5Y05TaBBo3_BuGhK6AdIa6Bm6WDRcc2BC9-Q';
  var TABLE = 'comments';

  // Se quiser desligar o widget temporariamente:
  // - Adicione classe "fb-off" no <body>, ou
  // - Acesse com ?fb=off na URL
  var urlOff = (location.search || '').indexOf('fb=off') >= 0;
  if (urlOff) document.body.classList.add('fb-off');

  var configured = SUPABASE_URL.indexOf('CHANGE_ME') !== 0 && SUPABASE_ANON_KEY.indexOf('CHANGE_ME') !== 0;

  // ====================================================
  // HELPERS
  // ====================================================
  function ls(k, v){
    try{
      if (v === undefined) return localStorage.getItem(k);
      if (v === null) { localStorage.removeItem(k); return; }
      localStorage.setItem(k, v);
    }catch(e){}
  }
  function el(tag, attrs, html){
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k){
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else e.setAttribute(k, attrs[k]);
    });
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function fmtDate(iso){
    try{
      var d = new Date(iso);
      var dd = String(d.getDate()).padStart(2,'0');
      var mm = String(d.getMonth()+1).padStart(2,'0');
      var hh = String(d.getHours()).padStart(2,'0');
      var mi = String(d.getMinutes()).padStart(2,'0');
      return dd+'/'+mm+' · '+hh+':'+mi;
    }catch(e){ return ''; }
  }
  function pageKey(){
    return (location.pathname.split('/').pop() || 'index.html').replace('.html','') || 'index';
  }

  // ====================================================
  // SUPABASE REST · sem SDK
  // ====================================================
  function sbHeaders(){
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer '+SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
  }
  function sbGet(commentId){
    if (!configured) return Promise.resolve([]);
    var url = SUPABASE_URL+'/rest/v1/'+TABLE+
      '?page=eq.'+encodeURIComponent(pageKey())+
      '&element_id=eq.'+encodeURIComponent(commentId)+
      '&order=created_at.asc';
    return fetch(url, { headers: sbHeaders() })
      .then(function(r){ return r.ok ? r.json() : []; })
      .catch(function(){ return []; });
  }
  function sbGetAll(){
    if (!configured) return Promise.resolve([]);
    var url = SUPABASE_URL+'/rest/v1/'+TABLE+
      '?page=eq.'+encodeURIComponent(pageKey())+
      '&order=created_at.desc';
    return fetch(url, { headers: sbHeaders() })
      .then(function(r){ return r.ok ? r.json() : []; })
      .catch(function(){ return []; });
  }
  function sbPost(payload){
    if (!configured) {
      console.warn('[feedback] Supabase não configurado · comentário não foi salvo:', payload);
      return Promise.reject(new Error('Supabase não configurado'));
    }
    var url = SUPABASE_URL+'/rest/v1/'+TABLE;
    var h = sbHeaders();
    h['Prefer'] = 'return=representation';
    return fetch(url, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(payload)
    }).then(function(r){
      if (!r.ok) throw new Error('HTTP '+r.status);
      return r.json();
    });
  }

  // ====================================================
  // STATE · contadores por element_id (cache leve)
  // ====================================================
  var counts = {}; // { 'home.killer-feature': 3 }

  function refreshAllCounts(){
    return sbGetAll().then(function(all){
      counts = {};
      all.forEach(function(c){
        var id = c.element_id;
        counts[id] = (counts[id]||0) + 1;
      });
      // atualiza badges
      document.querySelectorAll('[data-comment-id]').forEach(function(node){
        var id = node.getAttribute('data-comment-id');
        var pin = node.querySelector(':scope > .fb-pin');
        if (!pin) return;
        var badge = pin.querySelector('.fb-count');
        var n = counts[id] || 0;
        badge.textContent = n;
        badge.hidden = n === 0;
      });
    });
  }

  // ====================================================
  // INJETA BOTÕES "+" em cada [data-comment-id]
  // ====================================================
  function injectPins(){
    document.querySelectorAll('[data-comment-id]').forEach(function(node){
      if (node.querySelector(':scope > .fb-pin')) return; // já tem
      var id = node.getAttribute('data-comment-id');
      var pin = el('button', { 'class': 'fb-pin', 'type': 'button', 'aria-label': 'Comentar nesta dobra', 'title': 'Deixar um comentário' }, '+');
      var badge = el('span', { 'class': 'fb-count', 'hidden': '' });
      badge.textContent = '0';
      pin.appendChild(badge);
      pin.addEventListener('click', function(e){
        e.preventDefault();
        e.stopPropagation();
        openModal(id, node);
      });
      // posiciona; alguns elementos com position:static precisam ganhar relative
      var cs = window.getComputedStyle(node);
      if (cs.position === 'static') node.style.position = 'relative';
      node.appendChild(pin);
    });
  }

  // ====================================================
  // MODAL
  // ====================================================
  var modalRoot = null;
  function ensureModalRoot(){
    if (modalRoot) return modalRoot;
    modalRoot = el('div', { 'class': 'fb-modal-backdrop', 'hidden': '' });
    document.body.appendChild(modalRoot);
    modalRoot.addEventListener('click', function(e){
      if (e.target === modalRoot) closeModal();
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') closeModal();
    });
    return modalRoot;
  }

  function openModal(commentId, anchorNode){
    ensureModalRoot();
    var label = anchorNode.getAttribute('data-comment-label') || commentId;
    var savedName = ls('fb-name') || '';
    var savedEmail = ls('fb-email') || '';

    modalRoot.innerHTML = ''+
      '<div class="fb-modal" role="dialog" aria-modal="true" aria-label="Comentar nesta dobra">'+
      '  <div class="fb-modal-header">'+
      '    <div>'+
      '      <div class="fb-modal-sub">'+escapeHtml(label)+'</div>'+
      '      <h3 class="fb-modal-title">Deixe seu comentário sobre esta dobra</h3>'+
      '    </div>'+
      '    <button class="fb-modal-close" type="button" aria-label="Fechar">×</button>'+
      '  </div>'+
      '  <div class="fb-comments" data-fb-list><div class="fb-comment-empty">Carregando comentários…</div></div>'+
      '  <div class="fb-modal-divider"></div>'+
      '  <form class="fb-form" data-fb-form>'+
      '    <div class="fb-field">'+
      '      <label>Nome</label>'+
      '      <input class="fb-input" name="name" required maxlength="80" value="'+escapeHtml(savedName)+'" placeholder="Seu nome">'+
      '    </div>'+
      '    <div class="fb-field">'+
      '      <label>Email (opcional)</label>'+
      '      <input class="fb-input" name="email" type="email" maxlength="120" value="'+escapeHtml(savedEmail)+'" placeholder="para retornarmos, se necessário">'+
      '    </div>'+
      '    <div class="fb-field">'+
      '      <label>Comentário</label>'+
      '      <textarea class="fb-textarea" name="body" required maxlength="2000" placeholder="O que você gostaria de mudar nesta dobra?"></textarea>'+
      '    </div>'+
      '    <div class="fb-actions">'+
      '      <button type="button" class="fb-btn fb-btn-secondary" data-fb-cancel>Cancelar</button>'+
      '      <button type="submit" class="fb-btn fb-btn-primary" data-fb-submit>Enviar comentário</button>'+
      '    </div>'+
      '    <div data-fb-status></div>'+
      '  </form>'+
      '</div>';

    modalRoot.hidden = false;
    document.body.style.overflow = 'hidden';

    modalRoot.querySelector('.fb-modal-close').addEventListener('click', closeModal);
    modalRoot.querySelector('[data-fb-cancel]').addEventListener('click', closeModal);

    var form = modalRoot.querySelector('[data-fb-form]');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      submitComment(commentId, form);
    });

    // carrega comentários existentes
    loadCommentsList(commentId);
  }

  function closeModal(){
    if (!modalRoot) return;
    modalRoot.hidden = true;
    document.body.style.overflow = '';
  }

  function loadCommentsList(commentId){
    var list = modalRoot.querySelector('[data-fb-list]');
    if (!configured){
      list.innerHTML = '<div class="fb-comment-empty">— Supabase ainda não configurado · seu comentário não será salvo. Veja FEEDBACK_SETUP.md.</div>';
      return;
    }
    sbGet(commentId).then(function(rows){
      if (!rows || !rows.length){
        list.innerHTML = '<div class="fb-comment-empty">Seja o primeiro a comentar nesta dobra.</div>';
        return;
      }
      list.innerHTML = rows.map(function(c){
        return '<div class="fb-comment">'+
          '<div class="fb-comment-meta"><strong>'+escapeHtml(c.author_name||'Anônimo')+'</strong><span>'+fmtDate(c.created_at)+'</span></div>'+
          '<div>'+escapeHtml(c.body||'').replace(/\n/g,'<br>')+'</div>'+
          '</div>';
      }).join('');
    });
  }

  function submitComment(commentId, form){
    var data = new FormData(form);
    // Captura label legível do elemento commentável (para dashboard)
    var node = document.querySelector('[data-comment-id="'+commentId+'"]');
    var label = node ? (node.getAttribute('data-comment-label') || commentId) : commentId;
    var payload = {
      page: pageKey(),
      element_id: commentId,
      element_label: label,
      author_name: (data.get('name')||'').trim(),
      author_email: (data.get('email')||'').trim() || null,
      body: (data.get('body')||'').trim()
    };
    if (!payload.author_name || !payload.body) return;

    var statusEl = form.querySelector('[data-fb-status]');
    var submitBtn = form.querySelector('[data-fb-submit]');
    statusEl.innerHTML = '<div class="fb-status fb-status-loading">Enviando…</div>';
    submitBtn.disabled = true;

    // persistir nome/email pra próxima
    ls('fb-name', payload.author_name);
    if (payload.author_email) ls('fb-email', payload.author_email);

    sbPost(payload).then(function(){
      statusEl.innerHTML = '<div class="fb-status fb-status-ok">Obrigado. Comentário registrado.</div>';
      form.querySelector('[name="body"]').value = '';
      loadCommentsList(commentId);
      refreshAllCounts();
      setTimeout(function(){ closeModal(); }, 1200);
    }).catch(function(err){
      submitBtn.disabled = false;
      if (!configured){
        statusEl.innerHTML = '<div class="fb-status fb-status-err">Supabase ainda não configurado. Veja FEEDBACK_SETUP.md.</div>';
      } else {
        statusEl.innerHTML = '<div class="fb-status fb-status-err">Falha ao enviar. Verifique conexão. ('+escapeHtml(err.message||'erro')+')</div>';
      }
    });
  }

  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }

  // ====================================================
  // BANNER DE STATUS (canto inferior direito)
  // ====================================================
  function injectBanner(){
    if (document.querySelector('.fb-banner')) return;
    var banner = el('div', { 'class': 'fb-banner' });
    var dotClass = configured ? '' : 'is-offline';
    banner.innerHTML = ''+
      '<span class="fb-banner-dot '+dotClass+'"></span>'+
      '<span>'+(configured ? 'Modo revisão · clique no <strong>+</strong> em cada dobra' : 'Widget pronto · Supabase pendente')+'</span>';
    document.body.appendChild(banner);
  }

  // ====================================================
  // INIT
  // ====================================================
  function init(){
    if (document.body.classList.contains('fb-off')) return;
    // injeta CSS se ainda não estiver carregado
    if (!document.querySelector('link[href*="feedback.css"]')){
      var prefix = document.body.getAttribute('data-prefix') || '';
      var link = el('link', { 'rel':'stylesheet', 'href': prefix+'css/feedback.css' });
      document.head.appendChild(link);
    }
    injectPins();
    injectBanner();
    if (configured) refreshAllCounts();
    // observa mutações pra cobrir conteúdo injetado depois (nav/footer global)
    var obs = new MutationObserver(function(){ injectPins(); });
    obs.observe(document.body, { childList:true, subtree:true });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
