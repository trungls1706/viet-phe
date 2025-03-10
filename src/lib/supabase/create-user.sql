-- Create enum for user roles if not exists
CREATE TYPE user_role AS ENUM ('owner', 'admin');

-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS to coffee_shops table
ALTER TABLE coffee_shops ENABLE ROW LEVEL SECURITY;

-- Policy for viewing coffee shops (all authenticated users can view)
CREATE POLICY "Anyone can view coffee shops" 
ON coffee_shops FOR SELECT 
TO authenticated 
USING (true);

-- Policy for creating coffee shops (owners and admins can create)
CREATE POLICY "Owners and admins can create coffee shops" 
ON coffee_shops FOR INSERT 
TO authenticated 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('owner', 'admin')
    )
);

-- Policy for updating coffee shops (owners and admins can update)
CREATE POLICY "Owners and admins can update coffee shops" 
ON coffee_shops FOR UPDATE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('owner', 'admin')
    )
);

-- Policy for deleting coffee shops (only owners can delete)
CREATE POLICY "Only owners can delete coffee shops" 
ON coffee_shops FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'owner'
    )
);

-- Insert sample users if they don't exist
INSERT INTO users (email, full_name, role)
SELECT 'trungls1706@vietphe.com', 'trungls1706', 'owner'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'trungls1706@vietphe.com'
);

INSERT INTO users (email, full_name, role)
SELECT 'yennguyen9704@vietphe.com', 'yennguyen9704', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'yennguyen9704@vietphe.com'
);