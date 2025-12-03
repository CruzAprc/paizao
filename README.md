# Diet & Workout Admin

Sistema web administrativo para gerenciar dietas e treinos de clientes de personal trainers e nutricionistas.

## Características

- ✅ Cadastrar e gerenciar planos de dieta personalizados
- ✅ Cadastrar e gerenciar planos de treino personalizados
- ✅ Criar templates reutilizáveis (dietas e treinos)
- ✅ Gerenciar anamneses de clientes
- ✅ Buscar clientes por email
- ✅ Vincular vídeos de exercícios aos treinos

## Stack Tecnológico

### Frontend
- **Next.js 14.1.0** (App Router)
- **React 18.2.0**
- **TypeScript 5**
- **Tailwind CSS 3.3.0**

### Gerenciamento de Estado e Formulários
- **React Hook Form 7.50.0**
- **Zod 3.22.4** (validação de schemas)
- **@hookform/resolvers 3.3.4**

### Backend
- **Supabase** (BaaS - Backend as a Service)
  - PostgreSQL (banco de dados relacional)
  - REST API (auto-gerada)
  - Row Level Security (RLS)

## Pré-requisitos

- Node.js 18+ ou superior
- npm ou yarn
- Conta no Supabase (gratuita)

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd paizao-corrgirtreino-dieta
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

**IMPORTANTE:** O usuário deve fornecer as credenciais corretas do Supabase.

### 4. Configure o banco de dados no Supabase

Execute os seguintes scripts SQL no SQL Editor do Supabase (nesta ordem):

#### 4.1. Criar as tabelas

```sql
-- Tabela de usuários/clientes
CREATE TABLE app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de planos de dieta
CREATE TABLE diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_plano TEXT NOT NULL,
  duracao_dias INTEGER DEFAULT 30,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  cafe_da_manha JSONB,
  lanche_manha JSONB,
  almoco JSONB,
  lanche_tarde JSONB,
  jantar JSONB,
  ceia JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de planos de treino
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_plano TEXT NOT NULL,
  duracao_semanas INTEGER DEFAULT 4,
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  segunda_feira JSONB,
  terca_feira JSONB,
  quarta_feira JSONB,
  quinta_feira JSONB,
  sexta_feira JSONB,
  sabado JSONB,
  domingo JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de templates de dieta
CREATE TABLE diet_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_template TEXT NOT NULL,
  descricao TEXT,
  cafe_da_manha JSONB,
  lanche_manha JSONB,
  almoco JSONB,
  lanche_tarde JSONB,
  jantar JSONB,
  ceia JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de templates de treino
CREATE TABLE workout_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_template TEXT NOT NULL,
  descricao TEXT,
  segunda_feira JSONB,
  terca_feira JSONB,
  quarta_feira JSONB,
  quinta_feira JSONB,
  sexta_feira JSONB,
  sabado JSONB,
  domingo JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de vídeos de exercícios
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  exercicio TEXT NOT NULL,
  url TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de anamneses
CREATE TABLE anamneses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de user_profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 4.2. Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS nas tabelas
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamneses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (desenvolvimento)
-- ATENÇÃO: Em produção, implemente autenticação adequada

CREATE POLICY "Enable all operations for app_users"
ON app_users FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for diet_plans"
ON diet_plans FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for workout_plans"
ON workout_plans FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for diet_templates"
ON diet_templates FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for workout_templates"
ON workout_templates FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for videos"
ON videos FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for anamneses"
ON anamneses FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all operations for user_profiles"
ON user_profiles FOR ALL USING (true) WITH CHECK (true);
```

### 5. Execute o projeto em desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:3000`

## Scripts Disponíveis

- `npm run dev` - Executa o projeto em modo de desenvolvimento
- `npm run build` - Cria o build de produção
- `npm run start` - Executa o projeto em modo de produção
- `npm run lint` - Verifica o código com ESLint

## Estrutura do Projeto

```
paizao-corrgirtreino-dieta/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Layout global (navbar)
│   │   ├── page.tsx              # Página inicial (dashboard)
│   │   ├── globals.css           # Estilos globais
│   │   ├── diets/                # Rotas de dietas
│   │   │   ├── new/page.tsx      # Criar nova dieta
│   │   │   └── [id]/page.tsx     # Editar dieta
│   │   ├── workouts/             # Rotas de treinos
│   │   │   ├── new/page.tsx      # Criar novo treino
│   │   │   └── [id]/page.tsx     # Editar treino
│   │   ├── templates/            # Rotas de templates
│   │   │   ├── diets/
│   │   │   │   ├── page.tsx      # Listar templates de dieta
│   │   │   │   ├── new/page.tsx  # Criar template
│   │   │   │   └── [id]/page.tsx # Editar template
│   │   │   └── workouts/
│   │   │       ├── page.tsx      # Listar templates de treino
│   │   │       ├── new/page.tsx  # Criar template
│   │   │       └── [id]/page.tsx # Editar template
│   │   └── users/
│   │       └── [id]/anamnese/page.tsx  # Visualizar anamnese
│   ├── components/               # Componentes reutilizáveis
│   │   ├── DietForm.tsx          # Formulário de dieta
│   │   └── WorkoutForm.tsx       # Formulário de treino
│   └── lib/                      # Utilitários e configurações
│       ├── supabase.ts           # Cliente Supabase
│       └── schemas.ts            # Schemas Zod (validação)
├── public/                       # Arquivos estáticos
├── package.json                  # Dependências
├── tsconfig.json                 # Configuração TypeScript
├── tailwind.config.ts            # Configuração Tailwind
└── next.config.js                # Configuração Next.js
```

## Funcionalidades Principais

### Dashboard
- Listagem de todas as dietas e treinos
- Busca por email do cliente
- Acesso rápido aos templates
- Visualização de anamneses

### Gestão de Dietas
- Criar planos de dieta personalizados
- Configurar 6 refeições: Café da Manhã, Lanche da Manhã, Almoço, Lanche da Tarde, Jantar, Ceia
- Definir macronutrientes (calorias, proteínas, carboidratos, gorduras)
- Lista dinâmica de alimentos
- Substituições de alimentos com múltiplas opções

### Gestão de Treinos
- Criar planos de treino semanais
- Configurar treinos para cada dia da semana
- Autocomplete de exercícios (integrado com biblioteca de vídeos)
- Definir séries, repetições e tempo de descanso
- Adicionar dicas de treino
- Planejamento para próxima semana

### Templates
- Criar templates reutilizáveis de dietas e treinos
- Aplicar templates a diferentes clientes
- Editar e gerenciar templates

## Próximos Passos

Após montar a estrutura, você precisa:

1. ✅ Fornecer as credenciais corretas do Supabase no arquivo `.env.local`
2. ✅ Executar os scripts SQL no Supabase para criar as tabelas
3. ✅ (Opcional) Adicionar dados de exemplo para testar o sistema

## Segurança

⚠️ **IMPORTANTE:** Este projeto usa políticas RLS permissivas para desenvolvimento. Em produção, você deve:

- Implementar autenticação com Supabase Auth
- Configurar políticas RLS adequadas por usuário
- Nunca expor a `service_role_key` no frontend
- Usar HTTPS em produção

## Suporte

Para dúvidas ou problemas:
- Consulte a documentação do Next.js: https://nextjs.org/docs
- Consulte a documentação do Supabase: https://supabase.com/docs
- Consulte a documentação do React Hook Form: https://react-hook-form.com

## Licença

Este projeto é de uso interno.
