# Team Service Documentation

## Overview
The Team Service manages team operations within the system, including team creation, member management, and team-based access control. It supports hierarchical team structures with leads and members.

## API Endpoints

### Team Management

#### Create Team
```typescript
async createTeam(data: CreateTeamDTO): Promise<Team>
```
- **Purpose**: Creates a new team
- **Authentication**: Required (admin only)
- **Parameters**:
  - `data`: CreateTeamDTO object containing:
    - `name`: string
    - `description`: string
    - `lead_id`: string (optional)
- **Returns**: Created Team object
- **Notes**: Automatically sets up initial team structure

#### Update Team
```typescript
async updateTeam(id: string, data: UpdateTeamDTO): Promise<Team>
```
- **Purpose**: Updates an existing team
- **Authentication**: Required (admin or team lead)
- **Parameters**:
  - `id`: Team ID
  - `data`: UpdateTeamDTO with fields to update
- **Returns**: Updated Team object
- **Notes**: Validates update permissions

#### Delete Team
```typescript
async deleteTeam(id: string): Promise<void>
```
- **Purpose**: Deletes a team
- **Authentication**: Required (admin only)
- **Parameters**:
  - `id`: Team ID
- **Notes**: Handles cleanup of team associations

### Member Management

#### Add Team Member
```typescript
async addTeamMember(data: AddTeamMemberDTO): Promise<TeamMember>
```
- **Purpose**: Adds a member to a team
- **Authentication**: Required (admin or team lead)
- **Parameters**:
  - `data`: AddTeamMemberDTO containing:
    - `team_id`: string
    - `user_id`: string
    - `role`: TeamRole
- **Returns**: Created TeamMember object
- **Notes**: Handles duplicate member prevention

#### Remove Team Member
```typescript
async removeTeamMember(teamId: string, userId: string): Promise<void>
```
- **Purpose**: Removes a member from a team
- **Authentication**: Required (admin or team lead)
- **Parameters**:
  - `teamId`: Team ID
  - `userId`: User ID to remove
- **Notes**: Updates team associations

#### Update Member Role
```typescript
async updateMemberRole(teamId: string, userId: string, role: TeamRole): Promise<TeamMember>
```
- **Purpose**: Updates a team member's role
- **Authentication**: Required (admin or team lead)
- **Parameters**:
  - `teamId`: Team ID
  - `userId`: User ID
  - `role`: New role
- **Returns**: Updated TeamMember object
- **Notes**: Validates role change permissions

## Team Roles

### Available Roles
1. **Team Lead**
   - Single lead per team
   - Can manage team members
   - Can assign tickets to team

2. **Member**
   - Standard team member
   - Can view team tickets
   - Can update assigned tickets

## Error Handling

### Common Errors
1. Team Operation Errors
   - Team already exists
   - Team not found
   - Invalid team update

2. Member Operation Errors
   - Member already exists
   - Invalid role assignment
   - User not found
   - Cannot remove team lead

### Error Response Format
```typescript
{
  message: string;
  code?: string;
  details?: {
    teamId?: string;
    userId?: string;
    role?: string;
  };
}
```

## Authentication Requirements

### Role-Based Access
- **Admin**: Full access to all team operations
- **Team Lead**: Can manage own team
- **Member**: Limited to view access
- **Customer**: No team access

### Required Headers
```typescript
{
  Authorization: 'Bearer <token>';
  Content-Type: 'application/json';
}
```

## Team Structure Rules
1. Each team must have a name
2. Teams can have one lead
3. Teams can have multiple members
4. Members can belong to multiple teams
5. Team leads must be agents or admins
6. Customers cannot be team members

## Best Practices
1. Validate team existence before operations
2. Check user roles before member operations
3. Maintain team member audit logs
4. Handle team deletions carefully
5. Verify team lead assignments 