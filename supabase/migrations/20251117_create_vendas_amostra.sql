-- Criar tabela vendas_amostra para controle de pagamentos
CREATE TABLE IF NOT EXISTS public.vendas_amostra (
    id BIGSERIAL PRIMARY KEY,
    payment_link_id TEXT NOT NULL,
    payment_link_status BOOLEAN DEFAULT FALSE,
    order_status TEXT,
    follow_up_counter INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_vendas_amostra_payment_link_id ON public.vendas_amostra(payment_link_id);
CREATE INDEX IF NOT EXISTS idx_vendas_amostra_payment_status ON public.vendas_amostra(payment_link_status);

-- Configurar RLS
ALTER TABLE public.vendas_amostra ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Allow anonymous to read vendas_amostra" ON public.vendas_amostra
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous to update vendas_amostra" ON public.vendas_amostra
    FOR UPDATE
    TO anon
    USING (true);

CREATE POLICY "Allow authenticated to manage vendas_amostra" ON public.vendas_amostra
    FOR ALL
    TO authenticated
    USING (true);

-- Grant permissions
GRANT ALL ON public.vendas_amostra TO anon;
GRANT ALL ON public.vendas_amostra TO authenticated;

-- Function para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_vendas_amostra_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_vendas_amostra_updated_at_trigger
    BEFORE UPDATE ON public.vendas_amostra
    FOR EACH ROW
    EXECUTE FUNCTION public.update_vendas_amostra_updated_at();