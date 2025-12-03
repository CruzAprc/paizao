'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, type DietPlan, type DietTemplate } from '@/lib/supabase'
import DietForm from '@/components/DietForm'
import type { DietMealFormValues } from '@/lib/schemas'

const MEAL_NAMES = [
  'cafe_da_manha',
  'lanche_manha',
  'almoco',
  'lanche_tarde',
  'jantar',
  'ceia',
] as const

const MEAL_LABELS: Record<typeof MEAL_NAMES[number], string> = {
  cafe_da_manha: 'Café da Manhã',
  lanche_manha: 'Lanche da Manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da Tarde',
  jantar: 'Jantar',
  ceia: 'Ceia',
}

export default function EditDietPage() {
  const params = useParams()
  const router = useRouter()
  const dietId = params.id as string

  const [diet, setDiet] = useState<DietPlan | null>(null)
  const [selectedMeal, setSelectedMeal] = useState<typeof MEAL_NAMES[number] | null>(null)
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<DietTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const loadDiet = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('id', dietId)
        .single()

      if (error) throw error

      setDiet(data)
    } catch (error) {
      console.error('Erro ao carregar dieta:', error)
      alert('Erro ao carregar dieta')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [dietId, router])

  async function goToWorkout() {
    if (!diet?.user_id) {
      alert('Usuário não encontrado')
      return
    }

    try {
      const { data, error } = await supabase
        .from('workout_plans')
        .select('id')
        .eq('user_id', diet.user_id)
        .limit(1)
        .maybeSingle()

      if (error) throw error

      if (!data) {
        alert('Este usuário ainda não tem um plano de treino cadastrado')
        return
      }

      router.push(`/workouts/${data.id}`)
    } catch (error) {
      console.error('Erro ao buscar treino:', error)
      alert('Erro ao buscar treino do usuário')
    }
  }

  useEffect(() => {
    loadDiet()
    loadTemplates()
  }, [loadDiet])

  async function loadTemplates() {
    try {
      const { data, error } = await supabase
        .from('diet_templates')
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

    if (!confirm('Aplicar template vai substituir todas as refeições atuais. Deseja continuar?')) {
      return
    }

    try {
      const updates: any = {}
      MEAL_NAMES.forEach((meal) => {
        updates[meal] = template[meal] || null
      })

      const { error } = await supabase
        .from('diet_plans')
        .update(updates)
        .eq('id', dietId)

      if (error) throw error

      alert('Template aplicado com sucesso!')
      await loadDiet()
      setSelectedTemplate('')
    } catch (error) {
      console.error('Erro ao aplicar template:', error)
      alert('Erro ao aplicar template')
    }
  }

  async function handleMealSubmit(meal: typeof MEAL_NAMES[number], data: DietMealFormValues) {
    try {
      const { error } = await supabase
        .from('diet_plans')
        .update({ [meal]: data })
        .eq('id', dietId)

      if (error) throw error

      alert('Refeição atualizada com sucesso!')

      // Recarrega a dieta
      await loadDiet()

      // Volta para seleção de refeições
      setSelectedMeal(null)
    } catch (error) {
      console.error('Erro ao atualizar refeição:', error)
      alert('Erro ao atualizar refeição')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (!diet) {
    return (
      <div className="text-center py-8">
        <p className="text-xl text-gray-600">Dieta não encontrada</p>
      </div>
    )
  }

  // Se uma refeição está selecionada, mostra o formulário
  if (selectedMeal) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedMeal(null)}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          ← Voltar
        </button>

        <DietForm
          mealName={MEAL_LABELS[selectedMeal]}
          initialData={diet[selectedMeal] as DietMealFormValues | undefined}
          onSubmit={(data) => handleMealSubmit(selectedMeal, data)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Editar Dieta</h1>
        <div className="flex gap-3">
          <button
            onClick={goToWorkout}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Ver Treino do Cliente
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
            <strong>Nome do Plano:</strong> {diet.nome_plano}
          </p>
          <p>
            <strong>Cliente:</strong> {diet.app_users?.nome || 'N/A'}
          </p>
          <p>
            <strong>Email:</strong> {diet.app_users?.email || 'N/A'}
          </p>
          <p>
            <strong>Duração:</strong> {diet.duracao_dias || 30} dias
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
          ⚠️ Aplicar um template vai substituir todas as refeições atuais.
        </p>
      </div>

      {/* Seleção de Refeições */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Selecione uma Refeição para Editar</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {MEAL_NAMES.map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`p-4 rounded-lg border-2 transition ${
                diet[meal]
                  ? 'border-green-500 bg-green-50 hover:bg-green-100'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <p className="font-medium text-gray-700">{MEAL_LABELS[meal]}</p>
              {diet[meal] && (
                <p className="text-xs text-green-600 mt-1">✓ Configurada</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
