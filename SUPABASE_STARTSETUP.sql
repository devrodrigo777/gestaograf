-- Criar a tabela de usuários com acesso permitido
create table public.usuarios_autorizados (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  nome text,
  plano text default 'premium',
  ativo boolean default true,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar o Row Level Security (Segurança a nível de linha)
alter table public.usuarios_autorizados enable row level security;

-- Criar uma política onde apenas o próprio usuário pode ler seus dados (opcional)
create policy "Usuários podem ver seus próprios dados de acesso"
on public.usuarios_autorizados
for select
using (auth.jwt() ->> 'email' = email);