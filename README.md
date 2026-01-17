# 🖨️ Gestão Graf - Sistema de Gestão para Gráficas

Uma aplicação web moderna e completa para gerenciar o dia a dia de uma gráfica. Controle de clientes, produtos, serviços, orçamentos, vendas, produções e acompanhamento em tempo real.

![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-blue?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-blue?logo=supabase)

## 🎯 Funcionalidades Principais

### 👥 **Gestão de Clientes**
- Cadastro completo de clientes com email, telefone e dados de CPF/CNPJ
- Integração com banco de dados Supabase
- Listagem, edição e exclusão rápida

### 📦 **Gestão de Produtos**
- Catalogação de produtos com preço, categoria e unidade de medida
- Múltiplas unidades de medida (unidade, m², metro linear)
- Sincronização em tempo real

### 🔧 **Gestão de Serviços**
- Serviços específicos com preço e descrição
- Ideal para serviços customizados da gráfica

### 📋 **Orçamentos (Quotes)**
- Criação de orçamentos com múltiplos itens
- Status de produção visual com timeline
- Acompanhamento: Aguardando Aprovação → Entregue

### 💰 **Vendas**
- Conversão de orçamentos em vendas
- Gestão de pagamentos (Dinheiro, Cartão, PIX, Boleto)
- Histórico de transações

### 📊 **Dashboard**
- Visão geral de atividades recentes
- Estatísticas com gráficos interativos
- Cards informativos

### 🚚 **Acompanhamento de Pedidos**
- Link público para clientes
- Timeline visual do processo
- Informações de pagamento

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase

### Instalação

1. **Clone e instale**
```bash
git clone <seu-repositorio>
cd gestaograf
npm install
```

2. **Configure o Supabase**

Crie `.env.local`:
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

3. **Execute o SQL de setup**

No editor SQL do Supabase, execute `SUPABASE_STARTSETUP.sql` para criar as tabelas.

4. **Inicie o desenvolvimento**
```bash
npm run dev
```

## 🏗️ Tecnologias

| Layer | Tecnologia |
|-------|-----------|
| **Frontend** | React 18.3, TypeScript, Tailwind CSS |
| **UI Components** | Shadcn/UI, Radix UI |
| **State** | Zustand |
| **Forms** | React Hook Form |
| **Routing** | React Router v6 |
| **Charts** | Recharts |
| **Backend** | Supabase (PostgreSQL) |
| **Auth** | OAuth Google + JWT |
| **Build** | Vite |

## 📚 Estrutura

```
src/
├── components/     # Componentes React
├── pages/          # Páginas (router)
├── services/       # CRUD Supabase
├── store/          # Zustand state
├── hooks/          # Custom hooks
├── lib/            # Utilitários
├── types/          # TypeScript types
└── assets/         # Imagens e assets
```

## 📋 Funcionalidades por Página

| Página | Descrição |
|--------|-----------|
| **Dashboard** | Visão geral e atividades |
| **Clientes** | CRUD de clientes |
| **Produtos** | Catálogo e preços |
| **Serviços** | Serviços customizados |
| **Orçamentos** | Criação e acompanhamento |
| **Vendas** | Vendas e pagamentos |
| **Atividades** | Feed de atividades recentes |
| **Relatórios** | Análise de dados |
| **Status** | Status de pedidos em produção |
| **TrackOrder** | Link público para clientes |
| **Configurações** | Preferências da aplicação |

## 🔐 Segurança

- ✅ OAuth Google via Supabase
- ✅ Row Level Security (RLS)
- ✅ TypeScript type safety
- ✅ Validação com Zod
- ✅ Variáveis de ambiente protegidas

## 📦 Build e Deploy

```bash
# Build para produção
npm run build

# Preview local
npm run preview
```

Deploy no Vercel:
```bash
npm install -g vercel
vercel
```

## 🧪 Testes

```bash
npm run test           # Uma vez
npm run test:watch    # Em tempo real
```

## 📧 Suporte

Dúvidas? Abra uma issue no repositório!

---

**Desenvolvido com ❤️ para gráficas modernas**

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Visit [Vercel](https://vercel.com) and click on "New Project" to deploy.

## Can I connect a custom domain?

Yes! After deployment, go to your provider's settings and point your domain to the deployment URL.
