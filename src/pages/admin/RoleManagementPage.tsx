import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roleManagementService, serviceClient } from '../../services/role-management.service';
import { useAuth } from '../../contexts/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/common';
import type { UserRole } from '../../types/role.types';

interface AuthUser {
  id: string;
  email?: string | undefined;
}

interface User {
  id: string;
  email?: string | undefined;
  role: UserRole | null;
}

interface DbUserRole {
  user_id: string;
  role: UserRole;
}

export function RoleManagementPage() {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const { user: currentUser } = useAuth();

  // Fetch users with their roles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('Fetching users...');
      // First get all users using service client
      const { data: users, error: usersError } = await serviceClient.auth.admin.listUsers()
      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      // Then get their roles
      const { data: roles, error: rolesError } = await serviceClient
        .from('user_roles')
        .select('user_id, role')

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        throw rolesError;
      }

      console.log('Fetched roles:', roles);

      // Combine users with their roles
      return (users.users || []).map((user: AuthUser) => ({
        id: user.id,
        email: user.email,
        role: (roles as DbUserRole[] | null)?.find(r => r.user_id === user.id)?.role || null
      })) as User[]
    },
  })

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      console.log('Updating role...', { userId, newRole });
      setIsUpdating(userId);

      await roleManagementService.assignRole({
        userId,
        role: newRole,
        performedBy: currentUser?.id || '',
      });

      console.log('Role updated successfully');
      await refetch();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Role Management</CardTitle>
          <CardDescription>
            Manage user roles and permissions. Changes are logged for audit purposes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role || 'No role'}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role || ''}
                      onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                      disabled={isUpdating === user.id}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="team_lead">Team Lead</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 