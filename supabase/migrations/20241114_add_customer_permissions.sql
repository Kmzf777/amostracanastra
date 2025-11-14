-- Configurar permissões de acesso para a tabela customers
-- Garantir que anon e authenticated roles possam inserir e selecionar

-- Habilitar RLS (Row Level Security) na tabela customers
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de novos clientes (anon e authenticated)
DROP POLICY IF EXISTS "Permitir inserção de clientes" ON public.customers;
CREATE POLICY "Permitir inserção de clientes" ON public.customers
    FOR INSERT WITH CHECK (true);

-- Política para permitir leitura de próprios dados (authenticated)
DROP POLICY IF EXISTS "Permitir leitura de próprios dados" ON public.customers;
CREATE POLICY "Permitir leitura de próprios dados" ON public.customers
    FOR SELECT USING (
        email = (current_setting('app.current_email', true))::text
        OR id = (current_setting('app.current_customer_id', true))::bigint
    );

-- Política para permitir leitura geral para dashboard (authenticated)
DROP POLICY IF EXISTS "Permitir leitura geral para admin" ON public.customers;
CREATE POLICY "Permitir leitura geral para admin" ON public.customers
    FOR SELECT USING (
        current_setting('app.is_admin', true) = 'true'
    );

-- Conceder permissões básicas
GRANT SELECT ON public.customers TO anon, authenticated;
GRANT INSERT ON public.customers TO anon, authenticated;
GRANT UPDATE ON public.customers TO authenticated;

-- Garantir que a sequence também tenha permissões
GRANT USAGE ON SEQUENCE public.customers_id_seq TO anon, authenticated;