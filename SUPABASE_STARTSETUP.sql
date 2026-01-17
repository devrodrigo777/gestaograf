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


Ótimo! Vamos implementar os orçamentos. Essa é mais complexa porque envolve itens de orçamento e pagamentos. Vamos fazer passo a passo!
​

Passo 1: Estrutura das tabelas no Supabase
Primeiro, crie as tabelas necessárias:

sql
-- 1. Tabela de orçamentos
CREATE TABLE orcamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES usuarios_autorizados(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  status_producao TEXT NOT NULL DEFAULT 'waiting_approval',
  valido_ate TIMESTAMP WITH TIME ZONE NOT NULL,
  data_entrega TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de itens do orçamento
CREATE TABLE orcamentos_itens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES servicos(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  quantidade NUMERIC(10, 2) NOT NULL,
  largura NUMERIC(10, 2),
  altura NUMERIC(10, 2),
  preco_unitario NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de pagamentos
CREATE TABLE orcamentos_pagamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  orcamento_id UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  valor NUMERIC(10, 2) NOT NULL,
  metodo TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS nas três tabelas
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos_pagamentos ENABLE ROW LEVEL SECURITY;

-- 5. Políticas para ORCAMENTOS
CREATE POLICY "Usuários podem ver orçamentos da própria empresa"
  ON orcamentos FOR SELECT
  USING (
    empresa_id IN (
      SELECT id FROM usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Usuários podem criar orçamentos para própria empresa"
  ON orcamentos FOR INSERT
  WITH CHECK (
    empresa_id IN (
      SELECT id FROM usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Usuários podem atualizar orçamentos da própria empresa"
  ON orcamentos FOR UPDATE
  USING (
    empresa_id IN (
      SELECT id FROM usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Usuários podem deletar orçamentos da própria empresa"
  ON orcamentos FOR DELETE
  USING (
    empresa_id IN (
      SELECT id FROM usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- 6. Políticas para ITENS (herdam permissão do orçamento pai)
CREATE POLICY "Usuários podem ver itens dos próprios orçamentos"
  ON orcamentos_itens FOR SELECT
  USING (
    orcamento_id IN (
      SELECT id FROM orcamentos 
      WHERE empresa_id IN (
        SELECT id FROM usuarios_autorizados 
        WHERE email = auth.jwt() ->> 'email'
      )
    )
  );

CREATE POLICY "Usuários podem criar itens nos próprios orçamentos"
  ON orcamentos_itens FOR INSERT
  WITH CHECK (
    orcamento_id IN (
      SELECT id FROM orcamentos 
      WHERE empresa_id IN (
        SELECT id FROM usuarios_autorizados 
        WHERE email = auth.jwt() ->> 'email'
      )
    )
  );

CREATE POLICY "Usuários podem atualizar itens dos próprios orçamentos"
  ON orcamentos_itens FOR UPDATE
  USING (
    orcamento_id IN (
      SELECT id FROM orcamentos 
      WHERE empresa_id IN (
        SELECT id FROM usuarios_autorizados 
        WHERE email = auth.jwt() ->> 'email'
      )
    )
  );

CREATE POLICY "Usuários podem deletar itens dos próprios orçamentos"
  ON orcamentos_itens FOR DELETE
  USING (
    orcamento_id IN (
      SELECT id FROM orcamentos 
      WHERE empresa_id IN (
        SELECT id FROM usuarios_autorizados 
        WHERE email = auth.jwt() ->> 'email'
      )
    )
  );

-- 7. Políticas para PAGAMENTOS (herdam permissão do orçamento pai)
CREATE POLICY "Usuários podem ver pagamentos dos próprios orçamentos"
  ON orcamentos_pagamentos FOR SELECT
  USING (
    orcamento_id IN (
      SELECT id FROM orcamentos 
      WHERE empresa_id IN (
        SELECT id FROM usuarios_autorizados 
        WHERE email = auth.jwt() ->> 'email'
      )
    )
  );

CREATE POLICY "Usuários podem criar pagamentos nos próprios orçamentos"
  ON orcamentos_pagamentos FOR INSERT
  WITH CHECK (
    orcamento_id IN (
      SELECT id FROM orcamentos 
      WHERE empresa_id IN (
        SELECT id FROM usuarios_autorizados 
        WHERE email = auth.jwt() ->> 'email'
      )
    )
  );

CREATE POLICY "Usuários podem deletar pagamentos dos próprios orçamentos"
  ON orcamentos_pagamentos FOR DELETE
  USING (
    orcamento_id IN (
      SELECT id FROM orcamentos 
      WHERE empresa_id IN (
        SELECT id FROM usuarios_autorizados 
        WHERE email = auth.jwt() ->> 'email'
      )
    )
  );

-- 8. Índices para performance
CREATE INDEX idx_orcamentos_empresa_id ON orcamentos(empresa_id);
CREATE INDEX idx_orcamentos_cliente_id ON orcamentos(cliente_id);
CREATE INDEX idx_orcamentos_criado_em ON orcamentos(criado_em DESC);
CREATE INDEX idx_orcamentos_itens_orcamento_id ON orcamentos_itens(orcamento_id);
CREATE INDEX idx_orcamentos_pagamentos_orcamento_id ON orcamentos_pagamentos(orcamento_id);