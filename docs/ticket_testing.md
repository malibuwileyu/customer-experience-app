# Ticket System Testing Guide

## Test Dependencies & Order

### 1. Database Tests (Must Pass First)
These tests validate the core database operations in Supabase:
```bash
# Required environment variables
SUPABASE_URL=your_test_project_url
SUPABASE_SERVICE_KEY=your_test_service_key  # Must use service key for direct SQL execution
SUPABASE_DB_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres  # Direct database connection URL

# Run database tests
./scripts/test-db.sh
```

To get your SUPABASE_DB_URL:
1. Go to your Supabase project dashboard
2. Navigate to Project Settings > Database
3. Find the Connection string (URI) under Connection info
4. Copy the URI and replace [YOUR-PASSWORD] with your database password

**Critical Tests:**
1. Stored Procedures
   - `assign_ticket`
   - `update_ticket_status`
   - `calculate_sla_due_date`
2. Triggers
   - `set_ticket_sla_due_date`
3. Data Integrity
   - Foreign key constraints
   - Enum validations
   - Required fields

### 2. Middleware Tests
Only run these after database tests pass:
```bash
# Run middleware tests
npm run test:middleware
```

**Key Tests:**
1. Validation
   - Ticket creation validation
   - Ticket update validation
2. Authorization
   - Access control
   - Management permissions

### 3. Service Layer Tests
Run these after middleware tests pass:
```bash
# Run service tests
npm run test:services
```

## Environment Setup

### 1. Supabase Test Project
1. Create a test project in Supabase
2. Get the project URL and service key
3. Get the database connection URL from Project Settings > Database
4. Set up environment variables:
```bash
# .env.test
SUPABASE_URL=your_test_project_url
SUPABASE_SERVICE_KEY=your_test_service_key  # For admin operations
SUPABASE_ANON_KEY=your_test_anon_key       # For client operations
SUPABASE_DB_URL=your_database_connection_url  # For direct database tests
```

### 2. Test API Environment
```bash
# Required environment variables
SUPABASE_URL=your_test_project_url
SUPABASE_ANON_KEY=your_test_anon_key
SUPABASE_SERVICE_KEY=your_test_service_key
```

### 3. Test Client Environment
```bash
# Required environment variables
VITE_SUPABASE_URL=your_test_project_url
VITE_SUPABASE_ANON_KEY=your_test_anon_key
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

## Troubleshooting

### Database Tests
1. If pgTAP tests fail:
   - Check Supabase connection settings
   - Verify database URL is correct
   - Verify service key has necessary permissions
   - Check Supabase project logs in dashboard
   - Verify SQL functions exist in Supabase

2. If stored procedures fail:
   ```sql
   -- Check if functions exist in Supabase SQL editor
   select routine_name, routine_type
   from information_schema.routines
   where routine_schema = 'public'
   and routine_type = 'FUNCTION';
   ```

### Middleware Tests
1. If validation tests fail:
   - Check enum values in Supabase match TypeScript types
   - Verify test data exists in Supabase tables
   - Check RLS policies are correctly set

2. If authorization tests fail:
   - Verify test users exist in Supabase auth
   - Check role assignments in Supabase
   - Verify RLS policies are working

## CI/CD Integration

### GitHub Actions
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    env:
      SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
      SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_TEST_SERVICE_KEY }}
      SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
      SUPABASE_DB_URL: ${{ secrets.SUPABASE_TEST_DB_URL }}
    steps:
      - uses: actions/checkout@v2
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
```

## Test Coverage Requirements

1. Database Layer:
   - 100% coverage of stored procedures
   - All triggers tested
   - All constraints verified
   - RLS policies tested

2. Middleware Layer:
   - 100% coverage of validation logic
   - 100% coverage of authorization checks
   - Edge cases tested

3. Service Layer:
   - 90% code coverage minimum
   - All public methods tested
   - Error cases covered 