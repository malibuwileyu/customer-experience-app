# Role Management Service Documentation

## Overview
The Role Management Service handles user roles and permissions within the system. It provides functionality for role assignment, permission checking, and role-based access control.

## Types

### AssignRoleParams
```typescript
type AssignRoleParams = {
  userId: string;
  role: UserRole;
  performedBy: string;
}
```

### CheckPermissionParams
```typescript
type CheckPermissionParams = {
  userId: string;
  permission: string;
}
```

### RolePermissionResponse
```typescript
interface RolePermissionResponse {
  permissions: {
    id: string;
    name: string;
    description: string | null;
  }
}
```

## API Endpoints

### Role Management

#### Get User Role
```typescript
async getUserRole(userId: string): Promise<UserRole | null>
```
- **Purpose**: Retrieves a user's current role
- **Authentication**: Required
- **Parameters**:
  - `userId`: ID of the user
- **Returns**: User's role or null if not found
- **Notes**: Uses service client for direct database access

#### Assign Role
```typescript
async assignRole(params: AssignRoleParams): Promise<void>
```
- **Purpose**: Assigns a role to a user
- **Authentication**: Required (admin only)
- **Parameters**:
  - `params`: AssignRoleParams object
- **Throws**: Error if assignment fails
- **Notes**: Records assignment in audit log

### Permission Management

#### Check Permission
```typescript
async checkPermission(params: CheckPermissionParams): Promise<boolean>
```
- **Purpose**: Checks if a user has a specific permission
- **Authentication**: Required
- **Parameters**:
  - `params`: CheckPermissionParams object
- **Returns**: Boolean indicating permission status
- **Notes**: Uses RLS policies for verification

#### Get Role Permissions
```typescript
async getRolePermissions(role: UserRole): Promise<RolePermissionResponse>
```
- **Purpose**: Lists all permissions for a role
- **Authentication**: Required
- **Parameters**:
  - `role`: Role to check
- **Returns**: List of permissions for the role
- **Notes**: Cached for performance

## Role Hierarchy

### Available Roles
1. **Admin**
   - Full system access
   - Can manage other users' roles
   - Can perform all operations

2. **Team Lead**
   - Team management
   - Member assignment
   - Ticket management within team

3. **Agent**
   - Ticket operations
   - File management
   - Limited team access

4. **Customer**
   - Basic ticket operations
   - View own tickets
   - Create new tickets

## Permission Structure

### Permission Format
`{resource}:{action}`

### Common Permissions
- `tickets:create`
- `tickets:read`
- `tickets:update`
- `tickets:delete`
- `teams:manage`
- `users:manage`
- `roles:assign`

## Error Handling

### Common Errors
1. Role Assignment Errors
   - Invalid role
   - Unauthorized assignment
   - User not found

2. Permission Errors
   - Invalid permission
   - Permission check failed
   - Role not found

### Error Response Format
```typescript
{
  message: string;
  code: string;
  details?: {
    role?: string;
    permission?: string;
    userId?: string;
  };
}
```

## Authentication Requirements

### Required Headers
```typescript
{
  Authorization: 'Bearer <token>';
  Content-Type: 'application/json';
}
```

## Best Practices
1. Always verify role assignments
2. Cache permission checks when possible
3. Use role hierarchy for access control
4. Maintain audit logs for role changes
5. Validate permissions before operations 