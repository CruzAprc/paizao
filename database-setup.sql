-- ============================================
-- SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS
-- Diet & Workout Admin - Supabase
-- ============================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- Acesse: Project Settings > SQL Editor

-- ============================================
-- 1. CRIAR TABELAS
-- ============================================

-- Tabela de usuários/clientes
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de planos de dieta
CREATE TABLE IF NOT EXISTS diet_plans (
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
CREATE TABLE IF NOT EXISTS workout_plans (
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
CREATE TABLE IF NOT EXISTS diet_templates (
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
CREATE TABLE IF NOT EXISTS workout_templates (
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
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  exercicio TEXT NOT NULL,
  url TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de perfis de usuários (anamnese e perfil)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de anamneses (opcional - mantido para compatibilidade)
CREATE TABLE IF NOT EXISTS anamneses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================
-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para busca por email
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);

-- Índices para relacionamentos
CREATE INDEX IF NOT EXISTS idx_diet_plans_user_id ON diet_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_anamneses_user_id ON anamneses(user_id);

-- Índices para ordenação por data
CREATE INDEX IF NOT EXISTS idx_diet_plans_created_at ON diet_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_plans_created_at ON workout_plans(created_at DESC);

-- ============================================
-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE anamneses ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. POLÍTICAS DE SEGURANÇA (DESENVOLVIMENTO)
-- ============================================

-- ATENÇÃO: Estas são políticas permissivas para DESENVOLVIMENTO
-- Em PRODUÇÃO, você deve implementar autenticação adequada

-- Políticas para app_users
DROP POLICY IF EXISTS "Enable all operations for app_users" ON app_users;
CREATE POLICY "Enable all operations for app_users"
ON app_users FOR ALL USING (true) WITH CHECK (true);

-- Políticas para diet_plans
DROP POLICY IF EXISTS "Enable all operations for diet_plans" ON diet_plans;
CREATE POLICY "Enable all operations for diet_plans"
ON diet_plans FOR ALL USING (true) WITH CHECK (true);

-- Políticas para workout_plans
DROP POLICY IF EXISTS "Enable all operations for workout_plans" ON workout_plans;
CREATE POLICY "Enable all operations for workout_plans"
ON workout_plans FOR ALL USING (true) WITH CHECK (true);

-- Políticas para diet_templates
DROP POLICY IF EXISTS "Enable all operations for diet_templates" ON diet_templates;
CREATE POLICY "Enable all operations for diet_templates"
ON diet_templates FOR ALL USING (true) WITH CHECK (true);

-- Políticas para workout_templates
DROP POLICY IF EXISTS "Enable all operations for workout_templates" ON workout_templates;
CREATE POLICY "Enable all operations for workout_templates"
ON workout_templates FOR ALL USING (true) WITH CHECK (true);

-- Políticas para videos
DROP POLICY IF EXISTS "Enable all operations for videos" ON videos;
CREATE POLICY "Enable all operations for videos"
ON videos FOR ALL USING (true) WITH CHECK (true);

-- Políticas para user_profiles
DROP POLICY IF EXISTS "Enable all operations for user_profiles" ON user_profiles;
CREATE POLICY "Enable all operations for user_profiles"
ON user_profiles FOR ALL USING (true) WITH CHECK (true);

-- Políticas para anamneses
DROP POLICY IF EXISTS "Enable all operations for anamneses" ON anamneses;
CREATE POLICY "Enable all operations for anamneses"
ON anamneses FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 5. DADOS DE EXEMPLO (OPCIONAL)
-- ============================================

-- Inserir usuário de exemplo
INSERT INTO app_users (name, email)
VALUES ('João Silva', 'joao.silva@example.com')
ON CONFLICT (email) DO NOTHING;

-- Inserir exercícios de exemplo na biblioteca
INSERT INTO videos (nome, exercicio, url, descricao, categoria)
VALUES
  ('Agachamento Livre', 'Agachamento Livre', 'https://youtube.com/example1', 'Exercício composto para pernas', 'Inferiores'),
  ('Supino Reto', 'Supino Reto', 'https://youtube.com/example2', 'Exercício para peitoral', 'Peito'),
  ('Levantamento Terra', 'Levantamento Terra', 'https://youtube.com/example3', 'Exercício composto para costas', 'Costas'),
  ('Desenvolvimento Militar', 'Desenvolvimento Militar', 'https://youtube.com/example4', 'Exercício para ombros', 'Ombros')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. VERIFICAÇÃO
-- ============================================

-- Verificar se as tabelas foram criadas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Contar registros nas tabelas
SELECT
  'app_users' as tabela, COUNT(*) as registros FROM app_users
UNION ALL
SELECT 'diet_plans', COUNT(*) FROM diet_plans
UNION ALL
SELECT 'workout_plans', COUNT(*) FROM workout_plans
UNION ALL
SELECT 'diet_templates', COUNT(*) FROM diet_templates
UNION ALL
SELECT 'workout_templates', COUNT(*) FROM workout_templates
UNION ALL
SELECT 'videos', COUNT(*) FROM videos
UNION ALL
SELECT 'user_profiles', COUNT(*) FROM user_profiles
UNION ALL
SELECT 'anamneses', COUNT(*) FROM anamneses;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- PRÓXIMOS PASSOS:
-- 1. Verifique se todas as tabelas foram criadas
-- 2. Verifique se as políticas RLS estão ativas
-- 3. Execute o projeto Next.js: npm run dev
-- 4. Acesse http://localhost:3000
