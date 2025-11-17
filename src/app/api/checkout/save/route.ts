import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const { customer, shipment, code } = await request.json()
    
    console.log('🔍 Checkout save request:', { customer, shipment, code })
    
    if (!customer || !shipment || !code) {
      console.log('❌ Missing data:', { customer: !!customer, shipment: !!shipment, code: !!code })
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseServer()
    
    // Verificar se o código existe
    const { data: existingOrders, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('code', code)
      .order('created_at', { ascending: false })
      .limit(1)

    if (orderError || !existingOrders || existingOrders.length === 0) {
      throw new Error('Código inválido');
    }

    const existingOrder = existingOrders[0]

    // Verificar se o pedido já foi processado
    if (existingOrder.status !== 'pending_payment') {
      return NextResponse.json(
        { error: 'Pedido já processado' },
        { status: 400 }
      )
    }

    // Iniciar uma transação de dados (Supabase não tem transações nativas, então faremos passo a passo)
    
    // 1. Criar ou atualizar cliente
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .upsert({
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        cpf: customer.cpf.replace(/\D/g, ''), // Remover formatação
        order_code: code,
        address_line1: shipment.address_line1,
        address_line2: shipment.address_line2 || null,
        number: shipment.number,
        district: shipment.district,
        city: shipment.city,
        state: shipment.state,
        postal_code: shipment.postal_code.replace(/\D/g, ''), // Remover formatação
      }, {
        onConflict: 'email'
      })
      .select()
      .single()

    if (customerError) {
      console.error('Erro ao salvar cliente:', customerError)
      return NextResponse.json(
        { error: 'Erro ao salvar dados do cliente' },
        { status: 500 }
      )
    }

    // 2. Criar shipment (entrega)
    const { data: shipmentData, error: shipmentError } = await supabase
      .from('shipments')
      .insert({
        order_id: existingOrder.id,
        receiver_name: customer.full_name, // Usar o nome do cliente como destinatário
        address_line1: shipment.address_line1,
        address_line2: shipment.address_line2 || null,
        number: shipment.number,
        district: shipment.district,
        city: shipment.city,
        state: shipment.state,
        postal_code: shipment.postal_code.replace(/\D/g, ''),
        status: 'pending'
      })
      .select()
      .single()

    if (shipmentError) {
      console.error('Erro ao salvar shipment:', shipmentError)
      return NextResponse.json(
        { error: 'Erro ao salvar dados de entrega' },
        { status: 500 }
      )
    }

    // 3. Atualizar status do pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'confirmed',
        customer_id: customerData.id
      })
      .eq('id', existingOrder.id)

    if (updateError) {
      console.error('Erro ao atualizar pedido:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar status do pedido' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      order_id: existingOrder.id,
      customer_id: customerData.id,
      shipment_id: shipmentData.id
    })

  } catch (error) {
    console.error('Erro ao processar checkout:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}