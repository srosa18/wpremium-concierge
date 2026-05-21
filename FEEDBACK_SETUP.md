# Feedback Widget · Setup (Supabase)

5 passos para ativar o widget de comentários do cliente. Tempo: ~5 minutos.

---

## 1. Criar projeto Supabase (grátis)

1. Acesse https://supabase.com e faça login (Google, GitHub ou email)
2. **New project** → escolha um nome (ex: `wpremium-feedback`)
3. Region: **South America (São Paulo)** se disponível, senão US East
4. Defina uma senha do banco (vai precisar) e salve no seu gerenciador
5. Espere ~1 minuto enquanto provisiona

---

## 2. Criar a tabela `comments`

No painel do projeto, vá em **SQL Editor** (menu lateral) → **New query** → cole o SQL abaixo e clique em **Run**:

```sql
-- Tabela de comentários do wireframe
create table public.comments (
  id          uuid primary key default gen_random_uuid(),
  page        text not null,
  element_id  text not null,
  author_name text not null,
  author_email text,
  body        text not null,
  status      text default 'open',
  created_at  timestamptz default now()
);

-- Index para queries rápidas
create index comments_page_element_idx on public.comments (page, element_id);
create index comments_created_idx on public.comments (created_at desc);

-- Row-Level Security: permite inserir e ler comentários sem auth
alter table public.comments enable row level security;

create policy "Anyone can insert comments"
  on public.comments for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can read comments"
  on public.comments for select
  to anon, authenticated
  using (true);
```

Esperado: mensagem verde "Success. No rows returned."

---

## 3. Copiar credenciais públicas

No painel do projeto, vá em **Settings** → **API** (menu lateral).

Copie dois valores:

- **Project URL** (ex: `https://abcdefgh.supabase.co`)
- **anon / public** key (chave longa começando com `eyJ...`)

> Essas duas são chaves **públicas** — podem ficar no JS do front sem problema. NÃO use a `service_role` aqui.

---

## 4. Colar no `js/feedback.js`

Abra o arquivo `js/feedback.js` (ou me passe os valores e eu colo).

Localize as duas primeiras linhas dentro da função, logo no início:

```js
var SUPABASE_URL = 'CHANGE_ME_PROJECT_URL';
var SUPABASE_ANON_KEY = 'CHANGE_ME_ANON_KEY';
```

Substitua pelos valores que você copiou:

```js
var SUPABASE_URL = 'https://abcdefgh.supabase.co';
var SUPABASE_ANON_KEY = 'eyJ...';
```

Salve.

---

## 5. Commit e push

```bash
git add js/feedback.js
git commit -m "Feedback widget · plug Supabase credentials"
git push
```

GitHub Pages atualiza em ~2 minutos. Pronto.

---

## Como ver os comentários

No painel Supabase, vá em **Table Editor** → `comments`. Você vê todos os comentários organizados em tabela, com filtros e busca.

Para exportar como CSV: **⋮** (três pontos) no canto superior direito da tabela → **Export to CSV**.

Você também pode rodar SQL livre no **SQL Editor**:

```sql
-- Comentários da home, agrupados por dobra
select element_id, count(*) as total, max(created_at) as ultimo
from comments
where page = 'index'
group by element_id
order by total desc;

-- Tudo de um cliente específico
select * from comments where author_email = 'cliente@empresa.com' order by created_at desc;

-- Comentários abertos (não resolvidos)
select * from comments where status = 'open' order by created_at;
```

---

## Como esconder o widget

- **Permanente:** comente as duas linhas `<script src="js/feedback.js"></script>` nos HTMLs
- **Temporário (URL):** acesse com `?fb=off` no fim da URL — esconde só naquela aba
- **Para tirar screenshot:** adicione classe `fb-off` no `<body>` via DevTools

---

## Quanto custa

**R$ 0**. O free tier do Supabase comporta:
- 500 MB de banco
- 5 GB de transferência/mês
- 50.000 usuários ativos/mês (não usamos auth, então N/A)
- 2 projetos ativos

Comentários ocupam ~1 KB cada. 500 MB = ~500.000 comentários. Para um wireframe sendo revisado por dezenas de pessoas: zero risco de estourar.

---

## v2 · Quando virar produto

Quando isso virar um produto recorrente (ferramenta de review para vários projetos), adicionar:

- Auth com magic link (Supabase já tem nativo)
- Multi-tenancy (`project_id` na tabela)
- Status workflow (open → in-review → resolved → archived)
- Threading (reply)
- Notificações por email (Supabase Functions ou Resend)
- Dashboard admin com filtros, tags, export rico
- Modo "screenshot annotation" (cliente desenha em cima da página)

Por enquanto, o MVP entrega o essencial: cliente comenta, você consolida.
