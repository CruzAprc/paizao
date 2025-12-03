'use client'

import { useEffect, useState, useCallback } from 'react'
import { type DietPlan, type WorkoutPlan, type AppUser, type UserProfile, type Video, type Exercicio } from '@/lib/supabase'
import Link from 'next/link'

interface FullClientData {
  user: AppUser
  profile: UserProfile | null
  diets: DietPlan[]
  workouts: WorkoutPlan[]
  videos: Video[]
  exercicios: Exercicio[]
}

type MealKey = 'cafe_da_manha' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia'
type DayKey = 'segunda_feira' | 'terca_feira' | 'quarta_feira' | 'quinta_feira' | 'sexta_feira' | 'sabado' | 'domingo'

const MEAL_LABELS: Record<MealKey, string> = {
  cafe_da_manha: 'Café da Manhã',
  lanche_manha: 'Lanche da Manhã',
  almoco: 'Almoço',
  lanche_tarde: 'Lanche da Tarde',
  jantar: 'Jantar',
  ceia: 'Ceia',
}

const DAY_LABELS: Record<DayKey, string> = {
  segunda_feira: 'Segunda-feira',
  terca_feira: 'Terça-feira',
  quarta_feira: 'Quarta-feira',
  quinta_feira: 'Quinta-feira',
  sexta_feira: 'Sexta-feira',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

export default function HomePage() {
  const [searchEmail, setSearchEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState<FullClientData | null>(null)
  const [searchError, setSearchError] = useState('')

  // Estados para edição inline
  const [editingMeal, setEditingMeal] = useState<{dietId: string, mealKey: MealKey} | null>(null)
  const [editingDay, setEditingDay] = useState<{workoutId: string, dayKey: DayKey} | null>(null)
  const [saving, setSaving] = useState(false)

  // Buscar cliente completo por email
  const searchClient = useCallback(async () => {
    if (!searchEmail.trim()) {
      setSelectedClient(null)
      setSearchError('')
      return
    }

    setLoading(true)
    setSearchError('')

    try {
      const response = await fetch(`/api/client/search?email=${encodeURIComponent(searchEmail)}`)
      const data = await response.json()

      if (data.found) {
        setSelectedClient({
          user: data.user,
          profile: data.profile,
          diets: data.diets,
          workouts: data.workouts,
          videos: data.videos || [],
          exercicios: data.exercicios || []
        })
        setSearchError('')
      } else {
        setSelectedClient(null)
        setSearchError(data.message || 'Cliente não encontrado')
      }
    } catch (error) {
      console.error('Erro na busca:', error)
      setSearchError('Erro ao buscar cliente')
      setSelectedClient(null)
    } finally {
      setLoading(false)
    }
  }, [searchEmail])

  // Debounce da busca
  useEffect(() => {
    const timer = setTimeout(() => {
      searchClient()
    }, 600)
    return () => clearTimeout(timer)
  }, [searchEmail, searchClient])

  const clearSearch = () => {
    setSearchEmail('')
    setSelectedClient(null)
    setSearchError('')
    setEditingMeal(null)
    setEditingDay(null)
  }

  // Salvar refeição
  const saveMeal = async (dietId: string, mealKey: MealKey, mealData: any) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/diets/${dietId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [mealKey]: mealData })
      })

      if (!response.ok) throw new Error('Erro ao salvar')

      // Atualizar dados locais
      if (selectedClient) {
        const updatedDiets = selectedClient.diets.map(d =>
          d.id === dietId ? { ...d, [mealKey]: mealData } : d
        )
        setSelectedClient({ ...selectedClient, diets: updatedDiets })
      }

      setEditingMeal(null)
      alert('Refeição salva com sucesso!')
    } catch (error) {
      alert('Erro ao salvar refeição')
    } finally {
      setSaving(false)
    }
  }

  // Salvar dia de treino
  const saveDay = async (workoutId: string, dayKey: DayKey, dayData: any) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [dayKey]: dayData })
      })

      if (!response.ok) throw new Error('Erro ao salvar')

      // Atualizar dados locais
      if (selectedClient) {
        const updatedWorkouts = selectedClient.workouts.map(w =>
          w.id === workoutId ? { ...w, [dayKey]: dayData } : w
        )
        setSelectedClient({ ...selectedClient, workouts: updatedWorkouts })
      }

      setEditingDay(null)
      alert('Treino salvo com sucesso!')
    } catch (error) {
      alert('Erro ao salvar treino')
    } finally {
      setSaving(false)
    }
  }

  // Encontrar vídeo por nome do exercício
  const findVideoForExercise = (exerciseName: string) => {
    if (!selectedClient?.videos) return null
    return selectedClient.videos.find(v =>
      v.exercicio.toLowerCase().includes(exerciseName.toLowerCase()) ||
      v.nome.toLowerCase().includes(exerciseName.toLowerCase())
    )
  }

  // Componente de edição de refeição inline
  const MealEditor = ({ diet, mealKey, onSave, onCancel }: {
    diet: DietPlan,
    mealKey: MealKey,
    onSave: (data: any) => void,
    onCancel: () => void
  }) => {
    const meal = diet[mealKey] as any || { macros: {}, alimentos: [''], substituicoes: [] }
    const [formData, setFormData] = useState({
      macros: {
        calorias: meal.macros?.calorias || '',
        proteinas: meal.macros?.proteinas || '',
        carboidratos: meal.macros?.carboidratos || '',
        gorduras: meal.macros?.gorduras || ''
      },
      alimentos: meal.alimentos?.length ? meal.alimentos : [''],
      substituicoes: meal.substituicoes || []
    })

    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
        <h5 className="font-bold text-gray-900 mb-4">Editando: {MEAL_LABELS[mealKey]}</h5>

        {/* Macros */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div>
            <label className="text-xs text-gray-600">Calorias</label>
            <input
              type="text"
              value={formData.macros.calorias}
              onChange={e => setFormData({...formData, macros: {...formData.macros, calorias: e.target.value}})}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Proteínas</label>
            <input
              type="text"
              value={formData.macros.proteinas}
              onChange={e => setFormData({...formData, macros: {...formData.macros, proteinas: e.target.value}})}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Carbos</label>
            <input
              type="text"
              value={formData.macros.carboidratos}
              onChange={e => setFormData({...formData, macros: {...formData.macros, carboidratos: e.target.value}})}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Gorduras</label>
            <input
              type="text"
              value={formData.macros.gorduras}
              onChange={e => setFormData({...formData, macros: {...formData.macros, gorduras: e.target.value}})}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        </div>

        {/* Alimentos */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Alimentos</label>
            <button
              type="button"
              onClick={() => setFormData({...formData, alimentos: [...formData.alimentos, '']})}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded"
            >
              + Adicionar
            </button>
          </div>
          {formData.alimentos.map((alimento: string, idx: number) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                type="text"
                value={alimento}
                onChange={e => {
                  const newAlimentos = [...formData.alimentos]
                  newAlimentos[idx] = e.target.value
                  setFormData({...formData, alimentos: newAlimentos})
                }}
                className="flex-1 px-2 py-1 border rounded text-sm"
                placeholder="Ex: 2 ovos mexidos"
              />
              {formData.alimentos.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const newAlimentos = formData.alimentos.filter((_: any, i: number) => i !== idx)
                    setFormData({...formData, alimentos: newAlimentos})
                  }}
                  className="text-red-600 text-sm px-2"
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Botões */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    )
  }

  // Componente de edição de dia de treino inline
  const DayEditor = ({ workout, dayKey, onSave, onCancel, exercicios }: {
    workout: WorkoutPlan,
    dayKey: DayKey,
    onSave: (data: any) => void,
    onCancel: () => void,
    exercicios: Exercicio[]
  }) => {
    const day = workout[dayKey] as any || { treino: {}, exercicios: [], dicas: [], proxima_semana: {} }
    const [formData, setFormData] = useState({
      treino: {
        foco: day.treino?.foco || '',
        duracao: day.treino?.duracao || '',
        intensidade: day.treino?.intensidade || ''
      },
      exercicios: day.exercicios?.length ? day.exercicios : [{ nome: '', series: '', repeticoes: '', descanso: '', observacoes: '' }],
      dicas: day.dicas || [],
      proxima_semana: day.proxima_semana || {}
    })

    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
        <h5 className="font-bold text-gray-900 mb-4">Editando: {DAY_LABELS[dayKey]}</h5>

        {/* Info do treino */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div>
            <label className="text-xs text-gray-600">Foco</label>
            <input
              type="text"
              value={formData.treino.foco}
              onChange={e => setFormData({...formData, treino: {...formData.treino, foco: e.target.value}})}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="Ex: Peito e Tríceps"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Duração</label>
            <input
              type="text"
              value={formData.treino.duracao}
              onChange={e => setFormData({...formData, treino: {...formData.treino, duracao: e.target.value}})}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="Ex: 60 min"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Intensidade</label>
            <input
              type="text"
              value={formData.treino.intensidade}
              onChange={e => setFormData({...formData, treino: {...formData.treino, intensidade: e.target.value}})}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="Ex: Alta"
            />
          </div>
        </div>

        {/* Exercícios */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">Exercícios</label>
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                exercicios: [...formData.exercicios, { nome: '', series: '', repeticoes: '', descanso: '', observacoes: '', exercise_id: '' }]
              })}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
            >
              + Adicionar
            </button>
          </div>
          {formData.exercicios.map((ex: any, idx: number) => {
            const selectedExercicio = exercicios.find(e => e.id === ex.exercise_id || e.nome === ex.nome)
            return (
              <div key={idx} className="bg-white p-3 rounded border mb-2">
                <div className="mb-2">
                  <label className="block text-xs text-gray-600 mb-1">Exercício</label>
                  <select
                    value={ex.exercise_id || selectedExercicio?.id || ''}
                    onChange={e => {
                      const exercicio = exercicios.find(ex => ex.id === e.target.value)
                      if (exercicio) {
                        const newExercicios = [...formData.exercicios]
                        newExercicios[idx] = {...ex, nome: exercicio.nome, exercise_id: exercicio.id}
                        setFormData({...formData, exercicios: newExercicios})
                      }
                    }}
                    className="w-full px-2 py-2 border rounded text-sm bg-white"
                  >
                    <option value="">Selecione um exercício...</option>
                    {exercicios.map(e => (
                      <option key={e.id} value={e.id}>{e.nome}</option>
                    ))}
                  </select>
                  {selectedExercicio && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium">✓ {selectedExercicio.nome}</span>
                      {selectedExercicio.url && (
                        <a
                          href={selectedExercicio.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600"
                        >
                          ▶ Ver vídeo
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={ex.series}
                    onChange={e => {
                      const newExercicios = [...formData.exercicios]
                      newExercicios[idx] = {...ex, series: e.target.value}
                      setFormData({...formData, exercicios: newExercicios})
                    }}
                    className="px-2 py-1 border rounded text-sm"
                    placeholder="Séries"
                  />
                  <input
                    type="text"
                    value={ex.repeticoes}
                    onChange={e => {
                      const newExercicios = [...formData.exercicios]
                      newExercicios[idx] = {...ex, repeticoes: e.target.value}
                      setFormData({...formData, exercicios: newExercicios})
                    }}
                    className="px-2 py-1 border rounded text-sm"
                    placeholder="Reps"
                  />
                  <input
                    type="text"
                    value={ex.descanso}
                    onChange={e => {
                      const newExercicios = [...formData.exercicios]
                      newExercicios[idx] = {...ex, descanso: e.target.value}
                      setFormData({...formData, exercicios: newExercicios})
                    }}
                    className="px-2 py-1 border rounded text-sm"
                    placeholder="Descanso"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newExercicios = formData.exercicios.filter((_: any, i: number) => i !== idx)
                      setFormData({...formData, exercicios: newExercicios.length ? newExercicios : [{ nome: '', series: '', repeticoes: '', descanso: '', observacoes: '', exercise_id: '' }]})
                    }}
                    className="text-red-600 text-sm"
                  >
                    Remover
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Botões */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg text-sm"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    )
  }

  // Componente para renderizar refeição (com botão editar)
  const MealCard = ({ diet, mealKey }: { diet: DietPlan, mealKey: MealKey }) => {
    const meal = diet[mealKey] as any
    const isEditing = editingMeal?.dietId === diet.id && editingMeal?.mealKey === mealKey

    if (isEditing) {
      return (
        <MealEditor
          diet={diet}
          mealKey={mealKey}
          onSave={(data) => saveMeal(diet.id, mealKey, data)}
          onCancel={() => setEditingMeal(null)}
        />
      )
    }

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <h5 className="font-semibold text-gray-900">{MEAL_LABELS[mealKey]}</h5>
          <button
            onClick={() => setEditingMeal({ dietId: diet.id, mealKey })}
            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
          >
            Editar
          </button>
        </div>
        {!meal ? (
          <p className="text-gray-400 text-sm italic">Não configurada</p>
        ) : (
          <>
            {meal.macros && (
              <div className="grid grid-cols-4 gap-1 mb-3 text-xs">
                <div className="bg-white rounded p-1 text-center">
                  <p className="text-gray-500">Cal</p>
                  <p className="font-bold text-gray-900">{meal.macros.calorias}</p>
                </div>
                <div className="bg-white rounded p-1 text-center">
                  <p className="text-gray-500">Prot</p>
                  <p className="font-bold text-gray-900">{meal.macros.proteinas}</p>
                </div>
                <div className="bg-white rounded p-1 text-center">
                  <p className="text-gray-500">Carb</p>
                  <p className="font-bold text-gray-900">{meal.macros.carboidratos}</p>
                </div>
                <div className="bg-white rounded p-1 text-center">
                  <p className="text-gray-500">Gord</p>
                  <p className="font-bold text-gray-900">{meal.macros.gorduras}</p>
                </div>
              </div>
            )}
            {meal.alimentos && meal.alimentos.length > 0 && (
              <ul className="text-sm text-gray-600 space-y-1">
                {meal.alimentos.map((alimento: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-green-500">•</span>
                    {alimento}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    )
  }

  // Componente para renderizar dia de treino (com botão editar e vídeos)
  const WorkoutDayCard = ({ workout, dayKey }: { workout: WorkoutPlan, dayKey: DayKey }) => {
    const day = workout[dayKey] as any
    const isEditing = editingDay?.workoutId === workout.id && editingDay?.dayKey === dayKey

    if (isEditing) {
      return (
        <DayEditor
          workout={workout}
          dayKey={dayKey}
          onSave={(data) => saveDay(workout.id, dayKey, data)}
          onCancel={() => setEditingDay(null)}
          exercicios={selectedClient?.exercicios || []}
        />
      )
    }

    if (!day || !day.treino) {
      return (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h5 className="font-semibold text-gray-500">{DAY_LABELS[dayKey]}</h5>
            <button
              onClick={() => setEditingDay({ workoutId: workout.id, dayKey })}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Configurar
            </button>
          </div>
          <p className="text-gray-400 text-sm italic">Descanso ou não configurado</p>
        </div>
      )
    }

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <h5 className="font-semibold text-gray-900">{DAY_LABELS[dayKey]}</h5>
          <button
            onClick={() => setEditingDay({ workoutId: workout.id, dayKey })}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
          >
            Editar
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 mb-3 text-xs">
          <div className="bg-white rounded p-1 text-center">
            <p className="text-gray-500">Foco</p>
            <p className="font-bold text-gray-900 truncate">{day.treino.foco}</p>
          </div>
          <div className="bg-white rounded p-1 text-center">
            <p className="text-gray-500">Duração</p>
            <p className="font-bold text-gray-900">{day.treino.duracao}</p>
          </div>
          <div className="bg-white rounded p-1 text-center">
            <p className="text-gray-500">Intensidade</p>
            <p className="font-bold text-gray-900">{day.treino.intensidade}</p>
          </div>
        </div>
        {day.exercicios && day.exercicios.length > 0 && (
          <div className="space-y-2">
            {day.exercicios.map((ex: any, idx: number) => {
              const video = findVideoForExercise(ex.nome)
              return (
                <div key={idx} className="bg-white rounded p-2 text-sm">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ex.nome}</p>
                      <p className="text-gray-600 text-xs">
                        {ex.series} x {ex.repeticoes} | {ex.descanso}
                      </p>
                    </div>
                    {video && (
                      <a
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 flex items-center gap-1"
                      >
                        ▶ Vídeo
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com busca */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Clientes</h1>
            <p className="text-gray-600 mt-1">Digite o email do cliente para ver e editar todos os dados</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Digite o email do cliente..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-500 text-lg"
            />
            {searchEmail && (
              <button onClick={clearSearch} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium">
                Limpar
              </button>
            )}
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              Buscando...
            </div>
          )}
          {searchError && <p className="text-red-600">{searchError}</p>}
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/diets/new" className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl shadow-sm transition">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center"><span className="text-xl font-bold">+</span></div>
          <div><p className="font-semibold">Nova Dieta</p><p className="text-green-100 text-sm">Criar plano alimentar</p></div>
        </Link>
        <Link href="/workouts/new" className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-sm transition">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center"><span className="text-xl font-bold">+</span></div>
          <div><p className="font-semibold">Novo Treino</p><p className="text-blue-100 text-sm">Criar plano de treino</p></div>
        </Link>
        <Link href="/templates/diets" className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl shadow-sm transition">
          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center"><span className="text-lg font-bold">T</span></div>
          <div><p className="font-semibold">Templates</p><p className="text-purple-100 text-sm">Gerenciar modelos</p></div>
        </Link>
      </div>

      {/* Cliente selecionado */}
      {selectedClient && (
        <div className="space-y-6">
          {/* Header do cliente */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">{selectedClient.user.nome?.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedClient.user.nome}</h2>
                  <p className="text-purple-200">{selectedClient.user.email}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="px-3 py-1 bg-green-500 rounded-full text-sm font-medium">{selectedClient.diets.length} Dieta(s)</span>
                <span className="px-3 py-1 bg-blue-500 rounded-full text-sm font-medium">{selectedClient.workouts.length} Treino(s)</span>
                <span className="px-3 py-1 bg-red-500 rounded-full text-sm font-medium">{selectedClient.videos.length} Vídeo(s)</span>
              </div>
            </div>
          </div>

          {/* ANAMNESE */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-orange-500 px-6 py-3">
              <h3 className="text-lg font-bold text-white">Anamnese / Perfil</h3>
            </div>
            <div className="p-6">
              {!selectedClient.profile ? (
                <p className="text-gray-500 text-center py-4">Nenhuma anamnese cadastrada</p>
              ) : (
                <div className="space-y-4">
                  {/* Campos principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedClient.profile.nome_completo && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase">Nome Completo</p><p className="font-medium text-gray-900">{selectedClient.profile.nome_completo}</p></div>}
                    {selectedClient.profile.data_nascimento && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase">Data de Nascimento</p><p className="font-medium text-gray-900">{new Date(selectedClient.profile.data_nascimento).toLocaleDateString('pt-BR')}</p></div>}
                    {selectedClient.profile.altura && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase">Altura</p><p className="font-medium text-gray-900">{selectedClient.profile.altura} cm</p></div>}
                    {selectedClient.profile.peso && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase">Peso</p><p className="font-medium text-gray-900">{selectedClient.profile.peso} kg</p></div>}
                    {selectedClient.profile.objetivo && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase">Objetivo</p><p className="font-medium text-gray-900">{selectedClient.profile.objetivo}</p></div>}
                    {selectedClient.profile.nivel_atividade && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase">Nível de Atividade</p><p className="font-medium text-gray-900">{selectedClient.profile.nivel_atividade}</p></div>}
                  </div>

                  {/* Campos de texto longo */}
                  <div className="grid grid-cols-1 gap-4">
                    {selectedClient.profile.restricoes_alimentares && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase">Restrições Alimentares</p><p className="font-medium text-gray-900">{selectedClient.profile.restricoes_alimentares}</p></div>}
                    {selectedClient.profile.preferencias_alimentares && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase">Preferências Alimentares</p><p className="font-medium text-gray-900">{selectedClient.profile.preferencias_alimentares}</p></div>}
                    {selectedClient.profile.historico_medico && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase">Histórico Médico</p><p className="font-medium text-gray-900">{selectedClient.profile.historico_medico}</p></div>}
                    {selectedClient.profile.medicamentos && <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500 uppercase">Medicamentos</p><p className="font-medium text-gray-900">{selectedClient.profile.medicamentos}</p></div>}
                  </div>

                  {/* Campos dinâmicos (outros campos que existam no banco) */}
                  {Object.entries(selectedClient.profile)
                    .filter(([key, value]) =>
                      value !== null &&
                      value !== undefined &&
                      value !== '' &&
                      !['id', 'user_id', 'nome_completo', 'data_nascimento', 'altura', 'peso',
                        'objetivo', 'nivel_atividade', 'restricoes_alimentares',
                        'preferencias_alimentares', 'historico_medico', 'medicamentos',
                        'created_at', 'updated_at'].includes(key)
                    ).length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2 border-t pt-3">Outras Informações</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(selectedClient.profile)
                          .filter(([key, value]) =>
                            value !== null &&
                            value !== undefined &&
                            value !== '' &&
                            !['id', 'user_id', 'nome_completo', 'data_nascimento', 'altura', 'peso',
                              'objetivo', 'nivel_atividade', 'restricoes_alimentares',
                              'preferencias_alimentares', 'historico_medico', 'medicamentos',
                              'created_at', 'updated_at'].includes(key)
                          )
                          .map(([key, value]) => (
                            <div key={key} className="bg-orange-50 p-3 rounded-lg">
                              <p className="text-xs text-gray-500 uppercase">{key.replace(/_/g, ' ')}</p>
                              <p className="font-medium text-gray-900">
                                {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                              </p>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* DIETAS */}
          {selectedClient.diets.map((diet) => (
            <div key={diet.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-green-600 px-6 py-3">
                <h3 className="text-lg font-bold text-white">{diet.nome_plano}</h3>
                <p className="text-green-100 text-sm">Duração: {diet.duracao_dias || 30} dias - Clique em "Editar" para modificar cada refeição</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(['cafe_da_manha', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'] as MealKey[]).map(mealKey => (
                    <MealCard key={mealKey} diet={diet} mealKey={mealKey} />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {selectedClient.diets.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Nenhuma dieta cadastrada</p>
              <Link href="/diets/new" className="mt-3 inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Criar Dieta</Link>
            </div>
          )}

          {/* TREINOS */}
          {selectedClient.workouts.map((workout) => (
            <div key={workout.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-600 px-6 py-3">
                <h3 className="text-lg font-bold text-white">{workout.nome_plano}</h3>
                <p className="text-blue-100 text-sm">Duração: {workout.duracao_semanas || 4} semanas - Clique em "Editar" para modificar cada dia</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {(['segunda_feira', 'terca_feira', 'quarta_feira', 'quinta_feira', 'sexta_feira', 'sabado', 'domingo'] as DayKey[]).map(dayKey => (
                    <WorkoutDayCard key={dayKey} workout={workout} dayKey={dayKey} />
                  ))}
                </div>
              </div>
            </div>
          ))}

          {selectedClient.workouts.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Nenhum treino cadastrado</p>
              <Link href="/workouts/new" className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Criar Treino</Link>
            </div>
          )}
        </div>
      )}

      {/* Mensagem inicial */}
      {!selectedClient && !searchEmail && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🔍</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Busque um cliente</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Digite o email do cliente para visualizar e editar todas as informações na mesma tela.
          </p>
        </div>
      )}
    </div>
  )
}
