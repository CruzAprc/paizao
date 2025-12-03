import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workoutId = params.id
    const body = await request.json()

    const { error } = await supabaseAdmin
      .from('workout_plans')
      .update(body)
      .eq('id', workoutId)

    if (error) {
      console.error('Erro ao atualizar treino:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const workoutId = params.id

    const { data, error } = await supabaseAdmin
      .from('workout_plans')
      .select('*, app_users(nome, email)')
      .eq('id', workoutId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
