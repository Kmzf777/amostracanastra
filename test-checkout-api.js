// Test script for checkout API
const testData = {
  code: '123456   ', // 9-character format (6 digits + 3 spaces)
  customer: {
    full_name: 'João da Silva Teste',
    email: 'joao.teste@example.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-09'
  },
  shipment: {
    receiver_name: 'João da Silva Teste',
    address_line1: 'Rua Teste',
    number: '123',
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    postal_code: '01234-567'
  }
};

async function testCheckoutAPI() {
  try {
    console.log('Testing checkout API with data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3002/api/checkout/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const result = await response.json();
    console.log(`\nStatus: ${response.status}`);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.init_point) {
      console.log('\n✅ SUCCESS: Mercado Pago preference created!');
      console.log(`🌐 Checkout URL: ${result.init_point}`);
      return result.init_point;
    } else {
      console.log('\n❌ FAILED: Error creating Mercado Pago preference');
      return null;
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    return null;
  }
}

testCheckoutAPI();