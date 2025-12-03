'use client'

import { useEffect, useState } from 'react'
import { supabase, type WorkoutTemplate } from '@/lib/supabase'
import Link from 'next/link'

export default function WorkoutTemplatesPage() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTemplates()
  }, [])

  async function loadTemplates() {
    try {
      const { data, error } = await supabase
        .from('workout_templates')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setTemplates(data || [])
    } catch (error) {
      console.error('Erro ao carregar templates:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteTemplate(id: string) {
    if (!confirm('Tem certeza que deseja deletar este template?')) return

    try {
      const { error } = await supabase.from('workout_templates').delete().eq('id', id)

      if (error) throw error

      await loadTemplates()
    } catch (error) {
      console.error('Erro ao deletar template:', error)
      alert('Erro ao deletar template')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Templates de Treino</h1>
        <div className="flex gap-3">
          <Link
            href="/templates/diets"
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Templates de Dieta
          </Link>
          <Link
            href="/templates/workouts/new"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            + Novo Template
          </Link>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-500 text-lg">Nenhum template de treino encontrado</p>
          <Link
            href="/templates/workouts/new"
            className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Criar Primeiro Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{template.nome_template}</h3>

              {template.descricao && (
                <p className="text-sm text-gray-600 mb-4">{template.descricao}</p>
              )}

              <div className="text-xs text-gray-500 mb-4">
                Criado em: {template.created_at ? new Date(template.created_at).toLocaleDateString('pt-BR') : 'N/A'}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/templates/workouts/${template.id}`}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-center text-sm"
                >
                  Editar
                </Link>

                <button
                  onClick={() => deleteTemplate(template.id)}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
