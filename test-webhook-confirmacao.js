// Teste do webhook de confirmação de pagamento
const testWebhookConfirmacao = async () => {
  const testData = {
    payment_link_id: "test_123456",
    customer: {
      full_name: "Teste Usuário",
      email: "teste@example.com",
      phone: "11999999999"
    },
    code: "TESTE123"
  };

  console.log('🧪 Testando webhook de confirmação...');
  console.log('📤 Dados enviados:', testData);

  try {
    const response = await fetch('https://webhook.canastrainteligencia.com/webhook/confirmar-status-pagamento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📥 Status da resposta:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Resposta recebida:', result);
    
    if (result.payment_link_status === true) {
      console.log('✅ Pagamento confirmado!');
    } else {
      console.log('❌ Pagamento não confirmado');
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
};

// Executar o teste
testWebhookConfirmacao();