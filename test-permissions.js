// Test database permissions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dlkfpjismifzzzyphqtn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsa2ZwamlzbWlmenp6eXBocXRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDc2OTYsImV4cCI6MjA2NjYyMzY5Nn0.ECS5GfKTmxY4fnOUHMk5snVEE8a8amNkS3LMyMrqJCY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPermissions() {
  console.log('Testing database permissions...\n');
  
  try {
    // Test affiliates table
    console.log('1. Testing affiliates table...');
    const { data: affiliates, error: affError } = await supabase
      .from('affiliates')
      .select('id, code, status')
      .limit(1);
    
    if (affError) {
      console.log('❌ Affiliates error:', affError.message);
    } else {
      console.log('✅ Affiliates access:', affiliates?.length || 0, 'records');
      if (affiliates?.[0]) {
        console.log('   Sample code:', affiliates[0].code);
      }
    }
    
    // Test customers table
    console.log('\n2. Testing customers table...');
    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('id, email')
      .limit(1);
    
    if (custError) {
      console.log('❌ Customers error:', custError.message);
    } else {
      console.log('✅ Customers access:', customers?.length || 0, 'records');
    }
    
    // Test orders table
    console.log('\n3. Testing orders table...');
    const { data: orders, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .limit(1);
    
    if (orderError) {
      console.log('❌ Orders error:', orderError.message);
    } else {
      console.log('✅ Orders access:', orders?.length || 0, 'records');
    }
    
    // Test shipments table
    console.log('\n4. Testing shipments table...');
    const { data: shipments, error: shipError } = await supabase
      .from('shipments')
      .select('id, status')
      .limit(1);
    
    if (shipError) {
      console.log('❌ Shipments error:', shipError.message);
    } else {
      console.log('✅ Shipments access:', shipments?.length || 0, 'records');
    }
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

testPermissions();