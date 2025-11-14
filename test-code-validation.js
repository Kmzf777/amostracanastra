// Test script for code validation
const testCodes = ['123456', '123456   ', '000000', '999999'];

async function testCodeValidation(code) {
  try {
    const response = await fetch('http://localhost:3002/api/codes/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    const result = await response.json();
    console.log(`Code: "${code}" - Status: ${response.status}, Result:`, result);
    return response.ok;
  } catch (error) {
    console.error(`Error testing code "${code}":`, error.message);
    return false;
  }
}

async function runTests() {
  console.log('Testing code validation...\n');
  
  for (const code of testCodes) {
    await testCodeValidation(code);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  console.log('\nAll tests completed!');
}

runTests();