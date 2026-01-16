# 📚 Guia Rápido - Autenticação com Google + Supabase

## 📋 Resumo dos Arquivos Comentados

### 1. **Login.tsx** - Página de Login
**Localização:** `src/pages/Login.tsx`

**Responsabilidades:**
- Exibir botão para login com Google
- Sincronizar sessão do Supabase com o estado local
- Redirecionar usuário autenticado para Dashboard

**Principais variáveis:**
- `user` - Usuário autenticado
- `error` - Mensagens de erro
- `isLoading` - Status do login

**Funções principais:**
- `handleGoogleLogin()` - Inicia login via OAuth do Supabase

---

### 2. **ProtectedRoute.tsx** - Proteção de Rotas
**Localização:** `src/components/ProtectedRoute.tsx`

**Responsabilidades:**
- Verificar se usuário está autenticado
- Redirecionar para `/login` se não autenticado
- Mostrar loading screen durante verificação

**Estados:**
- `isLoading` - Verificando sessão
- `isAuthenticated` - Usuário autenticado

**Fluxo:**
```
isLoading = true → Verificar Supabase
  ↓
isAuthenticated = true → Renderizar conteúdo
  ↓
isAuthenticated = false → Redirecionar para /login
```

---

### 3. **App.tsx** - Aplicação Principal
**Localização:** `src/App.tsx`

**Responsabilidades:**
- Configurar providers (QueryClient, Tooltip, Toaster)
- Sincronizar sessão Supabase com Zustand
- Definir todas as rotas da aplicação
- Proteger rotas que requerem autenticação

**useEffect:**
- Sincroniza sessão Supabase na inicialização
- Escuta mudanças de autenticação em tempo real

**Rotas principais:**
- `/login` - Pública, sem layout
- `/acompanhar/:id` - Pública, sem layout
- `/*` - Protegidas, com layout

---

### 4. **useStore.ts** - Gerenciamento de Estado
**Localização:** `src/store/useStore.ts`

**Estados principais:**
- `user` - Usuário local autenticado
- `supabaseUser` - Usuário Supabase (Google)
- `company` - Empresa selecionada

**Funções de autenticação:**
- `login()` - Login local (legado)
- `logout()` - Logout e limpar tudo
- `setSupabaseUser()` - Sincronizar usuário Supabase

**Como setSupabaseUser funciona:**
```typescript
const user: User = {
  id: supabaseUser.id,           // ID do Supabase
  username: user_metadata.full_name, // Nome do Google
  email: supabaseUser.email,     // Email autenticado
  password: '',                  // Não usado com OAuth
  companyId: '1',                // Empresa padrão
  createdAt: new Date().toISOString(),
};
```

---

### 5. **Sidebar.tsx** - Barra Lateral
**Localização:** `src/components/layout/Sidebar.tsx`

**Responsabilidades:**
- Mostrar menu de navegação
- Logo e informações da empresa
- Botão de logout

**Função logout:**
```typescript
1. await supabase.auth.signOut()  // Desconectar do Supabase
2. logout()                       // Limpar estado local
3. navigate('/login')             // Redirecionar para login
```

**Campos de usuário exibidos:**
- Logo da empresa
- Nome da empresa
- Nome do usuário (do Supabase)

---

### 6. **Status.tsx** - Página de Status
**Localização:** `src/pages/Status.tsx`

**Responsabilidades:**
- Mostrar informações do usuário autenticado
- Testar conexão com Supabase
- Exibir status das configurações

**Informações exibidas:**
- Email do usuário
- Nome do usuário
- ID do usuário no Supabase
- Status de conexão com Supabase

**Estados de conexão:**
- `idle` - Nenhum teste feito
- `loading` - Testando...
- `success` - Conectado com sucesso
- `error` - Erro na conexão

---

### 7. **supabaseClient.ts** - Cliente Supabase
**Localização:** `src/lib/supabaseClient.ts`

**Responsabilidades:**
- Inicializar cliente Supabase
- Importar configurações das variáveis de ambiente

**Variáveis necessárias:**
- `VITE_SUPABASE_URL` - URL do projeto
- `VITE_SUPABASE_ANON_KEY` - Chave anônima

**Exportação:**
```typescript
export const supabase = createClient(url, key);
```

---

## 🔄 Fluxo de Autenticação Completo

```
1. Usuário acessa /login
   ↓
2. Login.tsx carrega → useEffect verifica sessão Supabase
   ↓
3. Se já autenticado → navigate('/') → ProtectedRoute.tsx
   ↓
4. Se não → Clicar "Entrar com Google"
   ↓
5. Supabase.auth.signInWithOAuth({ provider: 'google' })
   ↓
6. Google OAuth → Redireciona para / com token
   ↓
7. App.tsx → useEffect sincroniza usuário com Zustand
   ↓
8. ProtectedRoute verifica → setIsAuthenticated(true)
   ↓
9. Renderiza Layout + Rotas protegidas
   ↓
10. Sidebar exibe informações do usuário
```

---

## 🔐 Pontos de Segurança

### onde a autenticação é verificada:

1. **ProtectedRoute.tsx** - Antes de renderizar qualquer rota
2. **App.tsx** - Sincroniza sessão na inicialização
3. **Sidebar.tsx** - Logout desconecta do Supabase

### Dados persistidos:

- Sessão no localStorage (Supabase)
- Estado local no localStorage (Zustand)
- Token JWT no sessionStorage (Supabase)

---

## 🛠️ Variáveis de Ambiente Necessárias

Arquivo: `.env`

```env
# Habilitar Supabase
VITE_SUPABASE_ENABLED=true

# URL do projeto Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co

# Chave anônima para requisições
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

---

## 🧪 Testando a Implementação

1. **Verificar `.env`:**
   ```bash
   cat .env  # Confirmar variáveis
   ```

2. **Verificar autenticação:**
   - Ir para `/status`
   - Clicar "Testar Conexão"
   - Deve mostrar: ✓ Conexão com Supabase estabelecida com sucesso!

3. **Testar logout:**
   - Clicar "Sair" no menu
   - Deve desconectar do Supabase
   - Deve redirecionar para `/login`

4. **Testar redirect automático:**
   - Estar logado e ir para `/login`
   - Deve redirecionar automaticamente para `/`

---

## 🐛 Debugging

### Verificar logs do Supabase:

```typescript
// Em Login.tsx ou App.tsx
supabase.auth.onAuthStateChange((_event, session) => {
  console.log('Auth event:', _event);
  console.log('Session:', session);
});
```

### Verificar estado do Zustand:

```typescript
// Em qualquer componente
import { useStore } from '@/store/useStore';

const { supabaseUser, user, company } = useStore();
console.log('Supabase User:', supabaseUser);
console.log('Local User:', user);
console.log('Company:', company);
```

### Verificar localStorage:

```javascript
// No console do navegador
localStorage.getItem('grafica-erp-storage')
```

---

## 📝 Notas Importantes

1. **Google OAuth:** Configurado no Supabase Dashboard
2. **Email:** O email do Google é sempre único e confiável
3. **Logout:** Remove token de duas fontes (Supabase + localStorage)
4. **Reload:** A sessão persiste mesmo após fechar/abrir navegador
5. **Múltiplas abas:** A autenticação é sincronizada entre abas

---

## 🔗 Links Úteis

- [Supabase Docs](https://supabase.com/docs)
- [Google OAuth Provider](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Zustand Store](https://github.com/pmndrs/zustand)
