'use client'

import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { dietMealSchema, type DietMealFormValues } from '@/lib/schemas'
import { useState } from 'react'

interface DietFormProps {
  initialData?: DietMealFormValues
  onSubmit: (data: DietMealFormValues) => Promise<void>
  mealName: string
}

export default function DietForm({ initialData, onSubmit, mealName }: DietFormProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<DietMealFormValues>({
    resolver: zodResolver(dietMealSchema),
    defaultValues: initialData || {
      macros: {
        calorias: '',
        gorduras: '',
        proteinas: '',
        carboidratos: '',
      },
      alimentos: [''],
      substituicoes: [],
    },
  })

  const {
    fields: alimentosFields,
    append: appendAlimento,
    remove: removeAlimento,
  } = useFieldArray({
    control: control as any,
    name: 'alimentos',
  })

  const {
    fields: substituicoesFields,
    append: appendSubstituicao,
    remove: removeSubstituicao,
  } = useFieldArray({
    control: control as any,
    name: 'substituicoes',
  })

  const onSubmitForm = async (data: DietMealFormValues) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{mealName}</h2>

      {/* Macros */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Macronutrientes</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Calorias
            </label>
            <input
              {...register('macros.calorias')}
              type="text"
              placeholder="Ex: 382"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.macros?.calorias && (
              <p className="text-red-500 text-sm mt-1">{errors.macros.calorias.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proteínas
            </label>
            <input
              {...register('macros.proteinas')}
              type="text"
              placeholder="Ex: 16g"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.macros?.proteinas && (
              <p className="text-red-500 text-sm mt-1">{errors.macros.proteinas.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carboidratos
            </label>
            <input
              {...register('macros.carboidratos')}
              type="text"
              placeholder="Ex: 52g"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.macros?.carboidratos && (
              <p className="text-red-500 text-sm mt-1">{errors.macros.carboidratos.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gorduras
            </label>
            <input
              {...register('macros.gorduras')}
              type="text"
              placeholder="Ex: 10g"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.macros?.gorduras && (
              <p className="text-red-500 text-sm mt-1">{errors.macros.gorduras.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Alimentos */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Alimentos</h3>
          <button
            type="button"
            onClick={() => appendAlimento('')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            + Adicionar Alimento
          </button>
        </div>

        <div className="space-y-3">
          {alimentosFields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`alimentos.${index}`)}
                type="text"
                placeholder="Ex: 2 ovos mexidos"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {alimentosFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAlimento(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Remover
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.alimentos && (
          <p className="text-red-500 text-sm mt-2">{errors.alimentos.message}</p>
        )}
      </div>

      {/* Substituições */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Substituições</h3>
          <button
            type="button"
            onClick={() => appendSubstituicao({ original: '', opcoes: [''] })}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            + Adicionar Substituição
          </button>
        </div>

        <div className="space-y-4">
          {substituicoesFields.map((field, index) => (
            <SubstituicaoField
              key={field.id}
              index={index}
              register={register}
              control={control}
              onRemove={() => removeSubstituicao(index)}
              errors={errors}
            />
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Salvar Refeição'}
        </button>
      </div>
    </form>
  )
}

// Componente auxiliar para campos de substituição
function SubstituicaoField({ index, register, control, onRemove, errors }: any) {
  const {
    fields: opcoesFields,
    append: appendOpcao,
    remove: removeOpcao,
  } = useFieldArray({
    control: control as any,
    name: `substituicoes.${index}.opcoes`,
  })

  return (
    <div className="border border-gray-200 p-4 rounded-md">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium text-gray-700">Substituição {index + 1}</h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Remover
        </button>
      </div>

      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Alimento Original
        </label>
        <input
          {...register(`substituicoes.${index}.original`)}
          type="text"
          placeholder="Ex: ovos mexidos (2 unid)"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        {errors.substituicoes?.[index]?.original && (
          <p className="text-red-500 text-sm mt-1">
            {errors.substituicoes[index].original.message}
          </p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Opções</label>
          <button
            type="button"
            onClick={() => appendOpcao('')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Adicionar Opção
          </button>
        </div>

        <div className="space-y-2">
          {opcoesFields.map((field, opcaoIndex) => (
            <div key={field.id} className="flex gap-2">
              <input
                {...register(`substituicoes.${index}.opcoes.${opcaoIndex}`)}
                type="text"
                placeholder="Ex: ovos cozidos (2 unid)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {opcoesFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOpcao(opcaoIndex)}
                  className="px-3 py-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition"
                >
                  X
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
