import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    // Buscar usuário
    const { data: userData, error: userError } = await supabaseAdmin
      .from('app_users')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    if (!userData) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Buscar perfil do usuário
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil:', profileError)
    }

    return NextResponse.json({
      user: userData,
      profile: profileData
    })
  } catch (error) {
    console.error('Erro geral:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
