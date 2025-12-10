import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    // We can't run DDL via JS client without a specific function exposed.
    // However, if the project is local or has a specific setup, maybe we can.
    // But usually, we need to instruct the user to run the migration in Supabase Dashboard.
    
    // Let's try to verify if table exists by selecting from it
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { error } = await supabase
      .from('withdrawals')
      .select('count', { count: 'exact', head: true })

    if (error) {
      if (error.code === '42P01') { // undefined_table
        return NextResponse.json({ 
          error: 'Table withdrawals does not exist. Please run the migration in Supabase SQL Editor.',
          sql: `
            create table if not exists public.withdrawals (
              id uuid primary key default gen_random_uuid(),
              affiliate_id uuid not null references public.affiliates(id),
              amount numeric(12,2) not null,
              status text not null default 'pending',
              pix_key text not null,
              pix_key_type text,
              created_at timestamptz not null default now()
            );

            alter table public.withdrawals enable row level security;

            create policy "Allow admin to manage withdrawals" on public.withdrawals
              for all using (true);

            grant all on public.withdrawals to authenticated;
            grant all on public.withdrawals to anon;
          `
        }, { status: 404 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Table withdrawals exists.'
    })

  } catch (error) {
    console.error('Error checking setup:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
