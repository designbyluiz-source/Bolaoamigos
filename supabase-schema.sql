-- ============================================================
-- BOLÃO DOS BABES — Schema do Supabase
-- Cole tudo no "SQL Editor" do seu projeto e clique em RUN.
-- ============================================================

-- Tabela com os palpites de cada usuário (id = nome em minúsculas)
create table if not exists public.palpites (
  id   text primary key,
  data jsonb not null default '{}'::jsonb
);

-- Tabela de configuração: guarda os resultados oficiais, campeão,
-- edições de jogos e jogos de mata-mata (linha única id = 'resultados')
create table if not exists public.config (
  id   text primary key,
  data jsonb not null default '{}'::jsonb
);

-- ---------- Acesso público (bolão sem login) ----------
-- Ativa RLS e libera leitura/escrita para o papel "anon".
-- É um bolão entre amigos: simples de propósito. Se quiser restringir
-- depois, edite as políticas abaixo.

alter table public.palpites enable row level security;
alter table public.config   enable row level security;

drop policy if exists "palpites_public" on public.palpites;
create policy "palpites_public" on public.palpites
  for all using (true) with check (true);

drop policy if exists "config_public" on public.config;
create policy "config_public" on public.config
  for all using (true) with check (true);

-- Cria a linha de resultados vazia (se ainda não existir)
insert into public.config (id, data)
values ('resultados', '{}'::jsonb)
on conflict (id) do nothing;
