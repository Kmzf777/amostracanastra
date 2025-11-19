import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const paymentLinkId = searchParams.get('payment_link_id')
    const code = searchParams.get('code')
    
    if (!paymentLinkId && !code) {
      return NextResponse.json(
        { error: 'payment_link_id ou code é obrigatório' },
        { status: 400 }
      )
    }
    
    const supabase = getSupabaseServer()
    
    // Buscar status do pagamento
    let query = supabase
      .from('vendas_amostra')
      .select('payment_link_status, order_status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
    
    if (paymentLinkId) {
      query = query.eq('payment_link_id', paymentLinkId)
    } else if (code) {
      // Se não temos payment_link_id, buscar pelo código do pedido
      // Isso requer que salvemos o código junto com o payment_link_id
      const { data: orderData } = await supabase
        .from('orders')
        .select('id')
        .eq('code', code)
        .single()
      
      if (orderData) {
        // Buscar vendas_amostra relacionadas ao pedido
        // Por enquanto, vamos retornar not found se não houver payment_link_id
        return NextResponse.json(
          { error: 'Pedido sem link de pagamento' },
          { status: 404 }
        )
      }
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Erro ao buscar status:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar status do pedido' },
        { status: 500 }
      )
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }
    
    const order = data[0]
    
    return NextResponse.json({
      payment_link_status: order.payment_link_status,
      order_status: order.order_status,
      updated_at: order.updated_at,
      is_paid: order.payment_link_status === true
    })
    
  } catch (error) {
    console.error('Erro ao verificar status:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}