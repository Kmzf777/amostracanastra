import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function POST(_request: NextRequest) {
  try {
    getSupabaseServer()
    
    // Criar dados iniciais se necessário
    // Por enquanto, apenas retornar sucesso
    
    return NextResponse.json({ 
      success: true,
      message: 'Setup completed'
    })

  } catch (error) {
    console.error('Erro no setup:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
