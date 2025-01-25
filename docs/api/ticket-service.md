# Ticket Service Documentation

## Overview
The Ticket Service provides comprehensive functionality for managing support tickets in the system. It handles ticket creation, retrieval, updates, comments, status changes, and team assignments.

## API Endpoints

### Ticket Management

#### Create Ticket
```typescript
async createTicket(data: CreateTicketDTO): Promise<Ticket>
```
- **Purpose**: Creates a new support ticket
- **Authentication**: Required
- **Parameters**:
  - `data`: CreateTicketDTO object containing:
    - `title`: string
    - `description`: string
    - `priority`: TicketPriority
    - `internal_notes?`: string
- **Returns**: Created Ticket object
- **Throws**: Error if ticket creation fails
- **Notes**: Automatically sets status to 'open' and records creator ID

#### Get Ticket
```typescript
async getTicket(id: string): Promise<Ticket>
```
- **Purpose**: Retrieves a specific ticket by ID
- **Authentication**: Required
- **Parameters**:
  - `id`: Ticket ID
- **Returns**: Ticket object
- **Throws**: Error if ticket not found
- **Notes**: Uses service client to bypass RLS for proper access control

#### Get All Tickets
```typescript
async getAllTickets(): Promise<PaginatedResponse<Ticket>>
```
- **Purpose**: Retrieves all tickets (admin/agent view)
- **Authentication**: Required (admin/agent only)
- **Returns**: PaginatedResponse containing:
  - `data`: Array of Ticket objects
  - `count`: Total number of tickets
- **Notes**: Bypasses RLS using service client

### Ticket Operations

#### Update Ticket
```typescript
async updateTicket(id: string, data: UpdateTicketDTO): Promise<Ticket>
```
- **Purpose**: Updates an existing ticket
- **Authentication**: Required
- **Parameters**:
  - `id`: Ticket ID
  - `data`: UpdateTicketDTO with fields to update
- **Returns**: Updated Ticket object
- **Notes**: Special handling for attachment updates

#### Update Ticket Status
```typescript
async updateTicketStatus(ticketId: string, status: Ticket['status']): Promise<Ticket>
```
- **Purpose**: Updates a ticket's status
- **Authentication**: Required (non-customers only)
- **Parameters**:
  - `ticketId`: Ticket ID
  - `status`: New status value
- **Returns**: Updated Ticket object
- **Notes**: Records status change in history

### Bulk Operations

#### Bulk Delete Tickets
```typescript
async bulkDeleteTickets(ids: string[]): Promise<void>
```
- **Purpose**: Deletes multiple tickets
- **Authentication**: Required (admin only)
- **Parameters**:
  - `ids`: Array of ticket IDs to delete
- **Notes**: Verifies admin role before deletion

#### Bulk Update Status
```typescript
async bulkUpdateStatus(ids: string[], status: Ticket['status']): Promise<void>
```
- **Purpose**: Updates status of multiple tickets
- **Authentication**: Required (non-customers only)
- **Parameters**:
  - `ids`: Array of ticket IDs
  - `status`: New status value
- **Notes**: Records status changes in history

#### Bulk Update Priority
```typescript
async bulkUpdatePriority(ids: string[], priority: Ticket['priority']): Promise<void>
```
- **Purpose**: Updates priority of multiple tickets
- **Authentication**: Required (admin/agent only)
- **Parameters**:
  - `ids`: Array of ticket IDs
  - `priority`: New priority value

### Team Assignment

#### Assign Team
```typescript
async assignTeam(ticketId: string, teamId: string | null): Promise<Ticket>
```
- **Purpose**: Assigns or removes a team from a ticket
- **Authentication**: Required (admin or team lead)
- **Parameters**:
  - `ticketId`: Ticket ID
  - `teamId`: Team ID (null to remove assignment)
- **Returns**: Updated Ticket object
- **Notes**: Verifies user has permission for team assignment

## Error Handling

### Common Errors
1. Authentication Errors
   - `Not authenticated`: User is not logged in
   - `User profile not found`: User exists but has no profile

2. Permission Errors
   - `Only admins can delete tickets`
   - `Customers cannot change ticket status`
   - `Only agents and admins can change ticket priority`
   - `You don't have permission to assign this team`

3. Resource Errors
   - `Ticket not found`
   - `Team not found`
   - `Failed to update ticket`

### Error Response Format
```typescript
{
  message: string;
  details?: string;
  code?: string;
}
```

## Authentication Requirements

### Role-Based Access
- **Admin**: Full access to all operations
- **Agent**: Can update status, priority, and view all tickets
- **Team Lead**: Can assign their team to tickets
- **Customer**: Limited to viewing and creating tickets

### Required Headers
```typescript
{
  Authorization: 'Bearer <token>';
  Content-Type: 'application/json';
}
``` 