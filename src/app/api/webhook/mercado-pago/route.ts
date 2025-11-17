import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

// Função para validar a assinatura do Mercado Pago
function validateSignature(headers: Headers): boolean {
  const signature = headers.get('x-signature');
  const requestId = headers.get('x-request-id');
  
  if (!signature || !requestId) {
    console.log('⚠️ Assinatura ou request ID ausentes');
    return false;
  }
  
  console.log('🔐 Assinatura recebida:', signature);
  console.log('🆔 Request ID:', requestId);
  
  // TODO: Implementar validação HMAC completa com sua chave secreta
  // const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  // const expectedSignature = createHmac('sha256', secret)
  //   .update(`${requestId}.${JSON.stringify(body)}`)
  //   .digest('hex');
  // return signature === `v1=${expectedSignature}`;
  
  return true; // Aceitar temporariamente para testes
}

// Função para consultar o status do pagamento na API do Mercado Pago
async function getPaymentStatus(orderId: string) {
  try {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error('❌ MERCADO_PAGO_ACCESS_TOKEN não configurado');
      return null;
    }
    
    const response = await fetch(`https://api.mercadopago.com/merchant_orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('❌ Erro ao consultar API do Mercado Pago:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('📊 Dados do pedido Mercado Pago:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error('❌ Erro na consulta à API do Mercado Pago:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    const body = await request.json();
    const headers = request.headers;
    
    console.log('📡 Webhook Mercado Pago recebido:', JSON.stringify(body, null, 2));
    console.log('📋 Headers:', Object.fromEntries(headers.entries()));
    
    // Validar assinatura (para produção, implementar validação completa)
    if (!validateSignature(headers)) {
      console.log('⚠️ Assinatura inválida - continuando para testes');
      // return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    }
    
    // Extrair informações do webhook
    const { resource, topic } = body as { resource?: string; topic?: string };
    
    if (topic !== 'merchant_order') {
      console.log('📋 Tópico não é merchant_order:', topic);
      return NextResponse.json({ message: 'Tópico não processado' }, { status: 200 });
    }
    
    if (!resource) {
      console.log('❌ Resource não encontrado');
      return NextResponse.json({ error: 'Resource não encontrado' }, { status: 400 });
    }
    
    // Extrair ID do pedido da URL
    const orderId = resource.split('/').pop();
    console.log('🆔 Order ID extraído:', orderId);
    
    if (!orderId) {
      console.log('❌ ID do pedido não encontrado');
      return NextResponse.json({ error: 'ID do pedido não encontrado' }, { status: 400 });
    }
    
    // Consultar status do pagamento
    const orderData = await getPaymentStatus(orderId);
    
    if (!orderData) {
      return NextResponse.json({ error: 'Erro ao consultar status do pagamento' }, { status: 500 });
    }
    
    // Verificar se o pedido foi pago
    const isPaid = orderData.order_status === 'paid';
    console.log('💰 Status do pagamento:', orderData.order_status, 'Pago:', isPaid);
    
    // Extrair informações relevantes
    const preferenceId = orderData.preference_id;
    const paymentStatus = orderData.order_status;
    
    if (!preferenceId) {
      console.log('❌ Preference ID não encontrado');
      return NextResponse.json({ error: 'Preference ID não encontrado' }, { status: 400 });
    }
    
    // Atualizar status na tabela vendas_amostra
    console.log('🔄 Atualizando status para preference_id:', preferenceId);
    
    // Primeiro tentar atualizar um registro existente
    const { data: existingData, error: updateError } = await supabase
      .from('vendas_amostra')
      .update({ 
        payment_link_status: isPaid,
        order_status: paymentStatus,
        updated_at: new Date().toISOString()
      })
      .eq('payment_link_id', preferenceId)
      .select();
    
    if (updateError) {
      console.error('❌ Erro ao atualizar Supabase:', updateError);
      return NextResponse.json({ error: 'Erro ao atualizar banco de dados' }, { status: 500 });
    }
    
    // Se não encontrou registro para atualizar, criar um novo
    if (!existingData || existingData.length === 0) {
      console.log('⚠️ Nenhum registro encontrado com esse preference_id, criando novo...');
      
      const { data: newData, error: insertError } = await supabase
        .from('vendas_amostra')
        .insert({
          payment_link_id: preferenceId,
          payment_link_status: isPaid,
          order_status: paymentStatus,
          follow_up_counter: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.error('❌ Erro ao inserir novo registro:', insertError);
        return NextResponse.json({ error: 'Erro ao criar registro de venda' }, { status: 500 });
      }
      
      console.log('✅ Novo registro criado:', newData);
    } else {
      console.log('✅ Registro existente atualizado:', existingData);
    }
    
    // Se o pagamento foi confirmado, podemos enviar notificação ou email
    if (isPaid) {
      console.log('🎉 Pagamento confirmado! Enviando confirmação...');
      // Aqui você pode adicionar lógica para enviar email de confirmação
      // ou atualizar outras tabelas do sistema
    }
    
    return NextResponse.json({ 
      message: 'Webhook processado com sucesso',
      preferenceId,
      isPaid,
      orderStatus: paymentStatus
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Handler para GET (para testes e verificação)
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook Mercado Pago está funcionando',
    endpoints: ['POST /api/webhook/mercado-pago'],
    topics: ['merchant_order'],
    timestamp: new Date().toISOString()
  }, { status: 200 });
}