'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, type WorkoutTemplate } from '@/lib/supabase'
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

export default function EditWorkoutTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const [loading, setLoading] = useState(true)
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedDay, setSelectedDay] = useState<typeof DAY_NAMES[number] | null>(null)
  const [dayData, setDayData] = useState<Record<string, Workout>>({})

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  async function loadTemplate() {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (error) throw error

      setTemplate(data)
      setTemplateName(data.nome_template)
      setDescription(data.descricao || '')

      // Carregar dados dos dias
      const days: Record<string, Workout> = {}
      DAY_NAMES.forEach((day) => {
        if (data[day]) {
          days[day] = data[day]
        }
      })
      setDayData(days)
    } catch (error) {
      console.error('Erro ao carregar template:', error)
      alert('Erro ao carregar template')
      router.push('/templates/workouts')
    } finally {
      setLoading(false)
    }
  }

  async function handleDaySubmit(day: typeof DAY_NAMES[number], data: Workout) {
    setDayData((prev) => ({
      ...prev,
      [day]: data,
    }))

    setSelectedDay(null)
    alert('Treino salvo! Você pode adicionar outro dia ou finalizar.')
  }

  async function saveTemplate() {
    if (!templateName.trim()) {
      alert('Digite um nome para o template')
      return
    }

    if (Object.keys(dayData).length === 0) {
      alert('Adicione pelo menos um dia de treino')
      return
    }

    try {
      const updatedTemplate = {
        id: templateId,
        nome_template: templateName,
        descricao: description.trim() || null,
        ...Object.fromEntries(
          DAY_NAMES.map((day) => [day, dayData[day] || null])
        ),
        updated_at: new Date().toISOString(),
      }

      const response = await fetch('/api/templates/workouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTemplate),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar template')
      }

      alert('Template atualizado com sucesso!')
      router.push('/templates/workouts')
    } catch (error) {
      console.error('Erro ao atualizar template:', error)
      alert('Erro ao atualizar template')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    )
  }

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
          initialData={dayData[selectedDay]}
          onSubmit={(data) => handleDaySubmit(selectedDay, data)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Editar Template de Treino</h1>
        <button
          onClick={() => router.push('/templates/workouts')}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          ← Voltar
        </button>
      </div>

      {/* Informações do Template */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Informações do Template</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Template *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: Treino ABC Hipertrofia"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva quando usar este template..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Dias da Semana */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Dias da Semana</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAY_NAMES.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`p-4 rounded-lg border-2 transition ${
                dayData[day]
                  ? 'border-green-500 bg-green-50 hover:bg-green-100'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{DAY_LABELS[day]}</span>
                {dayData[day] && (
                  <span className="text-green-600 text-xl">✓</span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {dayData[day] ? 'Clique para editar' : 'Clique para adicionar'}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          {Object.keys(dayData).length > 0 && (
            <p>{Object.keys(dayData).length} dia(s) adicionado(s)</p>
          )}
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push('/templates/workouts')}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
        >
          Cancelar
        </button>
        <button
          onClick={saveTemplate}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  )
}
