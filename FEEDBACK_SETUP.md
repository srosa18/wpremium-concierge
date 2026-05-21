# Feedback Widget · Setup (Supabase + Admin Dashboard)

Configura o backend Supabase para receber comentários do wireframe e ativar
o painel administrativo (`/admin.html`).

**Tempo total:** ~10 minutos.

---

## 1. Criar projeto Supabase (grátis)

1. Acesse https://supabase.com e faça login (Google, GitHub ou email).
2. **New project** → nome `wpremium-feedback`.
3. Region: **South America (São Paulo)** se disponível.
4. Defina uma senha do banco (anote em local seguro).
5. Aguarde ~1 minuto enquanto provisiona.

---

## 2. Criar tabela, indexes, policies e views

No painel: **SQL Editor** → **New query** → cole o SQL abaixo → **Run**.

```sql
-- ============================================
-- TABELA · comments
-- ============================================
create table public.comments (
  id              uuid primary key default gen_random_uuid(),

  -- Onde foi comentado
  page            text not null,
  element_id      text not null,
  element_label   text,

  -- Quem comentou
  author_name     text not null,
  author_email    text,

  -- O conteúdo
  body            text not null,

  -- Workflow (você gerencia no admin)
  status          text default 'open'
                  check (status in ('open','reviewing','done','wontfix')),
  priority        text default 'normal'
                  check (priority in ('low','normal','high')),
  reply_admin     text,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Indexes para consultas frequentes
create index comments_author_idx   on comments (author_email);
create index comments_page_idx     on comments (page);
create index comments_status_idx   on comments (status);
create index comments_element_idx  on comments (page, element_id);
create index comments_created_idx  on comments (created_at desc);

-- ============================================
-- TRIGGER · auto-update updated_at
-- ============================================
create or replace function update_comments_timestamp()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger comments_updated_at
  before update on comments
  for each row execute function update_comments_timestamp();

-- ============================================
-- RLS · policies (modo MVP)
-- ============================================
alter table public.comments enable row level security;

-- Qualquer um pode inserir comentário (do widget público)
create policy "Anyone can insert" on comments
  for insert to anon, authenticated with check (true);

-- Qualquer um pode ler (necessário pro admin dashboard ver tudo)
create policy "Anyone can read" on comments
  for select to anon, authenticated using (true);

-- Qualquer um pode atualizar (necessário pro admin marcar como resolved)
-- ⚠ Em produção, troque por policy autenticada com role admin
create policy "Anyone can update" on comments
  for update to anon, authenticated using (true) with check (true);

-- Qualquer um pode deletar (necessário pro admin excluir comentários)
-- ⚠ Em produção, troque por policy autenticada com role admin
create policy "Anyone can delete" on comments
  for delete to anon, authenticated using (true);

-- ============================================
-- VIEWS · consolidações prontas
-- ============================================

-- View 1: comentários agrupados por autor
create or replace view comments_by_author as
select
  author_name,
  author_email,
  count(*)                                         as total,
  count(*) filter (where status = 'open')          as abertos,
  count(*) filter (where status = 'reviewing')     as em_analise,
  count(*) filter (where status = 'done')          as resolvidos,
  count(*) filter (where status = 'wontfix')       as descartados,
  count(distinct page)                             as paginas_tocadas,
  count(distinct element_id)                       as dobras_tocadas,
  min(created_at)                                  as primeiro_comentario,
  max(created_at)                                  as ultimo_comentario
from comments
group by author_name, author_email
order by total desc;

-- View 2: comentários agrupados por dobra de conteúdo
create or replace view comments_by_fold as
select
  page,
  element_id,
  element_label,
  count(*)                                         as total,
  count(distinct author_email)                     as autores_distintos,
  string_agg(distinct author_name, ', ')           as quem_comentou,
  count(*) filter (where status = 'open')          as abertos,
  count(*) filter (where status = 'done')          as resolvidos,
  max(created_at)                                  as ultimo_comentario
from comments
group by page, element_id, element_label
order by total desc;

-- View 3: lista cronológica completa (matriz autor × dobra)
create or replace view comments_matrix as
select
  c.id,
  c.author_name,
  c.author_email,
  c.element_label,
  c.element_id,
  c.page,
  c.body,
  c.status,
  c.priority,
  c.reply_admin,
  c.created_at,
  c.updated_at
from comments c
order by c.created_at desc;
```

Esperado: **Success. No rows returned.**

---

## 3. Copiar credenciais

**Settings** → **API** (menu lateral) → copie:

- **Project URL** (ex: `https://abcdefgh.supabase.co`)
- **anon / public** key (chave longa começando com `eyJ...`)

> Essas duas são chaves **públicas** — seguras pro JS do front. NÃO use a `service_role` aqui.

---

## 4. Plugar as credenciais no projeto

Abra `js/feedback.js` E `js/admin.js`. Em ambos, troque:

```js
var SUPABASE_URL      = 'CHANGE_ME_PROJECT_URL';
var SUPABASE_ANON_KEY = 'CHANGE_ME_ANON_KEY';
```

por:

```js
var SUPABASE_URL      = 'https://abcdefgh.supabase.co';
var SUPABASE_ANON_KEY = 'eyJ...';
```

---

## 5. Configurar senha do admin

Em `js/admin.js`, troque a senha padrão:

```js
var ADMIN_PASSWORD = 'wpremium2026';
```

Escolha uma senha forte. **Não compartilhe com o cliente** — só você e a equipe interna entram no `/admin.html`.

---

## 6. Commit e push

```bash
git add js/feedback.js js/admin.js
git commit -m "Feedback widget · plug Supabase credentials"
git push
```

GitHub Pages atualiza em ~2 minutos. Pronto.

---

## 🖥️ Como usar o Admin Dashboard

Acesse `https://srosa18.github.io/wpremium-concierge/admin.html`

1. Digite a senha
2. Você vê 3 modos de visualização:
   - **Por autor** (Maria → 14 comentários → lista expandida das dobras)
   - **Por dobra** (Home · Hero → 5 autores comentaram → lista expandida)
   - **Cronológico** (lista corrida do mais recente ao mais antigo)
3. Filtros laterais: status, autor, página
4. Ações por comentário: marcar resolvido, responder internamente, prioridade, copiar texto
5. Export CSV de qualquer visualização filtrada

---

## 📊 Consultas SQL úteis (SQL Editor)

Tudo abaixo roda direto no Supabase Studio se preferir SQL ao dashboard custom.

```sql
-- Resumo por autor
select * from comments_by_author;

-- Resumo por dobra
select * from comments_by_fold;

-- Lista cronológica de tudo
select * from comments_matrix limit 50;

-- Comentários de um autor específico
select element_label, body, status, created_at
from comments
where author_email = 'cliente@empresa.com'
order by created_at;

-- Comentários abertos por página
select page, count(*) as abertos
from comments
where status = 'open'
group by page
order by abertos desc;

-- Top 10 dobras mais comentadas
select element_label, count(*) as total
from comments
group by element_label
order by total desc
limit 10;
```

---

## 🛡️ Notas de segurança

**Estado atual (MVP):** RLS permite read/insert/update por anyone via anon key.

Isso é OK para um **wireframe de revisão interna** porque:
- Não tem dados sensíveis (PII real)
- O link é compartilhado apenas com cliente confiável
- A senha do `/admin.html` protege escrita pesada

**Quando virar produto recorrente**, troque:
- Policies de `update` por roles autenticadas (Supabase Auth)
- Senha hardcoded por magic link / SSO
- Adicionar `project_id` na tabela (multi-tenancy)

Por enquanto: simples e funcional.

---

## 🛑 Desligando o widget para apresentações

- **URL temporária:** adicione `?fb=off` no fim do link → some o widget e o banner
- **Permanente:** comente `<script src="js/feedback.js"></script>` no HTML
- **Por dispositivo:** abra console do navegador → `document.body.classList.add('fb-off')`

---

## 💸 Custo

**R$ 0**. O free tier do Supabase comporta:
- 500 MB DB · ~500.000 comentários
- 5 GB transferência/mês
- 2 projetos ativos

Para wireframe revisado por dezenas de pessoas: muito longe de estourar.
