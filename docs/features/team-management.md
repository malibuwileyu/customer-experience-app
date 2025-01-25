# Team Management

## Overview
The team management system enables organization of support staff into teams, with role-based permissions and hierarchical structures. It supports team creation, member management, and integration with the ticket assignment system.

## Core Features

### 1. Team Creation & Management
- Create teams with name and description
- Assign team leads
- Update team information
- Delete teams (admin only)

### 2. Member Management
- Add members to teams
- Assign roles within teams
- Remove members from teams
- Track member history

### 3. Role Management
- Team Lead role assignment
- Agent role assignment
- Role-based permissions
- Single team lead per team

### 4. Team Assignment
- Assign tickets to teams
- Track team workload
- View team-specific ticket queues
- Transfer tickets between teams

## Role-Based Access

### Admin
- Create and delete teams
- Assign team leads
- Manage team members
- View all teams and metrics

### Team Lead
- Manage team members
- Assign agent roles
- View team performance
- Cannot delete teams

### Agent
- View team information
- Access team ticket queue
- Update assigned tickets
- No member management

### Customer
- No team management access
- Can view assigned team on tickets
- Cannot modify team assignments

## Usage Examples

### Creating a Team
```typescript
const { createTeam } = useTeamManagement();

await createTeam({
  name: "Technical Support",
  description: "Handle technical customer issues",
  leadId: "user123"  // Optional team lead ID
});
```

### Managing Members
```typescript
const { addTeamMember, removeTeamMember } = useTeamManagement();

// Add member
await addTeamMember({
  teamId: "team123",
  userId: "user456",
  role: "agent"
});

// Remove member
await removeTeamMember({
  teamId: "team123",
  userId: "user456"
});
```

### Team Assignment
```typescript
const { assignTicketToTeam } = useTeamAssignment();

await assignTicketToTeam({
  ticketId: "ticket123",
  teamId: "team123"
});
```

## Error Handling

### Common Errors
1. **Permission Errors**
   - Unauthorized team creation
   - Invalid role assignment
   - Insufficient permissions

2. **Validation Errors**
   - Duplicate team names
   - Invalid member roles
   - Team lead constraints

3. **Operational Errors**
   - Team deletion with active tickets
   - Member removal constraints
   - Role modification restrictions

### Error Responses
```typescript
interface TeamErrorResponse {
  code: string;
  message: string;
  details?: {
    teamId?: string;
    userId?: string;
    role?: string;
    constraint?: string;
  };
}

// Example error
{
  code: "TEAM_LEAD_EXISTS",
  message: "Team already has a lead assigned",
  details: {
    teamId: "team123",
    existingLeadId: "user789"
  }
}
```

## Real-time Updates
- Instant team member updates
- Real-time role changes
- Team assignment notifications
- Workload tracking updates

## Performance Considerations
- Cached team data (5 minutes)
- Optimized member queries
- Efficient role checks
- Batch member operations

## Security
- Role-based access control
- Team membership validation
- Audit logging
- Permission inheritance

## Related Components
- `TeamList`: Displays all accessible teams
- `TeamDetails`: Shows team information and members
- `TeamMemberList`: Lists team members with roles
- `TeamAssignmentDialog`: Interface for team assignment

## Database Tables
- `teams`: Team information
- `team_members`: Team membership and roles
- `team_activity`: Team action history
- `team_metrics`: Team performance data

## API Endpoints
- `POST /teams`: Create team
- `GET /teams`: List teams
- `PUT /teams/:id`: Update team
- `DELETE /teams/:id`: Delete team
- `POST /teams/:id/members`: Manage members

## Constraints
1. **Team Lead Constraints**
   - One lead per team
   - Must be agent or admin role
   - Cannot be customer role

2. **Member Constraints**
   - Users can be in multiple teams
   - Customers cannot be team members
   - Must have valid role assignment

3. **Deletion Constraints**
   - Cannot delete teams with active tickets
   - Must reassign members before deletion
   - Requires admin permission

## See Also
- [Ticket Management](./ticket-management.md)
- [Role-Based Access Control](./rbac.md)
- [Team Metrics](./team-metrics.md) 