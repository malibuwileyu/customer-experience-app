import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/card';

export function TicketsPage() {
  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Tickets Page</CardTitle>
          <CardDescription>
            This is a dummy tickets page for testing role-based access.
            Only admin and agent roles should be able to access this page.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
} 