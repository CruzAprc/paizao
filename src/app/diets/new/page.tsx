'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type AppUser, type DietTemplate } from '@/lib/supabase'
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

export default function NewDietPage() {
  const router = useRouter()
  const [searchEmail, setSearchEmail] = useState('')
  const [users, setUsers] = useState<AppUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)
  const [planName, setPlanName] = useState('')
  const [duration, setDuration] = useState('30')
  const [selectedMeal, setSelectedMeal] = useState<typeof MEAL_NAMES[number] | null>(null)
  const [mealData, setMealData] = useState<Record<string, DietMealFormValues>>({})
  const [searching, setSearching] = useState(false)
  const [templates, setTemplates] = useState<DietTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  useEffect(() => {
    loadTemplates()
  }, [])

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

  function applyTemplate() {
    const template = templates.find(t => t.id === selectedTemplate)
    if (!template) {
      alert('Selecione um template')
      return
    }

    const newMealData: Record<string, DietMealFormValues> = {}
    MEAL_NAMES.forEach((meal) => {
      if (template[meal]) {
        newMealData[meal] = template[meal]
      }
    })

    setMealData(newMealData)
    if (template.nome_template && !planName) {
      setPlanName(template.nome_template)
    }
    alert('Template aplicado com sucesso!')
  }

  async function searchUsers() {
    if (!searchEmail.trim()) {
      alert('Digite um email para buscar')
      return
    }

    setSearching(true)
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .ilike('email', `%${searchEmail}%`)
        .order('nome', { ascending: true })

      if (error) throw error

      setUsers(data || [])

      if (!data || data.length === 0) {
        alert('Nenhum usuário encontrado com esse email')
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
      alert('Erro ao buscar usuários')
    } finally {
      setSearching(false)
    }
  }

  async function handleMealSubmit(meal: typeof MEAL_NAMES[number], data: DietMealFormValues) {
    // Salva os dados da refeição localmente
    setMealData((prev) => ({
      ...prev,
      [meal]: data,
    }))

    // Volta para seleção de refeições
    setSelectedMeal(null)

    alert('Refeição salva! Você pode adicionar outra refeição ou finalizar.')
  }

  async function saveDietPlan() {
    if (!selectedUser) {
      alert('Selecione um cliente')
      return
    }

    if (!planName.trim()) {
      alert('Digite um nome para o plano')
      return
    }

    if (Object.keys(mealData).length === 0) {
      alert('Adicione pelo menos uma refeição')
      return
    }

    try {
      const dietPlan = {
        nome_plano: planName,
        duracao_dias: parseInt(duration),
        user_id: selectedUser.id,
        ...Object.fromEntries(
          MEAL_NAMES.map((meal) => [meal, mealData[meal] || null])
        ),
      }

      const { error } = await supabase.from('diet_plans').insert([dietPlan])

      if (error) throw error

      alert('Plano de dieta criado com sucesso!')
      router.push('/')
    } catch (error) {
      console.error('Erro ao criar plano:', error)
      alert('Erro ao criar plano de dieta')
    }
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
          initialData={mealData[selectedMeal]}
          onSubmit={(data) => handleMealSubmit(selectedMeal, data)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Nova Dieta</h1>

      {/* Busca de Cliente */}
      {!selectedUser && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Buscar Cliente</h2>

          <div className="flex gap-3 mb-4">
            <input
              type="email"
              placeholder="Digite o email do cliente"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={searchUsers}
              disabled={searching}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:bg-gray-400"
            >
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {users.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700">Resultados:</h3>
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{user.nome}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(user)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    Selecionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Informações do Plano */}
      {selectedUser && (
        <>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-700">Cliente Selecionado</h2>
                <p className="text-gray-600">
                  <strong>Nome:</strong> {selectedUser.nome}
                </p>
                <p className="text-gray-600">
                  <strong>Email:</strong> {selectedUser.email}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setUsers([])
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition text-sm"
              >
                Trocar Cliente
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Plano
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dieta para Ganho de Massa"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (dias)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
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
          </div>

          {/* Seleção de Refeições */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Refeições</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
                  <p className="font-medium text-gray-700">{MEAL_LABELS[meal]}</p>
                  {mealData[meal] && (
                    <p className="text-xs text-green-600 mt-1">✓ Configurada</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Botão Finalizar */}
          <div className="flex justify-end">
            <button
              onClick={saveDietPlan}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Salvar Plano de Dieta
            </button>
          </div>
        </>
      )}
    </div>
  )
}
