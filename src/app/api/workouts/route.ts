import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const email = searchParams.get('email') || ''
    const offset = (page - 1) * limit

    // Se houver filtro por email, primeiro buscar os user_ids correspondentes
    let filteredUserIds: string[] | null = null
    if (email) {
      const { data: matchingUsers } = await supabaseAdmin
        .from('app_users')
        .select('user_id')
        .ilike('email', `%${email}%`)

      filteredUserIds = matchingUsers?.map(u => u.user_id) || []

      // Se não encontrou nenhum usuário com esse email, retornar vazio
      if (filteredUserIds.length === 0) {
        return NextResponse.json({
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0
          }
        })
      }
    }

    // Contar total de treinos (com filtro se houver)
    let countQuery = supabaseAdmin
      .from('workout_plans')
      .select('*', { count: 'exact', head: true })

    if (filteredUserIds) {
      countQuery = countQuery.in('user_id', filteredUserIds)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Erro ao contar treinos:', countError)
      return NextResponse.json({ error: countError.message }, { status: 400 })
    }

    // Buscar treinos com paginação (e filtro se houver)
    let workoutsQuery = supabaseAdmin
      .from('workout_plans')
      .select('*')
      .order('created_at', { ascending: false })

    if (filteredUserIds) {
      workoutsQuery = workoutsQuery.in('user_id', filteredUserIds)
    }

    const { data: workouts, error } = await workoutsQuery.range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar treinos:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Pegar todos os user_ids únicos
    const userIds = Array.from(new Set(workouts?.map(w => w.user_id).filter(Boolean)))

    if (userIds.length > 0) {
      // Buscar dados dos usuários
      const { data: users } = await supabaseAdmin
        .from('app_users')
        .select('user_id, nome, email')
        .in('user_id', userIds)

      // Criar um map de users por user_id para acesso rápido
      const usersMap = new Map(users?.map(u => [u.user_id, u]) || [])

      // Adicionar dados do usuário em cada treino
      const workoutsWithUsers = workouts?.map(workout => ({
        ...workout,
        app_users: workout.user_id ? usersMap.get(workout.user_id) : null
      }))

      return NextResponse.json({
        data: workoutsWithUsers,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    }

    return NextResponse.json({
      data: workouts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('workout_plans')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar treino:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
