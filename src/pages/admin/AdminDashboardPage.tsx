import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/card';
import { Button } from '../../components/common/button';

export function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            Manage your customer experience platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user roles and permissions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/app/admin/roles">
                <Button>
                  Manage Roles
                </Button>
              </Link>
            </CardContent>
          </Card>
          {/* Add more admin features here */}
        </CardContent>
      </Card>
    </div>
  );
} 