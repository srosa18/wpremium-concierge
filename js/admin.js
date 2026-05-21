/* ============================================
   ADMIN DASHBOARD · W Premium Concierge
   Painel de revisão de comentários · Supabase REST

   Setup:
   1. Crie projeto Supabase + tabela (FEEDBACK_SETUP.md)
   2. Cole abaixo URL + anon key
   3. Defina ADMIN_PASSWORD (use uma senha forte)

   ⚠ Senha hardcoded — wireframe-only. Em produção, usar Supabase Auth.
   ============================================ */

(function(){
  'use strict';

  // ====================================================
  // CONFIG
  // ====================================================
  var SUPABASE_URL      = 'https://itwaxivhuxtnatjuoebe.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_ZaeXpY-CMCeKEiFBptBxyg_7SxsMUI-';
  var ADMIN_PASSWORD    = 'wpremium2026';
  var TABLE             = 'comments';

  var configured = SUPABASE_URL.indexOf('CHANGE_ME') !== 0 && SUPABASE_ANON_KEY.indexOf('CHANGE_ME') !== 0;

  // ====================================================
  // STATE
  // ====================================================
  var state = {
    comments: [],
    view: 'author', // 'author' | 'fold' | 'list'
    filters: { status: 'all', author: '', page: 'all', q: '' },
    expanded: {} // key → boolean
  };

  // ====================================================
  // HELPERS
  // ====================================================
  function $(s, root){ return (root||document).querySelector(s); }
  function $$(s, root){ return Array.from((root||document).querySelectorAll(s)); }
  function el(tag, attrs, html){
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function(k){
      if (k === 'class') e.className = attrs[k];
      else if (k.indexOf('on') === 0) e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function fmtDate(iso){
    if (!iso) return '';
    var d = new Date(iso);
    var dd = String(d.getDate()).padStart(2,'0');
    var mm = String(d.getMonth()+1).padStart(2,'0');
    var yy = String(d.getFullYear()).slice(2);
    var hh = String(d.getHours()).padStart(2,'0');
    var mi = String(d.getMinutes()).padStart(2,'0');
    return dd+'/'+mm+'/'+yy+' '+hh+':'+mi;
  }
  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c];
    });
  }
  function toast(msg){
    var t = $('.adm-toast') || document.body.appendChild(el('div', { 'class':'adm-toast' }));
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._tid);
    t._tid = setTimeout(function(){ t.classList.remove('show'); }, 2600);
  }

  // ====================================================
  // SUPABASE REST
  // ====================================================
  function sbHeaders(){
    return {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer '+SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
  }
  function sbFetchAll(){
    if (!configured) return Promise.resolve([]);
    var url = SUPABASE_URL+'/rest/v1/'+TABLE+'?order=created_at.desc&limit=1000';
    return fetch(url, { headers: sbHeaders() })
      .then(function(r){ return r.ok ? r.json() : []; })
      .catch(function(){ return []; });
  }
  function sbPatch(id, payload){
    if (!configured) return Promise.reject(new Error('not configured'));
    var url = SUPABASE_URL+'/rest/v1/'+TABLE+'?id=eq.'+encodeURIComponent(id);
    var h = sbHeaders();
    h['Prefer'] = 'return=representation';
    return fetch(url, { method:'PATCH', headers:h, body: JSON.stringify(payload) })
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); });
  }
  function sbDelete(id){
    if (!configured) return Promise.reject(new Error('not configured'));
    var url = SUPABASE_URL+'/rest/v1/'+TABLE+'?id=eq.'+encodeURIComponent(id);
    return fetch(url, { method:'DELETE', headers: sbHeaders() })
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); });
  }

  // ====================================================
  // AUTH
  // ====================================================
  function isLogged(){ return sessionStorage.getItem('adm-auth') === '1'; }
  function login(pass){
    if (pass === ADMIN_PASSWORD){
      sessionStorage.setItem('adm-auth','1');
      return true;
    }
    return false;
  }
  function logout(){
    sessionStorage.removeItem('adm-auth');
    location.reload();
  }

  // ====================================================
  // RENDER · login
  // ====================================================
  function renderLogin(){
    document.body.innerHTML = ''+
      '<div class="adm-login">'+
      '  <div class="adm-login-card">'+
      '    <div class="adm-brand">W Premium <span>· Admin Dashboard</span></div>'+
      '    <h1>Acesso restrito</h1>'+
      '    <p>Painel de revisão de comentários do wireframe. Digite a senha de administrador.</p>'+
      '    <form id="login-form">'+
      '      <input type="password" name="pass" class="fb-input" placeholder="Senha" autofocus required>'+
      '      <button type="submit" class="adm-btn adm-btn-primary" style="height:44px;font-size:13px;">Entrar →</button>'+
      '      <div id="login-error" style="font-size:12px;color:#c1594a;display:none;margin-top:8px;"></div>'+
      '    </form>'+
      '  </div>'+
      '</div>';
    var f = $('#login-form');
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var pass = new FormData(f).get('pass');
      if (login(pass)) { boot(); }
      else { $('#login-error').textContent = 'Senha incorreta.'; $('#login-error').style.display='block'; }
    });
  }

  // ====================================================
  // RENDER · shell (sidebar + main)
  // ====================================================
  function renderShell(){
    document.body.innerHTML = ''+
      '<div class="adm-shell">'+
      '  <aside class="adm-side">'+
      '    <div class="adm-brand">W Premium <span>· Admin Dashboard</span></div>'+

      '    <div class="adm-filter">'+
      '      <h5>Visualização</h5>'+
      '      <div class="adm-view-tabs" id="view-tabs">'+
      '        <button data-view="author">Por autor <span class="pill" id="cnt-authors">0</span></button>'+
      '        <button data-view="fold">Por dobra <span class="pill" id="cnt-folds">0</span></button>'+
      '        <button data-view="list">Cronológico <span class="pill" id="cnt-total">0</span></button>'+
      '      </div>'+
      '    </div>'+

      '    <div class="adm-filter">'+
      '      <h5>Status</h5>'+
      '      <select id="filter-status">'+
      '        <option value="all">Todos</option>'+
      '        <option value="open">Abertos</option>'+
      '        <option value="reviewing">Em análise</option>'+
      '        <option value="done">Resolvidos</option>'+
      '        <option value="wontfix">Descartados</option>'+
      '      </select>'+
      '    </div>'+

      '    <div class="adm-filter">'+
      '      <h5>Autor</h5>'+
      '      <select id="filter-author"><option value="">Todos</option></select>'+
      '    </div>'+

      '    <div class="adm-filter">'+
      '      <h5>Página</h5>'+
      '      <select id="filter-page"><option value="all">Todas</option></select>'+
      '    </div>'+

      '    <div class="adm-filter">'+
      '      <h5>Buscar no texto</h5>'+
      '      <input type="text" id="filter-q" placeholder="palavra-chave…">'+
      '    </div>'+

      '    <div class="adm-side-footer">'+
      '      <button id="refresh">↻ Atualizar dados</button>'+
      '      <button id="export-csv">⬇ Export CSV</button>'+
      '      <button id="logout">→ Sair</button>'+
      '      <a href="index.html" style="color:var(--g700);text-decoration:underline;">↩ Voltar ao wireframe</a>'+
      '    </div>'+
      '  </aside>'+

      '  <main class="adm-main">'+
      '    <div class="adm-header">'+
      '      <div>'+
      '        <h1 id="view-title">Por autor</h1>'+
      '        <p class="sub" id="view-sub">Comentários agrupados pelo autor.</p>'+
      '      </div>'+
      '      <div class="adm-actions-bar">'+
      '        <button class="adm-btn" id="expand-all">Expandir tudo</button>'+
      '        <button class="adm-btn" id="collapse-all">Recolher tudo</button>'+
      '      </div>'+
      '    </div>'+

      '    <div class="adm-stats" id="stats"></div>'+

      '    <div id="content"></div>'+
      '  </main>'+
      '</div>';

    // events
    $('#view-tabs').addEventListener('click', function(e){
      var btn = e.target.closest('button[data-view]');
      if (!btn) return;
      state.view = btn.getAttribute('data-view');
      state.expanded = {};
      render();
    });
    $('#filter-status').addEventListener('change', function(e){ state.filters.status = e.target.value; render(); });
    $('#filter-author').addEventListener('change', function(e){ state.filters.author = e.target.value; render(); });
    $('#filter-page').addEventListener('change',   function(e){ state.filters.page = e.target.value; render(); });
    $('#filter-q').addEventListener('input',       function(e){ state.filters.q = e.target.value.toLowerCase(); render(); });
    $('#refresh').addEventListener('click', loadData);
    $('#export-csv').addEventListener('click', exportCSV);
    $('#logout').addEventListener('click', logout);
    $('#expand-all').addEventListener('click', function(){ expandAll(true); });
    $('#collapse-all').addEventListener('click', function(){ expandAll(false); });
  }

  function expandAll(open){
    var keys = state.view === 'author' ? uniqueAuthors() : (state.view === 'fold' ? uniqueFolds() : []);
    state.expanded = {};
    if (open) keys.forEach(function(k){ state.expanded[k] = true; });
    render();
  }

  // ====================================================
  // FILTERING + GROUPING
  // ====================================================
  function applyFilters(list){
    var f = state.filters;
    return list.filter(function(c){
      if (f.status !== 'all' && c.status !== f.status) return false;
      if (f.author && c.author_email !== f.author && c.author_name !== f.author) return false;
      if (f.page !== 'all' && c.page !== f.page) return false;
      if (f.q){
        var blob = (c.body+' '+c.author_name+' '+c.element_label+' '+(c.reply_admin||'')).toLowerCase();
        if (blob.indexOf(f.q) < 0) return false;
      }
      return true;
    });
  }

  function uniqueAuthors(){
    var seen = {};
    state.comments.forEach(function(c){
      var k = c.author_email || c.author_name;
      seen[k] = true;
    });
    return Object.keys(seen);
  }
  function uniqueFolds(){
    var seen = {};
    state.comments.forEach(function(c){ seen[c.page+'·'+c.element_id] = true; });
    return Object.keys(seen);
  }

  function groupByAuthor(list){
    var map = {};
    list.forEach(function(c){
      var k = c.author_email || c.author_name;
      if (!map[k]) map[k] = { name: c.author_name, email: c.author_email, items: [] };
      map[k].items.push(c);
    });
    return Object.keys(map).map(function(k){ return { key:k, ...map[k] }; })
      .sort(function(a,b){ return b.items.length - a.items.length; });
  }

  function groupByFold(list){
    var map = {};
    list.forEach(function(c){
      var k = c.page+'·'+c.element_id;
      if (!map[k]) map[k] = { label: c.element_label || c.element_id, page: c.page, items: [] };
      map[k].items.push(c);
    });
    return Object.keys(map).map(function(k){ return { key:k, ...map[k] }; })
      .sort(function(a,b){ return b.items.length - a.items.length; });
  }

  // ====================================================
  // RENDER · main content
  // ====================================================
  function render(){
    if (!isLogged()) return renderLogin();
    if (!$('.adm-shell')) renderShell();

    // populate selects
    populateFilters();

    // counters
    var all = state.comments;
    $('#cnt-total').textContent   = all.length;
    $('#cnt-authors').textContent = uniqueAuthors().length;
    $('#cnt-folds').textContent   = uniqueFolds().length;

    // active tab
    $$('#view-tabs button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-view') === state.view);
    });

    // title
    var titles = {
      author: { t:'Por autor',    s:'Comentários agrupados pelo autor que escreveu.' },
      fold:   { t:'Por dobra',    s:'Comentários agrupados por dobra de conteúdo (seção/card/headline).' },
      list:   { t:'Cronológico',  s:'Lista corrida do mais recente ao mais antigo.' }
    };
    $('#view-title').textContent = titles[state.view].t;
    $('#view-sub').textContent   = titles[state.view].s;

    // stats
    renderStats(all);

    // content
    var filtered = applyFilters(all);
    var content = $('#content');
    content.innerHTML = '';

    if (!filtered.length) {
      content.appendChild(emptyState());
      return;
    }

    if (state.view === 'author')      renderGroupView(content, groupByAuthor(filtered), 'author');
    else if (state.view === 'fold')   renderGroupView(content, groupByFold(filtered), 'fold');
    else                              renderListView(content, filtered);
  }

  function renderStats(list){
    var byStatus = { open:0, reviewing:0, done:0, wontfix:0 };
    list.forEach(function(c){ if (byStatus[c.status] !== undefined) byStatus[c.status]++; });
    var html = ''+
      '<div class="adm-stat"><div class="adm-stat-num">'+list.length+'</div><div class="adm-stat-label">Total</div></div>'+
      '<div class="adm-stat is-open"><div class="adm-stat-num">'+byStatus.open+'</div><div class="adm-stat-label">Abertos</div></div>'+
      '<div class="adm-stat"><div class="adm-stat-num">'+byStatus.reviewing+'</div><div class="adm-stat-label">Em análise</div></div>'+
      '<div class="adm-stat is-done"><div class="adm-stat-num">'+byStatus.done+'</div><div class="adm-stat-label">Resolvidos</div></div>'+
      '<div class="adm-stat"><div class="adm-stat-num">'+byStatus.wontfix+'</div><div class="adm-stat-label">Descartados</div></div>';
    $('#stats').innerHTML = html;
  }

  function populateFilters(){
    var authors = {};
    var pages = {};
    state.comments.forEach(function(c){
      var akey = c.author_email || c.author_name;
      authors[akey] = c.author_name + (c.author_email ? ' ('+c.author_email+')' : '');
      pages[c.page] = true;
    });

    var sel = $('#filter-author');
    if (sel && sel.options.length <= 1){
      Object.keys(authors).sort().forEach(function(k){
        var o = document.createElement('option');
        o.value = k; o.textContent = authors[k];
        sel.appendChild(o);
      });
    }

    var selP = $('#filter-page');
    if (selP && selP.options.length <= 1){
      Object.keys(pages).sort().forEach(function(k){
        var o = document.createElement('option');
        o.value = k; o.textContent = k;
        selP.appendChild(o);
      });
    }
  }

  function emptyState(){
    var msg = state.comments.length
      ? { title:'Nenhum comentário com esses filtros', body:'Tente limpar os filtros ou trocar a visualização.' }
      : (configured
        ? { title:'Nenhum comentário ainda', body:'Compartilhe o link do wireframe e aguarde o primeiro feedback.' }
        : { title:'Supabase não configurado', body:'Veja FEEDBACK_SETUP.md para plugar URL + anon key em js/admin.js.' }
      );
    var d = el('div', { 'class':'adm-empty' });
    d.innerHTML = '<h3>'+escapeHtml(msg.title)+'</h3><p>'+escapeHtml(msg.body)+'</p>';
    return d;
  }

  function renderGroupView(root, groups, type){
    groups.forEach(function(g){
      var open = state.expanded[g.key] === true;
      var counts = countByStatus(g.items);

      var headHTML;
      if (type === 'author'){
        headHTML = ''+
          '<div>'+
          '  <h3>'+escapeHtml(g.name)+'</h3>'+
          '  <div class="meta">'+(g.email ? escapeHtml(g.email)+' · ' : '')+g.items.length+' comentário(s) em '+countDistinctFolds(g.items)+' dobra(s)</div>'+
          '</div>'+
          '<div class="group-counts">'+
            (counts.open      ? '<span class="count-badge is-open">'+counts.open+' aberto(s)</span>' : '')+
            (counts.reviewing ? '<span class="count-badge">'+counts.reviewing+' em análise</span>' : '')+
            (counts.done      ? '<span class="count-badge is-done">'+counts.done+' resolvido(s)</span>' : '')+
            '<span class="chevron">▾</span>'+
          '</div>';
      } else {
        headHTML = ''+
          '<div>'+
          '  <h3>'+escapeHtml(g.label)+'</h3>'+
          '  <div class="meta">'+escapeHtml(g.page)+' · '+g.items.length+' comentário(s) de '+countDistinctAuthors(g.items)+' autor(es)</div>'+
          '</div>'+
          '<div class="group-counts">'+
            (counts.open      ? '<span class="count-badge is-open">'+counts.open+' aberto(s)</span>' : '')+
            (counts.reviewing ? '<span class="count-badge">'+counts.reviewing+' em análise</span>' : '')+
            (counts.done      ? '<span class="count-badge is-done">'+counts.done+' resolvido(s)</span>' : '')+
            '<span class="chevron">▾</span>'+
          '</div>';
      }

      var card = el('div', { 'class':'adm-group'+(open?' is-open':'') });
      var head = el('div', { 'class':'adm-group-head', html: headHTML });
      head.innerHTML = headHTML;
      head.addEventListener('click', function(e){
        if (e.target.closest('.adm-btn')) return;
        state.expanded[g.key] = !state.expanded[g.key];
        render();
      });
      card.appendChild(head);

      var body = el('div', { 'class':'adm-group-body' });
      g.items.forEach(function(c){ body.appendChild(renderComment(c, type)); });
      card.appendChild(body);

      root.appendChild(card);
    });
  }

  function renderListView(root, list){
    var card = el('div', { 'class':'adm-group is-open' });
    var body = el('div', { 'class':'adm-group-body' });
    list.forEach(function(c){ body.appendChild(renderComment(c, 'list')); });
    card.appendChild(body);
    root.appendChild(card);
  }

  function renderComment(c, type){
    var wrap = el('div', { 'class':'adm-comment' });
    var main = el('div', { 'class':'adm-comment-main' });

    var headHtml = '';
    if (type === 'author' || type === 'list'){
      headHtml += '<span class="label">'+escapeHtml(c.element_label||c.element_id)+'</span>';
    }
    if (type === 'fold' || type === 'list'){
      if (headHtml) headHtml += '<span class="sep">·</span>';
      headHtml += '<span class="author"><strong>'+escapeHtml(c.author_name)+'</strong>'+(c.author_email?' &lt;'+escapeHtml(c.author_email)+'&gt;':'')+'</span>';
    }
    headHtml += '<span class="sep">·</span><span>'+fmtDate(c.created_at)+'</span>';
    headHtml += '<span class="sep">·</span>';
    headHtml += '<span class="adm-status '+c.status+'">'+statusLabel(c.status)+'</span>';

    var head = el('div', { 'class':'adm-comment-head', html: headHtml });
    head.innerHTML = headHtml;
    main.appendChild(head);

    var body = el('div', { 'class':'adm-comment-body' });
    body.textContent = c.body;
    main.appendChild(body);

    if (c.reply_admin){
      var reply = el('div', { 'class':'adm-comment-reply' });
      reply.innerHTML = '<strong>Resposta interna</strong>'+escapeHtml(c.reply_admin).replace(/\n/g,'<br>');
      main.appendChild(reply);
    }

    var actions = el('div', { 'class':'adm-comment-actions' });
    actions.innerHTML = ''+
      (c.status !== 'done'      ? '<button class="adm-btn" data-act="done">✓ Resolver</button>' : '')+
      (c.status !== 'reviewing' && c.status !== 'done' ? '<button class="adm-btn" data-act="reviewing">Em análise</button>' : '')+
      (c.status === 'done'      ? '<button class="adm-btn" data-act="open">Reabrir</button>' : '')+
      '<button class="adm-btn" data-act="reply">📝 Responder</button>'+
      '<button class="adm-btn adm-btn-icon" data-act="open-link" title="Ver no wireframe">↗</button>'+
      '<button class="adm-btn adm-btn-icon adm-btn-danger" data-act="delete" title="Excluir">✕</button>';

    actions.addEventListener('click', function(e){
      var btn = e.target.closest('button[data-act]');
      if (!btn) return;
      var act = btn.getAttribute('data-act');
      if (act === 'done')      return updateComment(c.id, { status:'done' });
      if (act === 'reviewing') return updateComment(c.id, { status:'reviewing' });
      if (act === 'open')      return updateComment(c.id, { status:'open' });
      if (act === 'reply')     return showReplyEditor(main, c);
      if (act === 'open-link') return openInWireframe(c);
      if (act === 'delete')    return deleteComment(c.id);
    });

    wrap.appendChild(main);
    wrap.appendChild(actions);
    return wrap;
  }

  function showReplyEditor(parent, c){
    if (parent.querySelector('.adm-reply-editor')) return;
    var ed = el('div', { 'class':'adm-reply-editor' });
    ed.innerHTML = ''+
      '<textarea placeholder="Resposta interna (visível só no admin)…">'+escapeHtml(c.reply_admin||'')+'</textarea>'+
      '<div class="adm-reply-editor-actions">'+
      '  <button class="adm-btn" data-act="cancel">Cancelar</button>'+
      '  <button class="adm-btn adm-btn-primary" data-act="save">Salvar</button>'+
      '</div>';
    parent.appendChild(ed);
    ed.querySelector('textarea').focus();
    ed.addEventListener('click', function(e){
      var b = e.target.closest('button');
      if (!b) return;
      if (b.getAttribute('data-act') === 'cancel'){ ed.remove(); return; }
      if (b.getAttribute('data-act') === 'save'){
        var txt = ed.querySelector('textarea').value.trim();
        updateComment(c.id, { reply_admin: txt });
      }
    });
  }

  function openInWireframe(c){
    var url = c.page+'.html';
    var anchor = '#'+c.element_id.replace(/\./g,'-');
    window.open(url+anchor, '_blank');
  }

  function updateComment(id, patch){
    sbPatch(id, patch).then(function(){
      toast('Salvo.');
      loadData();
    }).catch(function(){ toast('Erro ao salvar — verifique conexão.'); });
  }

  function deleteComment(id){
    if (!confirm('Excluir este comentário definitivamente?')) return;
    sbDelete(id).then(function(){
      toast('Comentário excluído.');
      loadData();
    }).catch(function(){ toast('Erro ao excluir.'); });
  }

  function statusLabel(s){
    return { open:'Aberto', reviewing:'Em análise', done:'Resolvido', wontfix:'Descartado' }[s] || s;
  }
  function countByStatus(items){
    var c = { open:0, reviewing:0, done:0, wontfix:0 };
    items.forEach(function(i){ if(c[i.status] !== undefined) c[i.status]++; });
    return c;
  }
  function countDistinctFolds(items){
    var s = {}; items.forEach(function(i){ s[i.element_id] = 1; }); return Object.keys(s).length;
  }
  function countDistinctAuthors(items){
    var s = {}; items.forEach(function(i){ s[i.author_email||i.author_name] = 1; }); return Object.keys(s).length;
  }

  // ====================================================
  // EXPORT CSV
  // ====================================================
  function exportCSV(){
    var rows = applyFilters(state.comments);
    if (!rows.length) { toast('Nada para exportar.'); return; }
    var head = ['data','autor','email','pagina','dobra_id','dobra_label','status','prioridade','comentario','resposta_interna'];
    var csv = head.join(';') + '\r\n';
    rows.forEach(function(c){
      var line = [
        fmtDate(c.created_at),
        c.author_name,
        c.author_email||'',
        c.page,
        c.element_id,
        c.element_label||'',
        c.status,
        c.priority||'normal',
        (c.body||'').replace(/[\r\n]+/g,' / '),
        (c.reply_admin||'').replace(/[\r\n]+/g,' / ')
      ].map(function(v){ return '"'+String(v).replace(/"/g,'""')+'"'; });
      csv += line.join(';') + '\r\n';
    });
    var blob = new Blob(['﻿'+csv], { type:'text/csv;charset=utf-8' });
    var a = el('a', { href: URL.createObjectURL(blob), download: 'wpremium-feedback-'+(new Date().toISOString().slice(0,10))+'.csv' });
    document.body.appendChild(a); a.click(); a.remove();
    toast('CSV exportado · '+rows.length+' linha(s).');
  }

  // ====================================================
  // LOAD + BOOT
  // ====================================================
  function loadData(){
    return sbFetchAll().then(function(rows){
      state.comments = rows;
      render();
    });
  }
  function boot(){
    if (!isLogged()) return renderLogin();
    renderShell();
    loadData();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
