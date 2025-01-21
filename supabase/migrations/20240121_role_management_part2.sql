-- Create user_roles table (instead of modifying profiles)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create role_permissions mapping table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(role, permission_id)
);

-- Create audit log for role changes
CREATE TABLE IF NOT EXISTS role_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    old_role user_role,
    new_role user_role,
    performed_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_permission ON role_permissions(permission_id);
CREATE INDEX idx_role_audit_log_user ON role_audit_log(user_id);
CREATE INDEX idx_role_audit_log_created ON role_audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "User roles viewable by authenticated users"
    ON user_roles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can view their own role"
    ON user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Only admins can modify user roles"
    ON user_roles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Permissions viewable by authenticated users"
    ON permissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Role permissions viewable by authenticated users"
    ON role_permissions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Role audit log viewable by admins only"
    ON role_audit_log FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Insert default permissions
INSERT INTO permissions (name, description) VALUES
    ('view:tickets', 'Can view tickets'),
    ('create:tickets', 'Can create tickets'),
    ('edit:tickets', 'Can edit tickets'),
    ('delete:tickets', 'Can delete tickets'),
    ('assign:tickets', 'Can assign tickets'),
    ('view:kb', 'Can view knowledge base articles'),
    ('edit:kb', 'Can edit knowledge base articles'),
    ('manage:users', 'Can manage users'),
    ('manage:roles', 'Can manage roles and permissions'),
    ('view:analytics', 'Can view analytics')
ON CONFLICT (name) DO NOTHING;

-- Insert default role permissions
WITH roles AS (
    SELECT unnest(enum_range(NULL::user_role)) AS role
)
INSERT INTO role_permissions (role, permission_id)
SELECT 
    r.role,
    p.id
FROM roles r
CROSS JOIN permissions p
WHERE 
    (r.role = 'super_admin') OR
    (r.role = 'admin' AND p.name != 'manage:roles') OR
    (r.role = 'team_lead' AND p.name IN (
        'view:tickets', 'create:tickets', 'edit:tickets', 'assign:tickets',
        'view:kb', 'edit:kb', 'view:analytics'
    )) OR
    (r.role = 'agent' AND p.name IN (
        'view:tickets', 'create:tickets', 'edit:tickets',
        'view:kb', 'edit:kb'
    )) OR
    (r.role = 'customer' AND p.name IN (
        'view:tickets', 'create:tickets',
        'view:kb'
    ))
ON CONFLICT (role, permission_id) DO NOTHING;

-- Create helper functions
CREATE OR REPLACE FUNCTION check_user_permission(
    user_id UUID,
    permission_name TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role = rp.role
        JOIN permissions perm ON rp.permission_id = perm.id
        WHERE ur.user_id = check_user_permission.user_id
        AND perm.name = check_user_permission.permission_name
    );
END;
$$; 