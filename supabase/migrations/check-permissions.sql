-- Check current permissions
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Grant necessary permissions for checkout operations
GRANT SELECT ON affiliates TO anon;
GRANT SELECT ON affiliates TO authenticated;

GRANT ALL ON customers TO anon;
GRANT ALL ON customers TO authenticated;

GRANT ALL ON orders TO anon;
GRANT ALL ON orders TO authenticated;

GRANT ALL ON shipments TO anon;
GRANT ALL ON shipments TO authenticated;