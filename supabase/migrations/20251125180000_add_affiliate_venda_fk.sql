-- Adicionar coluna venda_id na tabela affiliates para relacionar com vendas_amostra
ALTER TABLE public.affiliates
ADD COLUMN venda_id BIGINT;

-- Adicionar foreign key constraint
ALTER TABLE public.affiliates
ADD CONSTRAINT affiliates_venda_id_fkey 
FOREIGN KEY (venda_id) 
REFERENCES public.vendas_amostra(id)
ON DELETE CASCADE;

-- Adicionar índice para melhorar performance
CREATE INDEX idx_affiliates_venda_id ON public.affiliates(venda_id);