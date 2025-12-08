import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateUniqueCodeWithVerification } from '@/utils/codeGenerator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
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
    } else {
      console.log('❌ Formato de webhook não reconhecido');
      return NextResponse.json({ error: 'Formato de webhook não reconhecido' }, { status: 400 });
    }
    
    if (isPaid && preferenceId) {
      console.log('💳 Pagamento confirmado, gerando código único...');
      
      try {
        const { data: venda, error: vendaError } = await supabase
          .from('vendas_amostra')
          .select('*')
          .eq('payment_link_id', preferenceId)
          .single();
        
        if (vendaError || !venda) {
          console.error('❌ Venda não encontrada para o payment_link_id:', preferenceId);
          return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });
        }
        
        if (venda.codigo_gerado) {
          console.log('✅ Código já gerado anteriormente:', venda.codigo_gerado);
          return NextResponse.json({ 
            message: 'Código já existente', 
            preferenceId, 
            isPaid, 
            codigo_gerado: venda.codigo_gerado 
          }, { status: 200 });
        }
        
        const novoCodigo = await generateUniqueCodeWithVerification(supabase, 'vendas_amostra', 'codigo_gerado');
        console.log('🎉 Código único gerado:', novoCodigo);
        
        const { error: updateVendaError } = await supabase
          .from('vendas_amostra')
          .update({ 
            codigo_gerado: novoCodigo,
            payment_link_status: true,
            order_status: 'Aguardando Impressão'
          })
          .eq('payment_link_id', preferenceId);
        
        if (updateVendaError) {
          console.error('❌ Erro ao atualizar venda:', updateVendaError);
          return NextResponse.json({ error: 'Erro ao atualizar venda' }, { status: 500 });
        }
        
        const { error: insertAffiliateError } = await supabase
          .from('affiliates')
          .insert({
            code: novoCodigo,
            status: 'inactive',
            venda_id: venda.id
          });
        
        if (insertAffiliateError) {
          console.error('❌ Erro ao criar registro em affiliates:', insertAffiliateError);
          return NextResponse.json({ error: 'Erro ao criar registro de afiliado' }, { status: 500 });
        }
        
        console.log('✅ Código salvo nas duas tabelas com sucesso!');
        
        return NextResponse.json({ 
          message: 'Pagamento confirmado e código gerado com sucesso', 
          preferenceId, 
          isPaid, 
          codigo_gerado: novoCodigo 
        }, { status: 200 });
        
      } catch (error) {
        console.error('❌ Erro ao processar pagamento confirmado:', error);
        return NextResponse.json({ error: 'Erro ao processar pagamento confirmado' }, { status: 500 });
      }
    }
    
    return NextResponse.json({ message: 'Webhook recebido', preferenceId, isPaid }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook disponível', endpoints: ['POST /api/webhook/mercado-pago'], timestamp: new Date().toISOString() }, { status: 200 });
}