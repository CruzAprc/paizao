'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, type AppUser, type WorkoutTemplate } from '@/lib/supabase'
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

export default function NewWorkoutPage() {
  const router = useRouter()
  const [searchEmail, setSearchEmail] = useState('')
  const [users, setUsers] = useState<AppUser[]>([])
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)
  const [planName, setPlanName] = useState('')
  const [duration, setDuration] = useState('4')
  const [selectedDay, setSelectedDay] = useState<typeof DAY_NAMES[number] | null>(null)
  const [dayData, setDayData] = useState<Record<string, Workout>>({})
  const [searching, setSearching] = useState(false)
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  useEffect(() => {
    loadTemplates()
  }, [])

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

  function applyTemplate() {
    const template = templates.find(t => t.id === selectedTemplate)
    if (!template) {
      alert('Selecione um template')
      return
    }

    const newDayData: Record<string, Workout> = {}
    DAY_NAMES.forEach((day) => {
      if (template[day]) {
        newDayData[day] = template[day]
      }
    })

    setDayData(newDayData)
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

  async function handleDaySubmit(day: typeof DAY_NAMES[number], data: Workout) {
    // Salva os dados do dia localmente
    setDayData((prev) => ({
      ...prev,
      [day]: data,
    }))

    // Volta para seleção de dias
    setSelectedDay(null)

    alert('Treino do dia salvo! Você pode adicionar outro dia ou finalizar.')
  }

  async function saveWorkoutPlan() {
    if (!selectedUser) {
      alert('Selecione um cliente')
      return
    }

    if (!planName.trim()) {
      alert('Digite um nome para o plano')
      return
    }

    if (Object.keys(dayData).length === 0) {
      alert('Adicione pelo menos um dia de treino')
      return
    }

    try {
      const workoutPlan = {
        nome_plano: planName,
        duracao_semanas: parseInt(duration),
        user_id: selectedUser.id,
        ...Object.fromEntries(
          DAY_NAMES.map((day) => [day, dayData[day] || null])
        ),
      }

      const { error } = await supabase.from('workout_plans').insert([workoutPlan])

      if (error) throw error

      alert('Plano de treino criado com sucesso!')
      router.push('/')
    } catch (error) {
      console.error('Erro ao criar plano:', error)
      alert('Erro ao criar plano de treino')
    }
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
          initialData={dayData[selectedDay]}
          onSubmit={(data) => handleDaySubmit(selectedDay, data)}
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Novo Treino</h1>

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
                  placeholder="Ex: Treino Hipertrofia 12 Semanas"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (semanas)
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

          {/* Seleção de Dias */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Dias da Semana</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                  <p className="font-medium text-gray-700">{DAY_LABELS[day]}</p>
                  {dayData[day] && (
                    <p className="text-xs text-green-600 mt-1">✓ Configurado</p>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Botão Finalizar */}
          <div className="flex justify-end">
            <button
              onClick={saveWorkoutPlan}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Salvar Plano de Treino
            </button>
          </div>
        </>
      )}
    </div>
  )
}
