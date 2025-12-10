-- Create withdrawals table
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id),
  amount numeric(12,2) not null,
  status text not null default 'pending', -- 'pending' (Aguardando pagamento), 'paid' (Pago)
  pix_key text not null,
  pix_key_type text, -- 'cpf', 'email', 'phone', 'random', 'cnpj'
  created_at timestamptz not null default now()
);

-- Add permissions
alter table public.withdrawals enable row level security;

-- Policies (Simplified for admin access)
create policy "Allow admin to manage withdrawals" on public.withdrawals
  for all
  using (true);

-- Grant permissions
grant all on public.withdrawals to authenticated;
grant all on public.withdrawals to anon;
