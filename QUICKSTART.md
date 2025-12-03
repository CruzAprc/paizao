# 🚀 Guia Rápido de Início

Este guia irá te ajudar a rodar o projeto **Diet & Workout Admin** em poucos minutos.

## ✅ Credenciais já Configuradas

As credenciais do Supabase já foram configuradas no projeto:
- ✅ URL: `https://leffobakqkmjshzjwovl.supabase.co`
- ✅ Anon Key: Configurada
- ✅ Arquivos `.env.local` e `src/lib/supabase.ts` atualizados

## 📝 Passos para Executar

### 1. Instalar Dependências

```bash
npm install
```

Este comando irá instalar todas as dependências necessárias:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- Supabase Client

### 2. Configurar o Banco de Dados (se ainda não fez)

Se as tabelas ainda não foram criadas no Supabase:

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Vá em **SQL Editor**
3. Abra o arquivo `database-setup.sql` deste projeto
4. Copie todo o conteúdo e cole no SQL Editor
5. Clique em **Run** para executar

O script irá criar:
- ✅ Todas as tabelas necessárias
- ✅ Índices para performance
- ✅ Políticas de segurança (RLS)
- ✅ Dados de exemplo (opcional)

### 3. Executar o Projeto

```bash
npm run dev
```

O projeto estará disponível em: **http://localhost:3000**

## 🎯 Funcionalidades Disponíveis

### Dashboard (/)
- Lista todas as dietas e treinos
- Busca por email do cliente
- Acesso aos templates

### Dietas
- **Nova Dieta:** `/diets/new`
- **Editar Dieta:** `/diets/[id]`
- Gerenciar 6 refeições por dia
- Macronutrientes completos
- Substituições de alimentos

### Treinos
- **Novo Treino:** `/workouts/new`
- **Editar Treino:** `/workouts/[id]`
- Treinos semanais (7 dias)
- Autocomplete de exercícios
- Dicas e planejamento

### Templates
- **Templates de Dieta:** `/templates/diets`
- **Templates de Treino:** `/templates/workouts`
- Criar modelos reutilizáveis

### Anamnese
- **Visualizar:** `/users/[id]/anamnese`
- Dados do perfil do cliente
- Informações da anamnese

## 📊 Estrutura das Tabelas

O banco de dados possui as seguintes tabelas:

1. **app_users** - Clientes/usuários
2. **diet_plans** - Planos de dieta
3. **workout_plans** - Planos de treino
4. **diet_templates** - Templates de dieta
5. **workout_templates** - Templates de treino
6. **videos** - Biblioteca de exercícios
7. **user_profiles** - Perfis e anamneses
8. **anamneses** - Dados adicionais de anamnese

## 🔍 Testando o Sistema

### 1. Criar um Cliente

1. Acesse o SQL Editor do Supabase
2. Execute:

```sql
INSERT INTO app_users (name, email)
VALUES ('Teste Cliente', 'teste@example.com');
```

### 2. Criar uma Dieta

1. Acesse: http://localhost:3000/diets/new
2. Busque pelo email: `teste@example.com`
3. Selecione o cliente
4. Configure as refeições
5. Salve

### 3. Criar um Treino

1. Acesse: http://localhost:3000/workouts/new
2. Busque pelo email: `teste@example.com`
3. Selecione o cliente
4. Configure os dias da semana
5. Salve

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Executar em produção
npm run start

# Verificar código
npm run lint
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

## 🔐 Segurança

⚠️ **IMPORTANTE:**
- As políticas RLS atuais são **permissivas** para desenvolvimento
- Em **produção**, implemente autenticação com Supabase Auth
- Nunca exponha a `service_role_key` no frontend
- Use HTTPS em produção

## 🐛 Solução de Problemas

### Erro de Conexão com Supabase

Verifique se:
1. As credenciais estão corretas no `.env.local`
2. As tabelas foram criadas no Supabase
3. As políticas RLS estão habilitadas

### Erro ao Buscar Usuários

Certifique-se de que:
1. A tabela `app_users` existe
2. Existem registros na tabela
3. O email está correto

### Erro 404 nas Rotas

Certifique-se de que:
1. O servidor está rodando (`npm run dev`)
2. A URL está correta
3. As pastas em `src/app/` estão corretas

## 📚 Documentação Adicional

- **README.md** - Documentação completa do projeto
- **database-setup.sql** - Script SQL completo
- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs

## 🎉 Pronto!

O sistema está pronto para uso! Explore as funcionalidades e personalize conforme necessário.

Se tiver dúvidas, consulte a documentação completa no arquivo **README.md**.
