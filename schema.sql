-- ==========================================
-- TABELA DE USUÁRIOS AUTORIZADOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.usuarios_autorizados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  empresa TEXT DEFAULT 'Minha Empresa',
  plano TEXT DEFAULT 'premium',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.usuarios_autorizados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios dados de acesso"
ON public.usuarios_autorizados FOR SELECT
USING (auth.jwt() ->> 'email' = email);

CREATE POLICY "Usuários podem atualizar seus próprios dados"
ON public.usuarios_autorizados FOR UPDATE
USING (auth.jwt() ->> 'email' = email);

CREATE INDEX idx_usuarios_autorizados_email ON public.usuarios_autorizados(email);
CREATE INDEX idx_usuarios_autorizados_criado_em ON public.usuarios_autorizados(criado_em DESC);

-- ==========================================
-- TABELA DE CLIENTES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.usuarios_autorizados(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT NOT NULL,
  endereco TEXT,
  cpf_cnpj TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver clientes da sua empresa"
ON public.clientes FOR SELECT
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem criar clientes na sua empresa"
ON public.clientes FOR INSERT
WITH CHECK (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem atualizar clientes da sua empresa"
ON public.clientes FOR UPDATE
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem deletar clientes da sua empresa"
ON public.clientes FOR DELETE
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE INDEX idx_clientes_empresa_id ON public.clientes(empresa_id);
CREATE INDEX idx_clientes_email ON public.clientes(email);
CREATE INDEX idx_clientes_cpf_cnpj ON public.clientes(cpf_cnpj);
CREATE INDEX idx_clientes_criado_em ON public.clientes(criado_em DESC);

-- ==========================================
-- TABELA DE PRODUTOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.usuarios_autorizados(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10, 2) NOT NULL,
  categoria TEXT NOT NULL,
  unidade_medida TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver produtos da sua empresa"
ON public.produtos FOR SELECT
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem criar produtos na sua empresa"
ON public.produtos FOR INSERT
WITH CHECK (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem atualizar produtos da sua empresa"
ON public.produtos FOR UPDATE
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem deletar produtos da sua empresa"
ON public.produtos FOR DELETE
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE INDEX idx_produtos_empresa_id ON public.produtos(empresa_id);
CREATE INDEX idx_produtos_categoria ON public.produtos(categoria);
CREATE INDEX idx_produtos_criado_em ON public.produtos(criado_em DESC);

-- ==========================================
-- TABELA DE SERVIÇOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.servicos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.usuarios_autorizados(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC(10, 2) NOT NULL,
  duracao TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver serviços da sua empresa"
ON public.servicos FOR SELECT
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem criar serviços na sua empresa"
ON public.servicos FOR INSERT
WITH CHECK (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem atualizar serviços da sua empresa"
ON public.servicos FOR UPDATE
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem deletar serviços da sua empresa"
ON public.servicos FOR DELETE
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE INDEX IF NOT EXISTS idx_servicos_empresa_id ON public.servicos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_servicos_criado_em ON public.servicos(criado_em DESC);

-- ==========================================
-- TABELA DE ORÇAMENTOS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orcamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.usuarios_autorizados(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  total NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  status_producao TEXT NOT NULL DEFAULT 'waiting_approval',
  valido_ate TIMESTAMP WITH TIME ZONE NOT NULL,
  data_entrega TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver orçamentos da própria empresa"
ON public.orcamentos FOR SELECT
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem criar orçamentos para própria empresa"
ON public.orcamentos FOR INSERT
WITH CHECK (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem atualizar orçamentos da própria empresa"
ON public.orcamentos FOR UPDATE
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem deletar orçamentos da própria empresa"
ON public.orcamentos FOR DELETE
USING (

CREATE INDEX IF NOT EXISTS idx_orcamentos_empresa_id ON public.orcamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente_id ON public.orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON public.orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status_producao ON public.orcamentos(status_producao);
CREATE INDEX IF NOT EXISTS idx_orcamentos_criado_em ON public.orcamentos(criado_em DESC);

-- ==========================================
-- TABELA DE ITENS DO ORÇAMENTO
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orcamentos_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES public.servicos(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  quantidade NUMERIC(10, 2) NOT NULL,
  largura NUMERIC(10, 2),
  altura NUMERIC(10, 2),
  preco_unitario NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.orcamentos_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver itens dos próprios orçamentos"
ON public.orcamentos_itens FOR SELECT
USING (
  orcamento_id IN (
    SELECT id FROM public.orcamentos 
    WHERE empresa_id IN (
      SELECT id FROM public.usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE POLICY "Usuários podem criar itens nos próprios orçamentos"
ON public.orcamentos_itens FOR INSERT
WITH CHECK (
  orcamento_id IN (
    SELECT id FROM public.orcamentos 
    WHERE empresa_id IN (
      SELECT id FROM public.usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE POLICY "Usuários podem atualizar itens dos próprios orçamentos"
ON public.orcamentos_itens FOR UPDATE
USING (
  orcamento_id IN (
    SELECT id FROM public.orcamentos 
    WHERE empresa_id IN (
      SELECT id FROM public.usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE POLICY "Usuários podem deletar itens dos próprios orçamentos"
ON public.orcamentos_itens FOR DELETE
USING (
  orcamento_id IN (
    SELECT id FROM public.orcamentos 
    WHERE empresa_id IN (
      SELECT id FROM public.usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_orcamentos_itens_orcamento_id ON public.orcamentos_itens(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_itens_produto_id ON public.orcamentos_itens(produto_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_itens_servico_id ON public.orcamentos_itens(servico_id);

-- ==========================================
-- TABELA DE PAGAMENTOS DO ORÇAMENTO
-- ==========================================
CREATE TABLE IF NOT EXISTS public.orcamentos_pagamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  orcamento_id UUID NOT NULL REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  valor NUMERIC(10, 2) NOT NULL,
  metodo TEXT NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.orcamentos_pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "UsuÃ¡rios podem ver pagamentos dos prÃ³prios orÃ§amentos"
ON public.orcamentos_pagamentos FOR SELECT
USING (
  orcamento_id IN (
    SELECT id FROM public.orcamentos 
    WHERE empresa_id IN (
      SELECT id FROM public.usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE POLICY "UsuÃ¡rios podem criar pagamentos nos prÃ³prios orÃ§amentos"
ON public.orcamentos_pagamentos FOR INSERT
WITH CHECK (
  orcamento_id IN (
    SELECT id FROM public.orcamentos 
    WHERE empresa_id IN (
      SELECT id FROM public.usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE POLICY "UsuÃ¡rios podem deletar pagamentos dos prÃ³prios orÃ§amentos"
ON public.orcamentos_pagamentos FOR DELETE
USING (
  orcamento_id IN (
    SELECT id FROM public.orcamentos 
    WHERE empresa_id IN (
      SELECT id FROM public.usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_orcamentos_pagamentos_orcamento_id ON public.orcamentos_pagamentos(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_pagamentos_criado_em ON public.orcamentos_pagamentos(criado_em DESC);

-- ==========================================
-- TABELA DE VENDAS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.vendas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.usuarios_autorizados(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  cliente_telefone TEXT,
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE SET NULL,
  total NUMERIC(10, 2) NOT NULL,
  metodo_pagamento TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  status_producao TEXT DEFAULT 'waiting_approval',
  data_entrega TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver vendas da própria empresa"
ON public.vendas FOR SELECT
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem criar vendas para própria empresa"
ON public.vendas FOR INSERT
WITH CHECK (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem atualizar vendas da própria empresa"
ON public.vendas FOR UPDATE
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuários podem deletar vendas da própria empresa"
ON public.vendas FOR DELETE
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE INDEX IF NOT EXISTS idx_vendas_empresa_id ON public.vendas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_vendas_cliente_id ON public.vendas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_vendas_orcamento_id ON public.vendas(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_vendas_status ON public.vendas(status);
CREATE INDEX IF NOT EXISTS idx_vendas_status_producao ON public.vendas(status_producao);
CREATE INDEX IF NOT EXISTS idx_vendas_criado_em ON public.vendas(criado_em DESC);

-- ==========================================
-- TABELA DE ITENS DE VENDAS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.vendas_itens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venda_id UUID NOT NULL REFERENCES public.vendas(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  servico_id UUID REFERENCES public.servicos(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  quantidade NUMERIC(10, 2) NOT NULL,
  largura NUMERIC(10, 2),
  altura NUMERIC(10, 2),
  preco_unitario NUMERIC(10, 2) NOT NULL,
  total NUMERIC(10, 2) NOT NULL,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.vendas_itens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver itens das próprias vendas"
ON public.vendas_itens FOR SELECT
USING (
  venda_id IN (
    SELECT id FROM public.vendas 
    WHERE empresa_id IN (
      SELECT id FROM public.usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE POLICY "Usuários podem criar itens nas próprias vendas"
ON public.vendas_itens FOR INSERT
WITH CHECK (
  venda_id IN (
    SELECT id FROM public.vendas 
    WHERE empresa_id IN (
      SELECT id FROM public.usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE POLICY "Usuários podem atualizar itens das próprias vendas"
ON public.vendas_itens FOR UPDATE
USING (
  venda_id IN (
    SELECT id FROM public.vendas 
    WHERE empresa_id IN (
      SELECT id FROM public.usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE POLICY "Usuários podem deletar itens das próprias vendas"
ON public.vendas_itens FOR DELETE
USING (
  venda_id IN (
    SELECT id FROM public.vendas 
    WHERE empresa_id IN (
      SELECT id FROM public.usuarios_autorizados 
      WHERE email = auth.jwt() ->> 'email'
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_vendas_itens_venda_id ON public.vendas_itens(venda_id);
CREATE INDEX IF NOT EXISTS idx_vendas_itens_produto_id ON public.vendas_itens(produto_id);
CREATE INDEX IF NOT EXISTS idx_vendas_itens_servico_id ON public.vendas_itens(servico_id);

-- ==========================================
-- TABELA DE ATIVIDADES (AUDIT TRAIL)
-- ==========================================
CREATE TABLE IF NOT EXISTS public.atividades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL REFERENCES public.usuarios_autorizados(id) ON DELETE CASCADE,
  usuario_email TEXT NOT NULL,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tabela TEXT,
  registro_id UUID,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver atividades da própria empresa"
ON public.atividades FOR SELECT
USING (
  empresa_id IN (
    SELECT id FROM public.usuarios_autorizados 
    WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Sistema pode criar atividades"
ON public.atividades FOR INSERT
WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_atividades_empresa_id ON public.atividades(empresa_id);
CREATE INDEX IF NOT EXISTS idx_atividades_usuario_email ON public.atividades(usuario_email);
CREATE INDEX IF NOT EXISTS idx_atividades_criado_em ON public.atividades(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_atividades_tipo ON public.atividades(tipo);
    )
  );

-- 7. Políticas para PAGAMENTOS (herdam permissão do orçamento pai)
CREATE POLICY "UsuÃ¡rios podem ver pagamentos dos prÃ³prios orÃ§amentos"
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

CREATE POLICY "UsuÃ¡rios podem criar pagamentos nos prÃ³prios orÃ§amentos"
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

CREATE POLICY "UsuÃ¡rios podem deletar pagamentos dos prÃ³prios orÃ§amentos"
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





-- INICIO DO STRIPE

-- UUID helper (se ainda não tiver)
create extension if not exists "pgcrypto"; -- para gen_random_uuid()[3]

-- 1) Mapeamento: Supabase user -> Stripe customer
create table if not exists public.stripe_customers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null unique,
  email text,
  created_at timestamptz not null default now()
);

create index if not exists stripe_customers_customer_id_idx
  on public.stripe_customers (stripe_customer_id);

alter table public.stripe_customers enable row level security;

drop policy if exists "stripe_customers_select_own" on public.stripe_customers;
create policy "stripe_customers_select_own"
on public.stripe_customers
for select
to authenticated
using ((select auth.uid()) = user_id); -- padrão RLS com auth.uid()[1]

-- Bloqueia escrita pelo client (escrita via Edge Function/service role)
revoke insert, update, delete on public.stripe_customers from anon, authenticated;


-- 2) Estado da assinatura (1 user -> 0/1 assinatura “principal”)
create table if not exists public.stripe_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,

  stripe_subscription_id text not null unique,
  status text not null,         -- active, trialing, past_due, canceled...
  price_id text not null,       -- price_... recorrente
  cancel_at_period_end boolean not null default false,

  current_period_start timestamptz,
  current_period_end timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists stripe_subscriptions_status_idx
  on public.stripe_subscriptions (status);

create index if not exists stripe_subscriptions_period_end_idx
  on public.stripe_subscriptions (current_period_end);

alter table public.stripe_subscriptions enable row level security;

drop policy if exists "stripe_subscriptions_select_own" on public.stripe_subscriptions;
create policy "stripe_subscriptions_select_own"
on public.stripe_subscriptions
for select
to authenticated
using ((select auth.uid()) = user_id); --[1]

revoke insert, update, delete on public.stripe_subscriptions from anon, authenticated;


-- 3) Eventos Stripe (idempotência de webhook)
create table if not exists public.stripe_events (
  id text primary key,          -- evt_...
  type text not null,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  payload jsonb
);

create index if not exists stripe_events_type_idx
  on public.stripe_events (type);

alter table public.stripe_events enable row level security;

-- Por padrão ninguém do client deve acessar isso
revoke select, insert, update, delete on public.stripe_events from anon, authenticated;


-- 4) VIEW: acesso do usuário (pra UI / checagem rápida)
-- Regra simples: assinatura ativa ou trial e não expirada
create or replace view public.user_access as
select
  s.user_id,
  s.status,
  s.current_period_end,
  (s.status in ('active','trialing') and (s.current_period_end is null or s.current_period_end > now())) as is_active
from public.stripe_subscriptions s;

-- View também precisa de RLS via tabela base (stripe_subscriptions)[1]