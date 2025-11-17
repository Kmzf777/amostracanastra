// Test complete checkout flow
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testCompleteCheckoutFlow() {
  console.log('🧪 Testing complete checkout flow...\n')
  
  try {
    const testCode = '123456'
    
    // 1. Test code validation
    console.log('1️⃣ Testing code validation...')
    const validateResponse = await fetch('http://localhost:3001/api/codes/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: testCode })
    })
    
    const validationResult = await validateResponse.json()
    console.log('Validation response:', validateResponse.status, validationResult)
    
    if (!validateResponse.ok) {
      console.error('❌ Code validation failed')
      return
    }
    
    console.log('✅ Code validation successful')
    
    // 2. Test checkout save API
    console.log('\n2️⃣ Testing checkout save API...')
    const checkoutData = {
      code: testCode,
      customer: {
        full_name: 'João da Silva Teste',
        email: 'joao.teste@example.com',
        phone: '11999999999',
        cpf: '12345678901'
      },
      shipment: {
        address_line1: 'Rua Teste, 123',
        address_line2: 'Apto 45',
        number: '123',
        district: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        postal_code: '01001000'
      }
    }
    
    const checkoutResponse = await fetch('http://localhost:3001/api/checkout/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData)
    })
    
    const checkoutResult = await checkoutResponse.json()
    console.log('Checkout response:', checkoutResponse.status, checkoutResult)
    
    if (!checkoutResponse.ok) {
      console.error('❌ Checkout save failed')
      return
    }
    
    console.log('✅ Checkout save successful')
    
    console.log('\n🎉 Complete checkout flow test successful!')
    
  } catch (error) {
    console.error('❌ Test error:', error.message)
  }
}

testCompleteCheckoutFlow()