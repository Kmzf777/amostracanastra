-- Adicionar coluna CPF à tabela vendas_amostra para controle de unicidade
ALTER TABLE public.vendas_amostra
    ADD COLUMN IF NOT EXISTS cpf TEXT;

-- Índice para consultas por CPF e status de pagamento
CREATE INDEX IF NOT EXISTS idx_vendas_amostra_cpf_status
    ON public.vendas_amostra(cpf, payment_link_status);