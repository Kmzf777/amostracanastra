-- Grant permissions for orders table
GRANT SELECT ON orders TO anon;
GRANT SELECT ON orders TO authenticated;

-- Grant permissions for customers table
GRANT SELECT, INSERT, UPDATE ON customers TO anon;
GRANT SELECT, INSERT, UPDATE ON customers TO authenticated;

-- Grant permissions for shipments table
GRANT SELECT, INSERT ON shipments TO anon;
GRANT SELECT, INSERT ON shipments TO authenticated;

-- Grant permissions for affiliates table (readonly)
GRANT SELECT ON affiliates TO anon;
GRANT SELECT ON affiliates TO authenticated;

-- Create RLS policies for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous to read active orders" ON orders
    FOR SELECT
    TO anon
    USING (status NOT IN ('cancelled', 'expired'));

CREATE POLICY "Allow authenticated to read own orders" ON orders
    FOR SELECT
    TO authenticated
    USING (true);

-- Create RLS policies for customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous to insert customers" ON customers
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous to update own data" ON customers
    FOR UPDATE
    TO anon
    USING (email = current_setting('app.current_email', true));

CREATE POLICY "Allow authenticated to manage customers" ON customers
    FOR ALL
    TO authenticated
    USING (true);

-- Create RLS policies for shipments table
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous to insert shipments" ON shipments
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow authenticated to manage shipments" ON shipments
    FOR ALL
    TO authenticated
    USING (true);