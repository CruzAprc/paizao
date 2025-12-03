'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type WorkoutPlan, type WorkoutTemplate } from '@/lib/supabase'
import WorkoutForm from '@/components/WorkoutForm'
import type { Workout } from '@/lib/schemas'

const DAY_NAMES = [
  'segunda_feira',
  'terca_feira',
  'quarta_feira',
  'quinta_feira',
  'sexta_feira',
  'sabado',
  'domingo',
] as const

const DAY_LABELS: Record<typeof DAY_NAMES[number], string> = {
  segunda_feira: 'Segunda-feira',
  terca_feira: 'Terça-feira',
  quarta_feira: 'Quarta-feira',
  quinta_feira: 'Quinta-feira',
  sexta_feira: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

export default function EditWorkoutPage() {
  const params = useParams()
  const router = useRouter()
  const workoutId = params.id as string

  console.log('[DEBUG PAGE] EditWorkoutPage renderizado, workoutId:', workoutId)

  const [workout, setWorkout] = useState<WorkoutPlan | null>(null)
  const [selectedDay, setSelectedDay] = useState<typeof DAY_NAMES[number] | null>(null)

  console.log('[DEBUG PAGE] selectedDay:', selectedDay)
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const loadWorkout = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('id', workoutId)
        .single()

      if (error) throw error

      setWorkout(data)
    } catch (error) {
      console.error('Erro ao carregar treino:', error)
      alert('Erro ao carregar treino')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [workoutId, router])

  async function goToDiet() {
    if (!workout?.user_id) {
      alert('Usuário não encontrado')
      return
    }

    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .select('id')
        .eq('user_id', workout.user_id)
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        alert('Este usuário ainda não tem um plano de dieta cadastrado')
        return
      }

      router.push(`/diets/${data.id}`)
    } catch (error) {
      console.error('Erro ao buscar dieta:', error)
      alert('Erro ao buscar dieta do usuário')
    }
  }

  useEffect(() => {
    loadWorkout()
    loadTemplates()
  }, [loadWorkout])

  async function loadTemplates() {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .order('nome_template', { ascending: true })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
    }
  }

  async function applyTemplate() {
    const template = templates.find(t => t.id === selectedTemplate)
    if (!template) {
      alert('Selecione um template')
      return
    }

    if (!confirm('Aplicar template vai substituir todos os dias de treino atuais. Deseja continuar?')) {
      return
    }

    try {
      const updates: any = {}
      DAY_NAMES.forEach((day) => {
        updates[day] = template[day] || null
      })

      const { error } = await supabase
        .from('workout_plans')
        .update(updates)
        .eq('id', workoutId)

      if (error) throw error

      alert('Template aplicado com sucesso!')
      await loadWorkout()
      setSelectedTemplate('')
    } catch (error) {
      console.error('Erro ao aplicar template:', error)
      alert('Erro ao aplicar template')
    }
  }

  async function handleDaySubmit(day: typeof DAY_NAMES[number], data: Workout) {
    try {
      const { error } = await supabase
        .from('workout_plans')
        .update({ [day]: data })
        .eq('id', workoutId)

      if (error) throw error

      alert('Treino do dia atualizado com sucesso!')

      // Recarrega o treino
      await loadWorkout()

      // Volta para seleção de dias
      setSelectedDay(null)
    } catch (error) {
      console.error('Erro ao atualizar treino:', error)
      alert('Erro ao atualizar treino')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (!workout) {
    return (
      <div className="text-center py-8">
        <p className="text-xl text-gray-600">Treino não encontrado</p>
      </div>
    )
  }

  // Se um dia está selecionado, mostra o formulário
  if (selectedDay) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedDay(null)}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          ← Voltar
        </button>

        <WorkoutForm
          dayName={DAY_LABELS[selectedDay]}
          initialData={workout[selectedDay] as Workout | undefined}
          onSubmit={(data) => handleDaySubmit(selectedDay, data)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Editar Treino</h1>
        <div className="flex gap-3">
          <button
            onClick={goToDiet}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Ver Dieta do Cliente
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>

      {/* Informações do Plano */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Informações</h2>
        <div className="space-y-2 text-gray-600">
          <p>
            <strong>Nome do Plano:</strong> {workout.nome_plano}
          </p>
          <p>
            <strong>Cliente:</strong> {workout.app_users?.nome || 'N/A'}
          </p>
          <p>
            <strong>Email:</strong> {workout.app_users?.email || 'N/A'}
          </p>
          <p>
            <strong>Duração:</strong> {workout.duracao_semanas || 4} semanas
          </p>
        </div>
      </div>

      {/* Seletor de Template */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Escolher Template (Opcional)</h2>

        <div className="flex gap-3">
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Selecione um template...</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.nome_template}
                {template.descricao ? ` - ${template.descricao}` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={applyTemplate}
            disabled={!selectedTemplate}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            Aplicar Template
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          ⚠️ Aplicar um template vai substituir todos os dias de treino atuais.
        </p>
      </div>

      {/* Seleção de Dias */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Selecione um Dia para Editar</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DAY_NAMES.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`p-4 rounded-lg border-2 transition ${
                workout[day]
                  ? 'border-green-500 bg-green-50 hover:bg-green-100'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <p className="font-medium text-gray-700">{DAY_LABELS[day]}</p>
              {workout[day] && (
                <p className="text-xs text-green-600 mt-1">✓ Configurado</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
