export function generateUniqueCode(): string {
  const digits = '0123456789';
  const codeLength = 6;
  let code = '';

  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    code += digits[randomIndex];
  }

  return code;
}

import type { SupabaseClient } from '@supabase/supabase-js'

export async function generateUniqueCodeWithVerification(
  supabase: SupabaseClient,
  tableName: string,
  codeColumn: string = 'codigo_gerado',
  maxAttempts: number = 10
): Promise<string> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const code = generateUniqueCode();
    
    const { data, error } = await supabase
      .from(tableName)
      .select(codeColumn)
      .eq(codeColumn, code)
      .single();

    if (error && error.code === 'PGRST116') {
      // continue to check affiliates table
    }
    
    const usedInVendas = !!data;

    const { data: affData, error: affError } = await supabase
      .from('affiliates')
      .select('code')
      .eq('code', code)
      .single();

    const usedInAffiliates = affError && affError.code === 'PGRST116' ? false : !!affData;

    if (!usedInVendas && !usedInAffiliates) return code;
    
    attempts++;
  }
  
  throw new Error('Não foi possível gerar um código único após várias tentativas');
}