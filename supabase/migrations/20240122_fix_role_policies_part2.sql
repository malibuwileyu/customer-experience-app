-- Drop existing problematic policies
DROP POLICY IF EXISTS "Only admins can modify user roles" ON user_roles;

-- Create policy to allow users to insert their own role when signing up
CREATE POLICY "Users can insert their own role"
    ON user_roles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Recreate admin policy to only apply to UPDATE and DELETE
CREATE POLICY "Only admins can update or delete user roles"
    ON user_roles FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Only admins can delete user roles"
    ON user_roles FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    ); 