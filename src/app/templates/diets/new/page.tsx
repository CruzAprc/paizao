'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
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

export default function NewDietTemplatePage() {
  const router = useRouter()
  const [templateName, setTemplateName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedMeal, setSelectedMeal] = useState<typeof MEAL_NAMES[number] | null>(null)
  const [mealData, setMealData] = useState<Record<string, DietMealFormValues>>({})

  async function handleMealSubmit(meal: typeof MEAL_NAMES[number], data: DietMealFormValues) {
    setMealData((prev) => ({
      ...prev,
      [meal]: data,
    }))

    setSelectedMeal(null)
    alert('Refeição salva! Você pode adicionar outra refeição ou finalizar.')
  }

  async function saveTemplate() {
    if (!templateName.trim()) {
      alert('Digite um nome para o template')
      return
    }

    if (Object.keys(mealData).length === 0) {
      alert('Adicione pelo menos uma refeição')
      return
    }

    try {
      const template = {
        nome_template: templateName,
        descricao: description.trim() || null,
        ...Object.fromEntries(
          MEAL_NAMES.map((meal) => [meal, mealData[meal] || null])
        ),
      }

      const response = await fetch('/api/templates/diets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar template')
      }

      alert('Template de dieta criado com sucesso!')
      router.push('/templates/diets')
    } catch (error) {
      console.error('Erro ao criar template:', error)
      alert('Erro ao criar template de dieta')
    }
  }

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
          initialData={mealData[selectedMeal]}
          onSubmit={(data) => handleMealSubmit(selectedMeal, data)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Novo Template de Dieta</h1>
        <button
          onClick={() => router.push('/templates/diets')}
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
              placeholder="Ex: Dieta Low Carb Padrão"
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

      {/* Refeições */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Refeições</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEAL_NAMES.map((meal) => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`p-4 rounded-lg border-2 transition ${
                mealData[meal]
                  ? 'border-green-500 bg-green-50 hover:bg-green-100'
                  : 'border-gray-300 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{MEAL_LABELS[meal]}</span>
                {mealData[meal] && (
                  <span className="text-green-600 text-xl">✓</span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {mealData[meal] ? 'Clique para editar' : 'Clique para adicionar'}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          {Object.keys(mealData).length > 0 && (
            <p>{Object.keys(mealData).length} refeição(ões) adicionada(s)</p>
          )}
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push('/templates/diets')}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold"
        >
          Cancelar
        </button>
        <button
          onClick={saveTemplate}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
        >
          Salvar Template
        </button>
      </div>
    </div>
  )
}
