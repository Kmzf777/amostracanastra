// Script de teste para webhook do Mercado Pago
const testWebhook = async () => {
  const testData = {
    "resource": "https://api.mercadolibre.com/merchant_orders/34788262976",
    "topic": "merchant_order",
    "query": {
      "id": "34788262976",
      "topic": "merchant_order"
    }
  };

  try {
    const response = await fetch('http://localhost:3000/api/webhook/mercado-pago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'test-signature',
        'x-request-id': 'test-request-id'
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    console.log('Resposta do webhook:', result);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Erro ao testar webhook:', error);
  }
};

testWebhook();