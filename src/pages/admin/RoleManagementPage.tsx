import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roleManagementService } from '../../services/role-management.service';
import { supabaseService } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
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

interface DbProfile {
  id: string;
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
      const { data: users, error: usersError } = await supabaseService.auth.admin.listUsers()
      if (usersError) {
        console.error('Error fetching users:', usersError);
        throw usersError;
      }

      // Then get their roles from profiles
      const { data: profiles, error: profilesError } = await supabaseService
        .from('profiles')
        .select('id, role')

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Fetched profiles:', profiles);

      // Combine users with their roles from profiles
      return (users.users || []).map((user: AuthUser) => ({
        id: user.id,
        email: user.email,
        role: (profiles as DbProfile[] | null)?.find(p => p.id === user.id)?.role || null
      })) as User[]
    },
  })

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      console.log('Updating role...', { userId, newRole });
      setIsUpdating(userId);
      toast.loading('Updating role...');

      await roleManagementService.assignRole({
        userId,
        role: newRole,
        performedBy: currentUser?.id || '',
      });

      console.log('Role updated successfully');
      toast.success('Role updated successfully');
      await refetch();
    } catch (error) {
      console.error('Failed to update role:', error);
      toast.error('Failed to update role. Please try again.');
    } finally {
      setIsUpdating(null);
      toast.dismiss();
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