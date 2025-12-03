'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { type AppUser, type UserProfile } from '@/lib/supabase'

export default function AnamnesePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<AppUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      // Buscar dados do usuário via API route (server-side com service_role key)
      const response = await fetch(`/api/users/${userId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao carregar dados')
      }

      const data = await response.json()

      setUser(data.user)
      setUserProfile(data.profile)
    } catch (error) {
      alert('Erro ao carregar dados do usuário')
      router.push('/')
    } finally {
      setLoading(false)
    }
  }, [userId, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-xl text-gray-600">Usuário não encontrado</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Anamnese</h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          ← Voltar
        </button>
      </div>

      {/* Informações do Usuário */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Informações do Cliente</h2>
        <div className="space-y-2 text-gray-600">
          <p>
            <strong>Nome:</strong> {user.nome}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      </div>

      {/* Dados do Perfil do Usuário */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Perfil e Anamnese</h2>

        {!userProfile ? (
          <p className="text-gray-500">Nenhum perfil cadastrado para este cliente.</p>
        ) : (
          <div className="space-y-6">
            {/* Informações Básicas */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Informações Básicas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userProfile.nome_completo && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <strong className="text-sm text-gray-500 uppercase block mb-1">Nome Completo</strong>
                    <p className="text-gray-800">{userProfile.nome_completo}</p>
                  </div>
                )}
                {userProfile.data_nascimento && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <strong className="text-sm text-gray-500 uppercase block mb-1">Data de Nascimento</strong>
                    <p className="text-gray-800">{new Date(userProfile.data_nascimento).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {userProfile.altura && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <strong className="text-sm text-gray-500 uppercase block mb-1">Altura</strong>
                    <p className="text-gray-800">{userProfile.altura} cm</p>
                  </div>
                )}
                {userProfile.peso && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <strong className="text-sm text-gray-500 uppercase block mb-1">Peso</strong>
                    <p className="text-gray-800">{userProfile.peso} kg</p>
                  </div>
                )}
                {userProfile.objetivo && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <strong className="text-sm text-gray-500 uppercase block mb-1">Objetivo</strong>
                    <p className="text-gray-800">{userProfile.objetivo}</p>
                  </div>
                )}
                {userProfile.nivel_atividade && (
                  <div className="bg-gray-50 p-3 rounded-md">
                    <strong className="text-sm text-gray-500 uppercase block mb-1">Nível de Atividade</strong>
                    <p className="text-gray-800">{userProfile.nivel_atividade}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informações de Saúde */}
            {(userProfile.restricoes_alimentares || userProfile.preferencias_alimentares ||
              userProfile.historico_medico || userProfile.medicamentos) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Informações de Saúde</h3>
                <div className="space-y-3">
                  {userProfile.restricoes_alimentares && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <strong className="text-sm text-gray-500 uppercase block mb-1">Restrições Alimentares</strong>
                      <p className="text-gray-800">{userProfile.restricoes_alimentares}</p>
                    </div>
                  )}
                  {userProfile.preferencias_alimentares && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <strong className="text-sm text-gray-500 uppercase block mb-1">Preferências Alimentares</strong>
                      <p className="text-gray-800">{userProfile.preferencias_alimentares}</p>
                    </div>
                  )}
                  {userProfile.historico_medico && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <strong className="text-sm text-gray-500 uppercase block mb-1">Histórico Médico</strong>
                      <p className="text-gray-800">{userProfile.historico_medico}</p>
                    </div>
                  )}
                  {userProfile.medicamentos && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <strong className="text-sm text-gray-500 uppercase block mb-1">Medicamentos</strong>
                      <p className="text-gray-800">{userProfile.medicamentos}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Outros Campos */}
            {Object.keys(userProfile).filter(key =>
              !['id', 'user_id', 'nome_completo', 'data_nascimento', 'altura', 'peso',
                'objetivo', 'nivel_atividade', 'restricoes_alimentares',
                'preferencias_alimentares', 'historico_medico', 'medicamentos',
                'created_at', 'updated_at'].includes(key)
            ).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Outras Informações</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(userProfile)
                    .filter(([key]) =>
                      !['id', 'user_id', 'nome_completo', 'data_nascimento', 'altura', 'peso',
                        'objetivo', 'nivel_atividade', 'restricoes_alimentares',
                        'preferencias_alimentares', 'historico_medico', 'medicamentos',
                        'created_at', 'updated_at'].includes(key)
                    )
                    .map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded-md">
                        <strong className="text-sm text-gray-500 uppercase block mb-1">
                          {key.replace(/_/g, ' ')}
                        </strong>
                        <p className="text-gray-800">
                          {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                        </p>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Data de Criação/Atualização */}
            <div className="flex gap-4 text-xs text-gray-500 border-t pt-3">
              {userProfile.created_at && (
                <p>Criado em: {new Date(userProfile.created_at).toLocaleString('pt-BR')}</p>
              )}
              {userProfile.updated_at && (
                <p>Atualizado em: {new Date(userProfile.updated_at).toLocaleString('pt-BR')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> A funcionalidade de criar/editar anamnese será implementada em uma próxima versão.
          Por enquanto, você pode visualizar os dados existentes.
        </p>
      </div>
    </div>
  )
}
