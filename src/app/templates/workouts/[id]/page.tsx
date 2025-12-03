'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, type WorkoutTemplate, type Exercicio } from '@/lib/supabase'

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

type DayKey = typeof DAY_NAMES[number]

export default function EditWorkoutTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [template, setTemplate] = useState<WorkoutTemplate | null>(null)
  const [templateName, setTemplateName] = useState('')
  const [description, setDescription] = useState('')
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [editingDay, setEditingDay] = useState<DayKey | null>(null)

  useEffect(() => {
    loadTemplate()
    loadExercicios()
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
    } catch (error) {
      console.error('Erro ao carregar template:', error)
      alert('Erro ao carregar template')
      router.push('/templates/workouts')
    } finally {
      setLoading(false)
    }
  }

  async function loadExercicios() {
    try {
      const { data, error } = await supabase
        .from('exercicios')
        .select('*')
        .order('nome', { ascending: true })

      if (error) throw error
      setExercicios(data || [])
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error)
    }
  }

  async function saveDay(dayKey: DayKey, dayData: any) {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('workout_templates')
        .update({
          [dayKey]: dayData,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)

      if (error) throw error

      // Atualizar template local
      setTemplate(prev => prev ? { ...prev, [dayKey]: dayData } : null)
      setEditingDay(null)
      alert('Treino do dia salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar treino')
    } finally {
      setSaving(false)
    }
  }

  async function saveTemplateInfo() {
    if (!templateName.trim()) {
      alert('Digite um nome para o template')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('workout_templates')
        .update({
          nome_template: templateName,
          descricao: description.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)

      if (error) throw error
      alert('Informações do template atualizadas!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar informações')
    } finally {
      setSaving(false)
    }
  }

  // Editor de dia de treino
  const DayEditor = ({ dayKey, onSave, onCancel }: {
    dayKey: DayKey,
    onSave: (data: any) => void,
    onCancel: () => void
  }) => {
    const day = template?.[dayKey] as any || { treino: {}, exercicios: [], dicas: [], proxima_semana: {} }
    const [formData, setFormData] = useState({
      treino: {
        foco: day.treino?.foco || '',
        duracao: day.treino?.duracao || '',
        intensidade: day.treino?.intensidade || ''
      },
      exercicios: day.exercicios?.length ? day.exercicios : [{ nome: '', series: '', repeticoes: '', descanso: '', observacoes: '', exercise_id: '' }],
      dicas: day.dicas || [],
      proxima_semana: day.proxima_semana || {}
    })

    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 mb-4 text-xl">Editando: {DAY_LABELS[dayKey]}</h3>

        {/* Info do treino */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foco</label>
            <input
              type="text"
              value={formData.treino.foco}
              onChange={e => setFormData({...formData, treino: {...formData.treino, foco: e.target.value}})}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Ex: Peito e Tríceps"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duração</label>
            <input
              type="text"
              value={formData.treino.duracao}
              onChange={e => setFormData({...formData, treino: {...formData.treino, duracao: e.target.value}})}
              className="w-full px-3 py-2 border rounded-md text-sm"
              placeholder="Ex: 60 min"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intensidade</label>
            <select
              value={formData.treino.intensidade}
              onChange={e => setFormData({...formData, treino: {...formData.treino, intensidade: e.target.value}})}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Selecione...</option>
              <option value="leve">Leve</option>
              <option value="moderada">Moderada</option>
              <option value="alta">Alta</option>
              <option value="muito alta">Muito Alta</option>
            </select>
          </div>
        </div>

        {/* Exercícios */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-lg font-semibold text-gray-700">Exercícios</label>
            <button
              type="button"
              onClick={() => setFormData({
                ...formData,
                exercicios: [...formData.exercicios, { nome: '', series: '', repeticoes: '', descanso: '', observacoes: '', exercise_id: '' }]
              })}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              + Adicionar Exercício
            </button>
          </div>

          {formData.exercicios.map((ex: any, idx: number) => {
            const selectedExercicio = exercicios.find(e => e.id === ex.exercise_id || e.nome === ex.nome)

            return (
              <div key={idx} className="bg-white p-4 rounded-lg border mb-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-gray-700">Exercício {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newExercicios = formData.exercicios.filter((_: any, i: number) => i !== idx)
                      setFormData({...formData, exercicios: newExercicios.length ? newExercicios : [{ nome: '', series: '', repeticoes: '', descanso: '', observacoes: '', exercise_id: '' }]})
                    }}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Remover
                  </button>
                </div>

                {/* Dropdown de exercício */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-600 mb-1">Exercício</label>
                  <select
                    value={ex.exercise_id || selectedExercicio?.id || ''}
                    onChange={e => {
                      const selectedValue = e.target.value
                      const exercicioEncontrado = exercicios.find(exItem =>
                        exItem.id === selectedValue ||
                        String(exItem.id) === String(selectedValue)
                      )

                      if (exercicioEncontrado) {
                        const newExercicios = [...formData.exercicios]
                        newExercicios[idx] = {...ex, nome: exercicioEncontrado.nome, exercise_id: exercicioEncontrado.id}
                        setFormData({...formData, exercicios: newExercicios})
                      } else if (selectedValue === '') {
                        const newExercicios = [...formData.exercicios]
                        newExercicios[idx] = {...ex, nome: '', exercise_id: ''}
                        setFormData({...formData, exercicios: newExercicios})
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                  >
                    <option value="">Selecione um exercício...</option>
                    {exercicios.map(e => (
                      <option key={e.id} value={e.id}>{e.nome}</option>
                    ))}
                  </select>
                  {selectedExercicio && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-green-600 font-medium">✓ {selectedExercicio.nome}</span>
                      {selectedExercicio.url && (
                        <a
                          href={selectedExercicio.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          ▶ Ver vídeo
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* Campos do exercício */}
                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Séries</label>
                    <input
                      type="text"
                      value={ex.series}
                      onChange={e => {
                        const newExercicios = [...formData.exercicios]
                        newExercicios[idx] = {...ex, series: e.target.value}
                        setFormData({...formData, exercicios: newExercicios})
                      }}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Ex: 4"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Repetições</label>
                    <input
                      type="text"
                      value={ex.repeticoes}
                      onChange={e => {
                        const newExercicios = [...formData.exercicios]
                        newExercicios[idx] = {...ex, repeticoes: e.target.value}
                        setFormData({...formData, exercicios: newExercicios})
                      }}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Ex: 10-12"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Descanso</label>
                    <input
                      type="text"
                      value={ex.descanso}
                      onChange={e => {
                        const newExercicios = [...formData.exercicios]
                        newExercicios[idx] = {...ex, descanso: e.target.value}
                        setFormData({...formData, exercicios: newExercicios})
                      }}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Ex: 60 seg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Observações</label>
                    <input
                      type="text"
                      value={ex.observacoes || ''}
                      onChange={e => {
                        const newExercicios = [...formData.exercicios]
                        newExercicios[idx] = {...ex, observacoes: e.target.value}
                        setFormData({...formData, exercicios: newExercicios})
                      }}
                      className="w-full px-2 py-1 border rounded text-sm"
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                {/* Botões de reordenar */}
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => {
                      if (idx > 0) {
                        const newExercicios = [...formData.exercicios]
                        const temp = newExercicios[idx]
                        newExercicios[idx] = newExercicios[idx - 1]
                        newExercicios[idx - 1] = temp
                        setFormData({...formData, exercicios: newExercicios})
                      }
                    }}
                    className={`px-3 py-1 text-xs rounded ${idx === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                  >
                    ↑ Subir
                  </button>
                  <button
                    type="button"
                    disabled={idx === formData.exercicios.length - 1}
                    onClick={() => {
                      if (idx < formData.exercicios.length - 1) {
                        const newExercicios = [...formData.exercicios]
                        const temp = newExercicios[idx]
                        newExercicios[idx] = newExercicios[idx + 1]
                        newExercicios[idx + 1] = temp
                        setFormData({...formData, exercicios: newExercicios})
                      }
                    }}
                    className={`px-3 py-1 text-xs rounded ${idx === formData.exercicios.length - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                  >
                    ↓ Descer
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            disabled={saving}
          >
            {saving ? 'Salvando...' : 'Salvar Treino'}
          </button>
        </div>
      </div>
    )
  }

  // Card de visualização do dia
  const DayCard = ({ dayKey }: { dayKey: DayKey }) => {
    const day = template?.[dayKey] as any

    if (editingDay === dayKey) {
      return (
        <DayEditor
          dayKey={dayKey}
          onSave={(data) => saveDay(dayKey, data)}
          onCancel={() => setEditingDay(null)}
        />
      )
    }

    if (!day || !day.treino) {
      return (
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h5 className="font-semibold text-gray-500">{DAY_LABELS[dayKey]}</h5>
            <button
              onClick={() => setEditingDay(dayKey)}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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
            onClick={() => setEditingDay(dayKey)}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
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
          <div className="space-y-1">
            {day.exercicios.slice(0, 5).map((ex: any, idx: number) => {
              const exercicio = exercicios.find(e => e.id === ex.exercise_id || e.nome === ex.nome)
              return (
                <div key={idx} className="bg-white rounded p-2 text-sm flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{ex.nome}</p>
                    <p className="text-gray-600 text-xs">{ex.series} x {ex.repeticoes} | {ex.descanso}</p>
                  </div>
                  {exercicio?.url && (
                    <a
                      href={exercicio.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                    >
                      ▶
                    </a>
                  )}
                </div>
              )
            })}
            {day.exercicios.length > 5 && (
              <p className="text-xs text-gray-500 text-center">+ {day.exercicios.length - 5} exercícios</p>
            )}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Template *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Ex: Treino ABC Hipertrofia"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva quando usar este template..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <button
          onClick={saveTemplateInfo}
          disabled={saving}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400"
        >
          {saving ? 'Salvando...' : 'Salvar Informações'}
        </button>
      </div>

      {/* Dias da Semana */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Dias da Semana</h2>
        <p className="text-sm text-gray-500 mb-4">Clique em &quot;Editar&quot; ou &quot;Configurar&quot; para modificar cada dia</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DAY_NAMES.map((dayKey) => (
            <DayCard key={dayKey} dayKey={dayKey} />
          ))}
        </div>
      </div>
    </div>
  )
}
