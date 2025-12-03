import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    // 1. Buscar usuário por email (busca exata ou parcial)
    const { data: users, error: userError } = await supabaseAdmin
      .from('app_users')
      .select('*')
      .ilike('email', `%${email}%`)
      .limit(1)

    if (userError) {
      console.error('Erro ao buscar usuário:', userError)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        found: false,
        message: 'Nenhum cliente encontrado com esse email'
      })
    }

    const user = users[0]
    const userId = user.user_id

    // 2. Buscar perfil/anamnese do usuário
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    // 3. Buscar todas as dietas do usuário
    const { data: diets } = await supabaseAdmin
      .from('diet_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // 4. Buscar todos os treinos do usuário
    const { data: workouts } = await supabaseAdmin
      .from('workout_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // 5. Buscar todos os vídeos disponíveis (tabela videos)
    const { data: videos } = await supabaseAdmin
      .from('videos')
      .select('*')
      .order('nome', { ascending: true })

    // 6. Buscar todos os exercícios disponíveis (tabela exercicios)
    const { data: exercicios } = await supabaseAdmin
      .from('exercicios')
      .select('*')
      .order('nome', { ascending: true })

    return NextResponse.json({
      found: true,
      user,
      profile,
      diets: diets || [],
      workouts: workouts || [],
      videos: videos || [],
      exercicios: exercicios || []
    })

  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
