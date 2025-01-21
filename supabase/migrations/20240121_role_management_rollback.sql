-- Note: We don't roll back the enum value addition as it might be in use by other tables
-- If you really need to remove it, you'll need to handle all dependencies first

-- Drop helper functions first
DROP FUNCTION IF EXISTS check_user_permission;

-- Drop RLS policies
DROP POLICY IF EXISTS "User roles viewable by authenticated users" ON user_roles;
DROP POLICY IF EXISTS "Users can view their own role" ON user_roles;
DROP POLICY IF EXISTS "Only admins can modify user roles" ON user_roles;
DROP POLICY IF EXISTS "Permissions viewable by authenticated users" ON permissions;
DROP POLICY IF EXISTS "Role permissions viewable by authenticated users" ON role_permissions;
DROP POLICY IF EXISTS "Role audit log viewable by admins only" ON role_audit_log;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_roles_user_id;
DROP INDEX IF EXISTS idx_role_permissions_role;
DROP INDEX IF EXISTS idx_role_permissions_permission;
DROP INDEX IF EXISTS idx_role_audit_log_user;
DROP INDEX IF EXISTS idx_role_audit_log_created;

-- Drop tables (in correct order due to dependencies)
DROP TABLE IF EXISTS role_audit_log;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS user_roles;

-- Drop the user_role enum
DROP TYPE IF EXISTS user_role; 