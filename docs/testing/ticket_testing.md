# Ticket System Testing Guide

## Test Dependencies & Order

### 1. Database Tests (Must Pass First)
These tests validate the core database operations and must pass before proceeding:
```bash
# Install pgTAP if not already installed
sudo apt-get install pgtap

# Run database tests
./scripts/test-db.sh
```

**Critical Tests:**
1. Stored Procedures
   - `assign_ticket`
     - Valid assignment
     - Self-assignment
     - Reassignment
     - Invalid user assignment
     - Team member assignment
   - `update_ticket_status`
     - All status transitions
     - Invalid status transitions
     - Status history recording
     - Unauthorized status updates
   - `calculate_sla_due_date`
     - All priority levels
     - Business hours calculation
     - Holiday handling
     - Weekend handling
2. Triggers
   - `set_ticket_sla_due_date`
     - Creation trigger
     - Update trigger
     - Priority change recalculation
     - Team change recalculation
3. Data Integrity
   - Foreign key constraints
   - Enum validations
   - Required fields
   - Unique constraints
   - Check constraints

### 2. Middleware Tests
Only run these after database tests pass:
```bash
# Run middleware tests
npm run test:middleware
```

**Key Tests:**
1. Validation
   - Ticket creation validation
     - Required fields
     - Field length limits
     - Valid enums
     - Custom field validation
     - File attachment validation
   - Ticket update validation
     - Status transitions
     - Priority changes
     - Assignment rules
     - Team transfer rules
2. Authorization
   - Access control
     - Team member access
     - Creator access
     - Assignee access
     - Admin access
     - Public access
   - Management permissions
     - Team lead permissions
     - Admin permissions
     - Self-management rules
3. Error Handling
   - Invalid input handling
   - Database error handling
   - Authorization error handling
   - Rate limiting
   - Concurrent update handling

### 3. Service Layer Tests
Run these after middleware tests pass:
```bash
# Run service tests
npm run test:services
```

**Key Tests:**
1. Ticket Operations
   - Creation
     - Basic ticket creation
     - With attachments
     - With custom fields
     - With team assignment
     - With initial assignment
   - Updates
     - Status updates
     - Priority updates
     - Assignment changes
     - Team transfers
     - Adding comments
   - Queries
     - List with filters
     - Search functionality
     - Pagination
     - Sorting
2. SLA Management
   - Calculation
   - Breach detection
   - Notifications
   - Escalations
3. Team Management
   - Team creation
   - Member management
   - Role assignments
   - Access control
4. Integration
   - Email notifications
   - Webhook triggers
   - External system integration

## Environment Setup

### 1. Test Database Environment
```bash
# Required environment variables
POSTGRES_DB=customer_experience_test
POSTGRES_USER=test_user
POSTGRES_PASSWORD=test_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Create test database
createdb customer_experience_test

# Run migrations
npm run migrate:test

# Load test data
npm run seed:test
```

### 2. Test API Environment
```bash
# Required environment variables
SUPABASE_URL=your_test_project_url
SUPABASE_ANON_KEY=your_test_anon_key
SUPABASE_SERVICE_KEY=your_test_service_key

# Additional test configuration
TEST_EMAIL_PROVIDER=smtp4dev
TEST_WEBHOOK_ENDPOINT=http://localhost:3001/webhook
```

### 3. Test Client Environment
```bash
# Required environment variables
VITE_SUPABASE_URL=your_test_project_url
VITE_SUPABASE_ANON_KEY=your_test_anon_key

# UI test configuration
VITE_MOCK_DATE=2024-01-21T12:00:00Z
VITE_TEST_TIMEOUT=5000
```

## Running All Tests

### 1. Database Layer
```bash
# Run database tests
./scripts/test-db.sh
```

Expected output:
```
Running tests: 12 tests
TAP version 13
ok 1 - assign_ticket should execute successfully
ok 2 - ticket should be assigned to the correct user
...
```

### 2. Middleware Layer
```bash
# Run middleware tests
npm run test:middleware
```

Expected output:
```
✓ validateTicketCreation
  ✓ should pass validation with valid ticket data
  ✓ should fail validation with missing title
...
```

### 3. Service Layer
```bash
# Run service tests
npm run test:services
```

Expected output:
```
✓ TicketService
  ✓ should create ticket
  ✓ should update ticket
...
```

## Test Data Management

### 1. Database Seeding
```bash
# Seed test data
npm run seed:test

# Reset test data
npm run reset:test

# Generate custom test data
npm run generate:test-data -- --tickets 100 --users 10 --teams 5
```

### 2. Mock Data
```typescript
// Mock user roles
const TEST_USERS = {
  ADMIN: { id: 'admin-123', role: 'admin' },
  TEAM_LEAD: { id: 'lead-123', role: 'team_lead' },
  AGENT: { id: 'agent-123', role: 'agent' },
  CUSTOMER: { id: 'customer-123', role: 'customer' }
};

// Mock tickets
const TEST_TICKETS = {
  NEW: { id: 'ticket-new', status: 'open' },
  IN_PROGRESS: { id: 'ticket-progress', status: 'in_progress' },
  RESOLVED: { id: 'ticket-resolved', status: 'resolved' }
};
```

## Troubleshooting

### Database Tests
1. If pgTAP tests fail:
   ```bash
   # Check PostgreSQL logs
   sudo tail -f /var/log/postgresql/postgresql-14-main.log
   
   # Verify database connection
   psql -h localhost -U test_user -d customer_experience_test
   ```

2. If stored procedures fail:
   ```sql
   -- Check if functions exist
   \df assign_ticket
   \df update_ticket_status
   
   -- Check function definitions
   \sf assign_ticket
   \sf update_ticket_status
   ```

3. If triggers fail:
   ```sql
   -- Check trigger existence
   \dft tickets
   
   -- Check trigger function
   \sf set_ticket_sla_due_date
   ```

### Middleware Tests
1. If validation tests fail:
   - Check enum values in database match TypeScript types
   - Verify test database has required data
   - Check custom field definitions
   - Verify file upload configuration

2. If authorization tests fail:
   - Verify test users exist in database
   - Check role assignments
   - Verify team memberships
   - Check permission definitions

3. If rate limiting tests fail:
   - Check rate limit configuration
   - Verify Redis connection (if used)
   - Check time-based test assumptions

### Service Tests
1. If ticket operations fail:
   - Check database constraints
   - Verify transaction handling
   - Check error handling
   - Verify event triggers

2. If SLA tests fail:
   - Check business hour definitions
   - Verify holiday calendar
   - Check timezone handling
   - Verify calculation logic

3. If integration tests fail:
   - Check external service mocks
   - Verify webhook configurations
   - Check email service setup
   - Verify API credentials

## CI/CD Integration

### GitHub Actions
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: customer_experience_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        ports:
          - 5432:5432
      redis:
        image: redis
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v2
      - name: Install pgTAP
        run: sudo apt-get install -y pgtap
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install Dependencies
        run: npm ci
      - name: Run Database Tests
        run: ./scripts/test-db.sh
      - name: Run Middleware Tests
        run: npm run test:middleware
      - name: Run Service Tests
        run: npm run test:services
      - name: Upload Coverage
        uses: codecov/codecov-action@v2
```

## Test Coverage Requirements

1. Database Layer:
   - 100% coverage of stored procedures
   - All triggers tested
   - All constraints verified
   - Edge cases covered:
     - Concurrent updates
     - Transaction rollbacks
     - Constraint violations
     - Invalid inputs

2. Middleware Layer:
   - 100% coverage of validation logic
   - 100% coverage of authorization checks
   - Edge cases tested:
     - Rate limiting
     - Invalid tokens
     - Expired sessions
     - Malformed requests

3. Service Layer:
   - 90% code coverage minimum
   - All public methods tested
   - Error cases covered:
     - Network failures
     - Timeout handling
     - Partial failures
     - Data inconsistencies

## Performance Testing

### 1. Load Tests
```bash
# Run load tests
npm run test:load

# Test scenarios:
- Concurrent ticket creation
- Bulk status updates
- Search and filtering
- SLA calculations
```

### 2. Stress Tests
```bash
# Run stress tests
npm run test:stress

# Test scenarios:
- Maximum concurrent users
- Database connection limits
- File upload limits
- Rate limiting thresholds
``` 