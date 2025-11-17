-- Fix permissions for checkout operations
-- Grant full permissions for checkout operations

-- Grant permissions for orders table
GRANT ALL ON orders TO anon;
GRANT ALL ON orders TO authenticated;

-- Grant permissions for customers table
GRANT ALL ON customers TO anon;
GRANT ALL ON customers TO authenticated;

-- Grant permissions for shipments table
GRANT ALL ON shipments TO anon;
GRANT ALL ON shipments TO authenticated;

-- Grant permissions for affiliates table
GRANT SELECT ON affiliates TO anon;
GRANT SELECT ON affiliates TO authenticated;

-- Fix RLS policies for orders table
DROP POLICY IF EXISTS "Allow anonymous to read active orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated to read own orders" ON orders;

CREATE POLICY "Allow anonymous to manage orders" ON orders
    FOR ALL
    TO anon
    USING (true);

CREATE POLICY "Allow authenticated to manage orders" ON orders
    FOR ALL
    TO authenticated
    USING (true);

-- Fix RLS policies for customers table
DROP POLICY IF EXISTS "Allow anonymous to insert customers" ON customers;
DROP POLICY IF EXISTS "Allow anonymous to update own data" ON customers;
DROP POLICY IF EXISTS "Allow authenticated to manage customers" ON customers;

CREATE POLICY "Allow anonymous to manage customers" ON customers
    FOR ALL
    TO anon
    USING (true);

CREATE POLICY "Allow authenticated to manage customers" ON customers
    FOR ALL
    TO authenticated
    USING (true);

-- Fix RLS policies for shipments table
DROP POLICY IF EXISTS "Allow anonymous to insert shipments" ON shipments;
DROP POLICY IF EXISTS "Allow authenticated to manage shipments" ON shipments;

CREATE POLICY "Allow anonymous to manage shipments" ON shipments
    FOR ALL
    TO anon
    USING (true);

CREATE POLICY "Allow authenticated to manage shipments" ON shipments
    FOR ALL
    TO authenticated
    USING (true);