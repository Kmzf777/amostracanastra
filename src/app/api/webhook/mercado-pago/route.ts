import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateUniqueCodeWithVerification } from '@/utils/codeGenerator';
import { mercadoPagoWebhookSchema } from '@/lib/schemas/webhook';
import MercadoPagoClient from '@/lib/mercadopago';
import crypto from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verifica assinatura do webhook Mercado Pago
function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string
): boolean {
  if (!xSignature || !xRequestId) return false;

  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('⚠️ MERCADO_PAGO_WEBHOOK_SECRET não configurado');
    return false;
  }

  try {
    const parts = xSignature.split(',');
    const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
    const hash = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!ts || !hash) return false;

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(manifest);
    const expectedHash = hmac.digest('hex');

    return hash === expectedHash;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const headers = request.headers;

    console.log('📡 Webhook Mercado Pago recebido:', JSON.stringify(body, null, 2));

    // Valida formato do webhook
    const validation = mercadoPagoWebhookSchema.safeParse(body);
    if (!validation.success) {
      console.error('❌ Formato de webhook inválido:', validation.error.errors);
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 });
    }

    const { type, data } = validation.data;

    // Só processa eventos de pagamento
    if (type !== 'payment') {
      console.log('ℹ️ Tipo de evento ignorado:', type);
      return NextResponse.json({ message: 'Evento ignorado' }, { status: 200 });
    }

    // Verifica assinatura (segurança)
    const xSignature = headers.get('x-signature');
    const xRequestId = headers.get('x-request-id');

    const isValid = verifyWebhookSignature(xSignature, xRequestId, data.id);
    if (!isValid && process.env.NODE_ENV === 'production') {
      console.error('❌ Assinatura inválida');
      return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 });
    }

    // Busca detalhes do pagamento via API MP
    const mpClient = MercadoPagoClient.getInstance();
    const payment = mpClient.createPayment();

    console.log('🔍 Buscando detalhes do pagamento:', data.id);
    const paymentData = await payment.get({ id: data.id });

    console.log('💳 Pagamento:', {
      id: paymentData.id,
      status: paymentData.status,
      external_reference: paymentData.external_reference
    });

    const externalRef = paymentData.external_reference;
    if (!externalRef) {
      console.error('❌ external_reference não encontrado');
      return NextResponse.json({ error: 'external_reference ausente' }, { status: 400 });
    }

    // Busca ordem no banco por external_reference
    const { data: venda, error: vendaError } = await supabase
      .from('vendas_amostra')
      .select('*')
      .eq('external_reference', externalRef)
      .single();

    if (vendaError || !venda) {
      console.error('❌ Venda não encontrada:', externalRef);
      return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });
    }

    // Atualiza status do pagamento
    const updateData: Record<string, any> = {
      mp_payment_id: paymentData.id,
      payment_status: paymentData.status,
      payment_method: paymentData.payment_type_id
    };

    // Se pagamento aprovado e ainda não tem código, gera código
    if (paymentData.status === 'approved' && !venda.codigo_gerado) {
      console.log('💳 Pagamento aprovado! Gerando código único...');

      const novoCodigo = await generateUniqueCodeWithVerification(supabase, 'vendas_amostra', 'codigo_gerado');
      console.log('🎉 Código gerado:', novoCodigo);

      updateData.codigo_gerado = novoCodigo;
      updateData.payment_link_status = true;
      updateData.order_status = 'Aguardando Impressão';

      // Cria registro em affiliates
      const { error: insertAffiliateError } = await supabase
        .from('affiliates')
        .insert({
          code: novoCodigo,
          status: 'inactive',
          venda_id: venda.id
        });

      if (insertAffiliateError) {
        console.error('❌ Erro ao criar afiliado:', insertAffiliateError);
      } else {
        console.log('✅ Afiliado criado com sucesso');
      }
    }

    // Atualiza venda
    const { error: updateError } = await supabase
      .from('vendas_amostra')
      .update(updateData)
      .eq('external_reference', externalRef);

    if (updateError) {
      console.error('❌ Erro ao atualizar venda:', updateError);
      return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
    }

    console.log('✅ Venda atualizada com sucesso');

    return NextResponse.json({
      message: 'Webhook processado com sucesso',
      status: paymentData.status,
      codigo_gerado: updateData.codigo_gerado || null
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return NextResponse.json({
      error: 'Erro ao processar webhook',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Webhook Mercado Pago disponível',
    version: 'direct-integration',
    timestamp: new Date().toISOString()
  }, { status: 200 });
}