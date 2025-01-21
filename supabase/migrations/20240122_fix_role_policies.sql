-- Drop existing problematic policies
DROP POLICY IF EXISTS "Only admins can modify user roles" ON user_roles;
DROP POLICY IF EXISTS "Role audit log viewable by admins only" ON role_audit_log;

-- Create a function to check admin status without recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = is_admin.user_id
        AND role IN ('admin', 'super_admin')
    );
$$;

-- Recreate the policies using the new function
CREATE POLICY "Only admins can modify user roles"
    ON user_roles FOR ALL
    TO authenticated
    USING (is_admin(auth.uid()));

CREATE POLICY "Role audit log viewable by admins only"
    ON role_audit_log FOR SELECT
    TO authenticated
    USING (is_admin(auth.uid()));

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION is_admin TO authenticated; 