'use client'

import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { workoutSchema, type Workout } from '@/lib/schemas'
import { useState, useEffect } from 'react'
import { supabase, type Video } from '@/lib/supabase'

interface WorkoutFormProps {
  initialData?: Workout
  onSubmit: (data: Workout) => Promise<void>
  dayName?: string
}

export default function WorkoutForm({ initialData, onSubmit, dayName }: WorkoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [exercises, setExercises] = useState<Video[]>([])

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Workout>({
    resolver: zodResolver(workoutSchema),
    defaultValues: initialData || {
      treino: {
        foco: '',
        duracao: '',
        intensidade: '',
      },
      exercicios: [
        {
          nome: '',
          exercise_id: '',
          series: '',
          repeticoes: '',
          descanso: '',
          observacoes: '',
        },
      ],
      dicas: [''],
      proxima_semana: {
        ajustes: '',
        aumento_carga: '',
        novos_exercicios: [],
      },
    },
  })

  const {
    fields: exerciciosFields,
    append: appendExercicio,
    remove: removeExercicio,
  } = useFieldArray({
    control: control as any,
    name: 'exercicios',
  })

  const {
    fields: dicasFields,
    append: appendDica,
    remove: removeDica,
  } = useFieldArray({
    control: control as any,
    name: 'dicas',
  })

  const {
    fields: novosExerciciosFields,
    append: appendNovoExercicio,
    remove: removeNovoExercicio,
  } = useFieldArray({
    control: control as any,
    name: 'proxima_semana.novos_exercicios',
  })

  // Carrega biblioteca de exercícios
  useEffect(() => {
    console.log('[DEBUG] WorkoutForm montado, carregando exercícios...')
    console.log('[DEBUG] initialData:', initialData)
    loadExercises()
  }, [])

  // Log quando exercises mudam
  useEffect(() => {
    console.log('[DEBUG] exercises carregados:', exercises.length, exercises)
  }, [exercises])

  async function loadExercises() {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('id, exercicio, nome')
        .order('exercicio', { ascending: true })

      if (error) throw error
      setExercises((data as any) || [])
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error)
    }
  }

  const onSubmitForm = async (data: Workout) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {dayName && <h2 className="text-2xl font-bold text-gray-800">{dayName}</h2>}

      {/* Informações do Treino */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Informações do Treino</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foco
            </label>
            <input
              {...register('treino.foco')}
              type="text"
              placeholder="Ex: Inferiores/glúteos"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.treino?.foco && (
              <p className="text-red-500 text-sm mt-1">{errors.treino.foco.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duração
            </label>
            <input
              {...register('treino.duracao')}
              type="text"
              placeholder="Ex: 55 minutos"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.treino?.duracao && (
              <p className="text-red-500 text-sm mt-1">{errors.treino.duracao.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Intensidade
            </label>
            <select
              {...register('treino.intensidade')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Selecione...</option>
              <option value="baixa">Baixa</option>
              <option value="moderada">Moderada</option>
              <option value="alta">Alta</option>
              <option value="muito alta">Muito Alta</option>
            </select>
            {errors.treino?.intensidade && (
              <p className="text-red-500 text-sm mt-1">{errors.treino.intensidade.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Exercícios */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Exercícios</h3>
          <button
            type="button"
            onClick={() =>
              appendExercicio({
                nome: '',
                exercise_id: '',
                series: '',
                repeticoes: '',
                descanso: '',
                observacoes: '',
              })
            }
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            + Adicionar Exercício
          </button>
        </div>

        <div className="space-y-4">
          {exerciciosFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 p-4 rounded-md">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-700">Exercício {index + 1}</h4>
                {exerciciosFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExercicio(index)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remover
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Exercício
                  </label>
                  <Controller
                    name={`exercicios.${index}.nome`}
                    control={control}
                    render={({ field }) => {
                      const currentValue = field.value || ''
                      const isCustomValue = currentValue && !exercises.some(e => e.exercicio === currentValue)

                      console.log(`[DEBUG] Exercício ${index}:`, {
                        fieldValue: field.value,
                        currentValue,
                        isCustomValue,
                        exercisesCount: exercises.length,
                      })

                      return (
                        <select
                          value={currentValue}
                          onClick={() => console.log(`[DEBUG] onClick Exercício ${index} - CLICOU!`)}
                          onMouseDown={() => console.log(`[DEBUG] onMouseDown Exercício ${index}`)}
                          onChange={(e) => {
                            const newValue = e.target.value
                            console.log(`[DEBUG] onChange Exercício ${index}:`, {
                              oldValue: currentValue,
                              newValue,
                              event: e.target,
                            })
                            field.onChange(newValue)
                            console.log(`[DEBUG] Após field.onChange:`, {
                              fieldValue: field.value,
                            })
                          }}
                          onFocus={() => console.log(`[DEBUG] onFocus Exercício ${index}`)}
                          onBlur={() => console.log(`[DEBUG] onBlur Exercício ${index}`, field.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}
                        >
                          <option value="">Selecione um exercício...</option>
                          {isCustomValue && (
                            <option value={currentValue}>{currentValue} (atual)</option>
                          )}
                          {exercises.map((exercise) => (
                            <option key={exercise.id} value={exercise.exercicio}>
                              {exercise.exercicio}
                            </option>
                          ))}
                        </select>
                      )
                    }}
                  />
                  {errors.exercicios?.[index]?.nome && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.exercicios[index]?.nome?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Séries
                  </label>
                  <input
                    {...register(`exercicios.${index}.series`)}
                    type="text"
                    placeholder="Ex: 4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {errors.exercicios?.[index]?.series && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.exercicios[index]?.series?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repetições
                  </label>
                  <input
                    {...register(`exercicios.${index}.repeticoes`)}
                    type="text"
                    placeholder="Ex: 8-10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {errors.exercicios?.[index]?.repeticoes && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.exercicios[index]?.repeticoes?.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descanso
                  </label>
                  <input
                    {...register(`exercicios.${index}.descanso`)}
                    type="text"
                    placeholder="Ex: 90 seg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {errors.exercicios?.[index]?.descanso && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.exercicios[index]?.descanso?.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    {...register(`exercicios.${index}.observacoes`)}
                    placeholder="Ex: Foque em amplitude máxima"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        {errors.exercicios && (
          <p className="text-red-500 text-sm mt-2">{errors.exercicios.message}</p>
        )}
      </div>

      {/* Dicas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Dicas</h3>
          <button
            type="button"
            onClick={() => appendDica('')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            + Adicionar Dica
          </button>
        </div>

        <div className="space-y-3">
          {dicasFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`dicas.${index}`)}
                type="text"
                placeholder="Ex: Hidrate-se bem durante o treino"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {dicasFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDica(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Planejamento Próxima Semana */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Planejamento para Próxima Semana</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ajustes
            </label>
            <textarea
              {...register('proxima_semana.ajustes')}
              placeholder="Ex: Inverte a ordem de alguns exercícios"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aumento de Carga
            </label>
            <input
              {...register('proxima_semana.aumento_carga')}
              type="text"
              placeholder="Ex: Aumentar 2,5 kg em agachamento"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Novos Exercícios
              </label>
              <button
                type="button"
                onClick={() => appendNovoExercicio('')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Adicionar
              </button>
            </div>

            <div className="space-y-2">
              {novosExerciciosFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`proxima_semana.novos_exercicios.${index}`)}
                    type="text"
                    placeholder="Ex: Cadeira flexora unilateral"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => removeNovoExercicio(index)}
                    className="px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Salvar Treino'}
        </button>
      </div>
    </form>
  )
}
