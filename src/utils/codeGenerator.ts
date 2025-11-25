export function generateUniqueCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 8;
  let code = '';
  
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
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
      return code;
    }
    
    if (!data) {
      return code;
    }
    
    attempts++;
  }
  
  throw new Error('Não foi possível gerar um código único após várias tentativas');
}