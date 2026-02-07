-- Migration: Adicionar campos Mercado Pago à tabela vendas_amostra
-- Data: 2026-02-04
-- Descrição: Adiciona campos necessários para integração direta com Mercado Pago

-- Adicionar campos Mercado Pago à tabela existente
ALTER TABLE public.vendas_amostra
  ADD COLUMN IF NOT EXISTS mp_preference_id TEXT,
  ADD COLUMN IF NOT EXISTS external_reference TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS init_point TEXT,
  ADD COLUMN IF NOT EXISTS affiliate_code CHAR(9),
  ADD COLUMN IF NOT EXISTS customer_email TEXT,
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS transaction_amount NUMERIC(12,2) DEFAULT 24.90,
  ADD COLUMN IF NOT EXISTS mp_payment_id BIGINT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS integration_type TEXT DEFAULT 'n8n';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_vendas_amostra_external_ref
  ON public.vendas_amostra(external_reference);
CREATE INDEX IF NOT EXISTS idx_vendas_amostra_mp_preference
  ON public.vendas_amostra(mp_preference_id);
CREATE INDEX IF NOT EXISTS idx_vendas_amostra_payment_status
  ON public.vendas_amostra(payment_status);

-- Comentários para documentação
COMMENT ON COLUMN public.vendas_amostra.integration_type IS
  'Tipo de integração: n8n (legado) ou direct (nova integração)';
COMMENT ON COLUMN public.vendas_amostra.external_reference IS
  'UUID único para rastreamento no Mercado Pago (formato: AMO-{timestamp}-{random})';
COMMENT ON COLUMN public.vendas_amostra.mp_preference_id IS
  'ID da preferência criada no Mercado Pago para integração direta';
COMMENT ON COLUMN public.vendas_amostra.mp_payment_id IS
  'ID do pagamento recebido via webhook do Mercado Pago';
COMMENT ON COLUMN public.vendas_amostra.payment_status IS
  'Status detalhado do pagamento: pending, approved, rejected, cancelled';
