import { NextRequest, NextResponse } from 'next/server';

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
    
    return NextResponse.json({ message: 'Webhook recebido', preferenceId, isPaid }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Webhook disponível', endpoints: ['POST /api/webhook/mercado-pago'], timestamp: new Date().toISOString() }, { status: 200 });
}