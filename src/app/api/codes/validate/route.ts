import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()
    const normalized = String(code || '').replace(/\D/g, '').slice(0, 6)
    console.log('🔍 Validating code:', JSON.stringify(normalized))
    
    if (!/^\d{6}$/.test(normalized)) {
      console.log('❌ Invalid code format:', normalized)
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServer()
    console.log('🔧 Supabase host:', (process.env.SUPABASE_URL || '').replace(/^https?:\/\//,'').split('.')[0])
    
    // Verificar se o código existe na tabela de pedidos
    console.log('🔍 Searching affiliate code:', normalized)
    let { data: affiliates, error } = await supabase
      .from('affiliates')
      .select('id, code, status')
      .eq('code', normalized)
      .limit(1)

    if ((!affiliates || affiliates.length === 0) && !error) {
      const fallback = await supabase
        .from('affiliates')
        .select('id, code, status')
        .like('code', `${normalized}%`)
        .limit(1)
      affiliates = fallback.data || []
      error = fallback.error || null
    }

    console.log('🔍 Query result:', { affiliates, error })

    if (error || !affiliates || affiliates.length === 0) {
      console.log('❌ Affiliate code not found or error:', error)
      console.log('🔍 Tried code:', normalized)
      return NextResponse.json(
        { error: 'Código não encontrado' },
        { status: 404 }
      )
    }

    const affiliate = affiliates[0]

    if (affiliate.status === 'inactive' || affiliate.status === 'expired') {
      return NextResponse.json(
        { error: 'Código inativo ou expirado' },
        { status: 400 }
      )
    }

    return NextResponse.json({ 
      valid: true,
      affiliate: {
        id: affiliate.id,
        code: affiliate.code,
        status: affiliate.status
      }
    })

  } catch (error) {
    console.error('Erro ao validar código:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}