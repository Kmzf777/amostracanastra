-- Habilitar RLS na tabela vendas_amostra
ALTER TABLE vendas_amostra ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir SELECT para todos (anon e authenticated)
CREATE POLICY "Permitir leitura de vendas para todos" ON vendas_amostra
    FOR SELECT
    USING (true);

-- Criar política para permitir INSERT para todos (anon e authenticated)
CREATE POLICY "Permitir inserção de vendas para todos" ON vendas_amostra
    FOR INSERT
    WITH CHECK (true);

-- Criar política para permitir UPDATE para todos (anon e authenticated)
CREATE POLICY "Permitir atualização de vendas para todos" ON vendas_amostra
    FOR UPDATE
    USING (true);

-- Grant permissions
GRANT SELECT ON vendas_amostra TO anon, authenticated;
GRANT INSERT ON vendas_amostra TO anon, authenticated;
GRANT UPDATE ON vendas_amostra TO anon, authenticated;
GRANT DELETE ON vendas_amostra TO anon, authenticated;

-- Verificar permissões atuais
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'vendas_amostra' 
  AND grantee IN ('anon', 'authenticated');