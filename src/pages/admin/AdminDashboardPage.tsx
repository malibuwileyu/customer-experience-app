import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/common/card';
import { Button } from '../../components/common/button';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboardPage() {
  const navigate = useNavigate();

  const handleTeamManagement = () => {
    navigate('/app/teams');
  };

  const handleCreateTeam = () => {
    navigate('/app/teams/new');
  };

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

          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Create and manage teams, assign members, and set team roles.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={handleTeamManagement}>
                Manage Teams
              </Button>
              <Button variant="outline" onClick={handleCreateTeam}>
                Create Team
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
} 