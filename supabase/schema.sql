create extension if not exists pgcrypto;

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  code char(9) not null unique,
  status text not null default 'active'
);

create table if not exists public.customers (
  id bigserial primary key,
  full_name text not null,
  email text not null unique,
  phone text,
  cpf char(11) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id bigserial primary key,
  affiliate_id uuid not null references public.affiliates(id),
  code char(9) not null,
  customer_id bigint references public.customers(id),
  status text not null default 'pending_payment',
  currency text not null default 'BRL',
  subtotal numeric(12,2) not null default 0,
  shipping_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists orders_affiliate_id_idx on public.orders (affiliate_id);
create index if not exists orders_customer_id_idx on public.orders (customer_id);

create table if not exists public.shipments (
  id bigserial primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  receiver_name text not null,
  address_line1 text not null,
  address_line2 text,
  number text not null,
  district text not null,
  city text not null,
  state text not null,
  postal_code text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists shipments_order_id_idx on public.shipments (order_id);

create or replace function public.generate_unique_affiliate_code()
returns char(9)
language plpgsql
as $$
declare
  c char(9);
  exists_code boolean;
begin
  loop
    c := lpad(floor(random() * 1000000000)::text, 9, '0')::char(9);
    select exists(select 1 from public.affiliates where code = c) into exists_code;
    if not exists_code then
      return c;
    end if;
  end loop;
end;
$$;

alter table public.affiliates alter column code set default public.generate_unique_affiliate_code();