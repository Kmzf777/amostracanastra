-- Add status column to shipments to align with API usage
alter table public.shipments
  add column if not exists status text not null default 'pending';

create index if not exists shipments_status_idx on public.shipments(status);