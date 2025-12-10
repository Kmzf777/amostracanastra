
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://dlkfpjismifzzzyphqtn.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsa2ZwamlzbWlmenp6eXBocXRuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA0NzY5NiwiZXhwIjoyMDY2NjIzNjk2fQ.YtOamWgCRfct7FUq0DkqtV758G1bsIi1YmkabJjO2gA';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function simulateActivation(code, cpfInput) {
  console.log(`\n🔍 Simulating activation for Code: ${code}, CPF: ${cpfInput}`);

  // 1. Fetch affiliate by code
  const { data: affiliate, error: affError } = await supabase
    .from('affiliates')
    .select('*')
    .eq('code', code)
    .single();

  if (affError || !affiliate) {
    console.log('❌ Code not found in affiliates table');
    if (affError) console.error(affError);
    return;
  }

  console.log('✅ Affiliate found:', affiliate);

  if (!affiliate.venda_id) {
    console.log('❌ Affiliate has no linked venda_id');
    return;
  }

  // 2. Fetch linked sale
  const { data: venda, error: vendaError } = await supabase
    .from('vendas_amostra')
    .select('*')
    .eq('id', affiliate.venda_id)
    .single();

  if (vendaError || !venda) {
    console.log('❌ Linked sale not found');
    if (vendaError) console.error(vendaError);
    return;
  }

  console.log('✅ Linked sale found:', {
    id: venda.id,
    cpf: venda.cpf,
    payment_link_status: venda.payment_link_status
  });

  // 3. Compare CPF
  const dbCpf = venda.cpf;
  const dbCpfClean = dbCpf.replace(/\D/g, '');
  const inputCpfClean = cpfInput.replace(/\D/g, '');

  console.log(`\n📋 CPF Comparison:`);
  console.log(`   DB CPF (Raw): '${dbCpf}'`);
  console.log(`   DB CPF (Clean): '${dbCpfClean}'`);
  console.log(`   Input CPF (Raw): '${cpfInput}'`);
  console.log(`   Input CPF (Clean): '${inputCpfClean}'`);

  if (dbCpf === cpfInput) {
    console.log('✅ Exact string match!');
  } else {
    console.log('❌ Exact string match FAILED');
  }

  if (dbCpfClean === inputCpfClean) {
    console.log('✅ Clean digits match!');
  } else {
    console.log('❌ Clean digits match FAILED');
  }

}

simulateActivation('399799', '111.710.776-02');
