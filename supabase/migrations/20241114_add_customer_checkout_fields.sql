-- Migration para atualizar tabela customers com todos os dados do checkout
-- Inclui código do pedido gerado e dados de endereço

-- Adicionar campos adicionais à tabela customers
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS receiver_name text,
ADD COLUMN IF NOT EXISTS address_line1 text,
ADD COLUMN IF NOT EXISTS address_line2 text,
ADD COLUMN IF NOT EXISTS number text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS order_code char(9),
ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES public.affiliates(id),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS customers_order_code_idx ON public.customers (order_code);
CREATE INDEX IF NOT EXISTS customers_affiliate_id_idx ON public.customers (affiliate_id);
CREATE INDEX IF NOT EXISTS customers_email_idx ON public.customers (email);
CREATE INDEX IF NOT EXISTS customers_cpf_idx ON public.customers (cpf);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários para documentação
COMMENT ON COLUMN public.customers.receiver_name IS 'Nome do destinatário para entrega';
COMMENT ON COLUMN public.customers.address_line1 IS 'Endereço (rua, avenida)';
COMMENT ON COLUMN public.customers.address_line2 IS 'Complemento do endereço';
COMMENT ON COLUMN public.customers.number IS 'Número do endereço';
COMMENT ON COLUMN public.customers.district IS 'Bairro';
COMMENT ON COLUMN public.customers.city IS 'Cidade';
COMMENT ON COLUMN public.customers.state IS 'Estado';
COMMENT ON COLUMN public.customers.postal_code IS 'CEP';
COMMENT ON COLUMN public.customers.order_code IS 'Código único do pedido gerado';
COMMENT ON COLUMN public.customers.affiliate_id IS 'ID do afiliado que gerou a venda';
COMMENT ON COLUMN public.customers.updated_at IS 'Data da última atualização';