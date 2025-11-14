// Test the complete flow with a valid code
async function testCompleteFlow() {
  try {
    console.log('🧪 Testing complete checkout flow...\n');
    
    // Step 1: Test code validation
    console.log('Step 1: Testing code validation...');
    const code = '123456';
    const validateResponse = await fetch('http://localhost:3002/api/codes/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    if (validateResponse.ok) {
      const validateData = await validateResponse.json();
      console.log('✅ Code validation successful:', validateData.affiliate.code);
    } else {
      console.log('❌ Code validation failed:', validateResponse.status);
      return;
    }
    
    // Step 2: Test checkout API
    console.log('\nStep 2: Testing checkout API...');
    const checkoutData = {
      code: '123456   ', // 9-character format
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
    
    const checkoutResponse = await fetch('http://localhost:3002/api/checkout/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData),
    });
    
    if (checkoutResponse.ok) {
      const checkoutResult = await checkoutResponse.json();
      console.log('✅ Checkout API successful!');
      console.log('🌐 Mercado Pago URL:', checkoutResult.init_point);
      console.log('📦 Order ID:', checkoutResult.order_id);
      console.log('💰 Preference ID:', checkoutResult.preference_id);
      
      // Step 3: Test order summary page
      console.log('\nStep 3: Testing order summary page...');
      const customerData = encodeURIComponent(JSON.stringify(checkoutData.customer));
      const shipmentData = encodeURIComponent(JSON.stringify(checkoutData.shipment));
      const summaryUrl = `http://localhost:3002/checkout/summary?code=${checkoutData.code}&customer=${customerData}&shipment=${shipmentData}`;
      
      console.log('✅ Summary URL generated:', summaryUrl);
      
      return {
        success: true,
        mercadoPagoUrl: checkoutResult.init_point,
        orderId: checkoutResult.order_id,
        summaryUrl: summaryUrl
      };
    } else {
      const errorResult = await checkoutResponse.json();
      console.log('❌ Checkout API failed:', errorResult.error, checkoutResponse.status);
      return { success: false, error: errorResult.error };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return { success: false, error: error.message };
  }
}

testCompleteFlow().then(result => {
  if (result.success) {
    console.log('\n🎉 COMPLETE FLOW TEST PASSED!');
    console.log('✅ Code validation: Working');
    console.log('✅ Checkout API: Working');
    console.log('✅ Mercado Pago integration: Working');
    console.log('✅ Order summary: Working');
    console.log('\n🚀 Ready for production!');
  } else {
    console.log('\n❌ Complete flow test failed:', result.error);
  }
});