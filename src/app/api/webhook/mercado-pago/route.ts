import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabaseServer';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer()
    const body = await request.json();
    const headers = request.headers;
    
    console.log('📡 Webhook recebido:', JSON.stringify(body, null, 2));
    console.log('📋 Headers:', Object.fromEntries(headers.entries()));
    
    const { payment_link_id, payment_link_status } = body as { 
      payment_link_id?: string; 
      payment_link_status?: boolean | string; 
    };
    
    let preferenceId: string;
    let isPaid: boolean;
    
    if (payment_link_id && payment_link_status !== undefined) {
      console.log('🔍 Detectado webhook do n8n');
      preferenceId = payment_link_id;
      isPaid = payment_link_status === true || payment_link_status === 'true';
      console.log('💰 Status do pagamento (n8n):', isPaid ? 'paid' : 'pending', 'Pago:', isPaid);
      console.log('📝 Payment Link ID:', preferenceId);
    }
    else {
      console.log('❌ Formato de webhook não reconhecido');
      return NextResponse.json({ error: 'Formato de webhook não reconhecido' }, { status: 400 });
    }
    
    console.log('🔄 Atualizando status para preference_id:', preferenceId);
    
    const { data: existingData, error: findError } = await supabase
      .from('vendas_amostra')
      .select('id')
      .eq('payment_link_id', preferenceId)
      .single();
    
    if (findError && findError.code !== 'PGRST116') {
      console.error('❌ Erro ao buscar registro:', findError);
      return NextResponse.json({ error: 'Erro ao buscar registro' }, { status: 500 });
    }
    
    let result;
    if (existingData) {
      const { data: updateData, error: updateError } = await supabase
        .from('vendas_amostra')
        .update({
          payment_link_status: isPaid
        })
        .eq('payment_link_id', preferenceId)
        .select();
      
      if (updateError) {
        console.error('❌ Erro ao atualizar:', updateError);
        return NextResponse.json({ error: 'Erro ao atualizar banco de dados' }, { status: 500 });
      }
      result = updateData;
    } else {
      const { data: insertData, error: insertError } = await supabase
        .from('vendas_amostra')
        .insert({
          payment_link_id: preferenceId,
          payment_link_status: isPaid,
          payment_link_url: '',
          nome_completo: 'Webhook Payment',
          cpf: '',
          number: '',
          endereco: '',
          endereco_numero: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: '',
          complemento: '',
          email: '',
          codigo_usado: '',
          codigo_gerado: ''
        })
        .select();
      
      if (insertError) {
        console.error('❌ Erro ao inserir:', insertError);
        return NextResponse.json({ error: 'Erro ao inserir no banco de dados' }, { status: 500 });
      }
      result = insertData;
    }

    console.log('✅ Status persistido:', result);
    console.log('📊 Dados atualizados:', JSON.stringify(result, null, 2));
    
    if (isPaid) {
      console.log('🎉 Pagamento confirmado! Enviando confirmação...');
      console.log('🔄 O Realtime deve notificar a página de resumo agora...');
    }
    
    return NextResponse.json({ message: 'Webhook processado com sucesso', preferenceId, isPaid, result }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook disponível', endpoints: ['POST /api/webhook/mercado-pago'], timestamp: new Date().toISOString() }, { status: 200 });
}