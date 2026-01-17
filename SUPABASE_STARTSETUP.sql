-- Criar a tabela de usuários com acesso permitido
create table public.usuarios_autorizados (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  nome text,
  empresa text default 'Minha Empresa',
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

-- Criar a tabela de clientes
create table public.clientes (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid not null,
  nome text not null,
  email text,
  telefone text not null,
  endereco text,
  cpf_cnpj text,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null,
  atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar o Row Level Security para clientes
alter table public.clientes enable row level security;

-- Criar uma política onde usuários podem ver clientes da sua empresa
create policy "Usuários podem ver clientes da sua empresa"
on public.clientes
for select
using (
  empresa_id in (
    select id from public.usuarios_autorizados 
    where email = auth.jwt() ->> 'email'
  )
);

-- Criar uma política para inserir clientes
create policy "Usuários podem criar clientes na sua empresa"
on public.clientes
for insert
with check (
  empresa_id in (
    select id from public.usuarios_autorizados 
    where email = auth.jwt() ->> 'email'
  )
);

-- Criar uma política para atualizar clientes
create policy "Usuários podem atualizar clientes da sua empresa"
on public.clientes
for update
using (
  empresa_id in (
    select id from public.usuarios_autorizados 
    where email = auth.jwt() ->> 'email'
  )
);

-- Criar uma política para deletar clientes
create policy "Usuários podem deletar clientes da sua empresa"
on public.clientes
for delete
using (
  empresa_id in (
    select id from public.usuarios_autorizados 
    where email = auth.jwt() ->> 'email'
  )
);

-- Criar a tabela de produtos
create table public.produtos (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid not null,
  nome text not null,
  descricao text,
  preco numeric(10, 2) not null,
  categoria text not null,
  unidade_medida text not null,
  criado_em timestamp with time zone default timezone('utc'::text, now()) not null,
  atualizado_em timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar o Row Level Security para produtos
alter table public.produtos enable row level security;

-- Criar uma política onde usuários podem ver produtos da sua empresa
create policy "Usuários podem ver produtos da sua empresa"
on public.produtos
for select
using (
  empresa_id in (
    select id from public.usuarios_autorizados 
    where email = auth.jwt() ->> 'email'
  )
);

-- Criar uma política para inserir produtos
create policy "Usuários podem criar produtos na sua empresa"
on public.produtos
for insert
with check (
  empresa_id in (
    select id from public.usuarios_autorizados 
    where email = auth.jwt() ->> 'email'
  )
);

-- Criar uma política para atualizar produtos
create policy "Usuários podem atualizar produtos da sua empresa"
on public.produtos
for update
using (
  empresa_id in (
    select id from public.usuarios_autorizados 
    where email = auth.jwt() ->> 'email'
  )
);

-- Criar uma política para deletar produtos
create policy "Usuários podem deletar produtos da sua empresa"
on public.produtos
for delete
using (
  empresa_id in (
    select id from public.usuarios_autorizados 
    where email = auth.jwt() ->> 'email'
  )
);