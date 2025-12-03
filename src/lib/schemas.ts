import { z } from 'zod'

// Schema para macros de uma refeição
export const macrosSchema = z.object({
  calorias: z.string().min(1, 'Calorias é obrigatório'),
  gorduras: z.string().min(1, 'Gorduras é obrigatório'),
  proteinas: z.string().min(1, 'Proteínas é obrigatório'),
  carboidratos: z.string().min(1, 'Carboidratos é obrigatório'),
})

// Schema para substituições de alimentos
export const substituicaoSchema = z.object({
  original: z.string().min(1, 'Alimento original é obrigatório'),
  opcoes: z.array(z.string().min(1, 'Opção não pode ser vazia')).min(1, 'Adicione pelo menos uma opção'),
})

// Schema para uma refeição completa
export const dietMealSchema = z.object({
  macros: macrosSchema,
  alimentos: z.array(z.string().min(1, 'Alimento não pode ser vazio')).min(1, 'Adicione pelo menos um alimento'),
  substituicoes: z.array(substituicaoSchema),
})

// Type inference para TypeScript
export type DietMeal = z.infer<typeof dietMealSchema>
export type Macros = z.infer<typeof macrosSchema>
export type Substituicao = z.infer<typeof substituicaoSchema>

// Usar o tipo inferido do Zod diretamente para evitar problemas de compatibilidade
export type DietMealFormValues = DietMeal

// Schema para informações do treino do dia
export const treinoInfoSchema = z.object({
  foco: z.string().min(1, 'Foco do treino é obrigatório'),
  duracao: z.string().min(1, 'Duração é obrigatória'),
  intensidade: z.string().min(1, 'Intensidade é obrigatória'),
})

// Schema para um exercício
export const workoutExerciseSchema = z.object({
  nome: z.string().min(1, 'Nome do exercício é obrigatório'),
  exercise_id: z.string().optional(),
  series: z.string().min(1, 'Séries é obrigatório'),
  repeticoes: z.string().min(1, 'Repetições é obrigatório'),
  descanso: z.string().min(1, 'Descanso é obrigatório'),
  observacoes: z.string().optional(),
})

// Schema para planejamento da próxima semana
export const proximaSemanaSchema = z.object({
  ajustes: z.string().optional(),
  aumento_carga: z.string().optional(),
  novos_exercicios: z.array(z.string()),
})

// Schema para treino completo de um dia
export const workoutSchema = z.object({
  treino: treinoInfoSchema,
  exercicios: z.array(workoutExerciseSchema).min(1, 'Adicione pelo menos um exercício'),
  dicas: z.array(z.string()),
  proxima_semana: proximaSemanaSchema,
})

// Type inference para TypeScript
export type Workout = z.infer<typeof workoutSchema>
export type TreinoInfo = z.infer<typeof treinoInfoSchema>
export type WorkoutExercise = z.infer<typeof workoutExerciseSchema>
export type ProximaSemana = z.infer<typeof proximaSemanaSchema>

// Schema para usuário/cliente
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  created_at: z.string().optional(),
})

export type User = z.infer<typeof userSchema>

// Schema para vídeo de exercício
export const videoSchema = z.object({
  id: z.string().uuid(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  exercicio: z.string().min(1, 'Exercício é obrigatório'),
  url: z.string().url('URL inválida'),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  created_at: z.string().optional(),
})

export type Video = z.infer<typeof videoSchema>
