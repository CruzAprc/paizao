import { createClient } from '@supabase/supabase-js'

// Credenciais do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://leffobakqkmjshzjwovl.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZmZvYmFrcWttanNoemp3b3ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MzI2MTYsImV4cCI6MjA2OTIwODYxNn0.UZ79CVOc4CrQyawfwfo_Tz_8Q-BjVVDZsBzoAIIz2Nk'

// Service role key para operações administrativas (bypassa RLS)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlZmZvYmFrcWttanNoemp3b3ZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzYzMjYxNiwiZXhwIjoyMDY5MjA4NjE2fQ.jdQnit8QrJMfj2sGasM7P-VzsYhZC7ro-q93LU2upLY'

// Cliente padrão (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente administrativo (service role key - bypassa RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Types para o banco de dados
export interface AppUser {
  id: string
  user_id: string
  nome: string
  email: string
  created_at?: string
}

export interface DietPlan {
  id: string
  nome_plano: string
  duracao_dias?: number
  user_id?: string
  cafe_da_manha?: any
  lanche_manha?: any
  almoco?: any
  lanche_tarde?: any
  jantar?: any
  ceia?: any
  created_at?: string
  app_users?: AppUser
}

export interface WorkoutPlan {
  id: string
  nome_plano: string
  duracao_semanas?: number
  user_id?: string
  segunda_feira?: any
  terca_feira?: any
  quarta_feira?: any
  quinta_feira?: any
  sexta_feira?: any
  sabado?: any
  domingo?: any
  created_at?: string
  app_users?: AppUser
}

export interface DietTemplate {
  id: string
  nome_template: string
  descricao?: string
  cafe_da_manha?: any
  lanche_manha?: any
  almoco?: any
  lanche_tarde?: any
  jantar?: any
  ceia?: any
  created_at?: string
  updated_at?: string
}

export interface WorkoutTemplate {
  id: string
  nome_template: string
  descricao?: string
  segunda_feira?: any
  terca_feira?: any
  quarta_feira?: any
  quinta_feira?: any
  sexta_feira?: any
  sabado?: any
  domingo?: any
  created_at?: string
  updated_at?: string
}

export interface Video {
  id: string
  nome: string
  exercicio: string
  url: string
  descricao?: string
  categoria?: string
  created_at?: string
}

export interface Exercicio {
  id: string
  nome: string
  url: string
  created_at?: string
}

export interface Anamnese {
  id: string
  user_id: string
  data: any
  created_at?: string
  updated_at?: string
}

export interface UserProfile {
  id: string
  user_id: string
  nome_completo?: string
  data_nascimento?: string
  altura?: number
  peso?: number
  objetivo?: string
  nivel_atividade?: string
  restricoes_alimentares?: string
  preferencias_alimentares?: string
  historico_medico?: string
  medicamentos?: string
  created_at?: string
  updated_at?: string
  [key: string]: any  // Permite outros campos dinâmicos
}
