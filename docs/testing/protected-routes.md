# Protected Routes Testing Guide

## Overview
This document outlines the testing procedures for protected routes and role-based access control in the customer experience app.

## Prerequisites
1. Have the development server running (`npm run dev`)
2. Access to multiple test accounts with different roles:
   - Admin user
   - Agent user
   - Customer user
   - Unauthenticated user (no login)

## Test Cases

### 1. Authentication Redirect Tests
- [ ] **Unauthenticated Access Test**
  1. Log out of any existing session
  2. Try to access `/dashboard`
  3. Verify redirect to `/login`
  4. Verify the original URL is preserved in location state
  5. After login, verify redirect back to `/dashboard`

- [ ] **Authentication Persistence Test**
  1. Log in as any user
  2. Refresh the page while on a protected route
  3. Verify you remain on the protected route
  4. Verify no unnecessary redirects occur

### 2. Role-Based Access Tests
- [ ] **Admin Access Test**
  1. Log in as admin user
  2. Verify access to all protected routes:
     - `/dashboard`
     - `/tickets`
     - `/admin/*` routes
  3. Verify admin-only UI elements are visible

- [ ] **Agent Access Test**
  1. Log in as agent user
  2. Verify access to agent-level routes:
     - `/dashboard`
     - `/tickets`
  3. Verify agent-only UI elements are visible
  4. Verify admin routes redirect to unauthorized page

- [ ] **Customer Access Test**
  1. Log in as customer user
  2. Verify access to customer-level routes only
  3. Verify restricted routes redirect to unauthorized page
  4. Verify customer-only UI elements are visible

### 3. Edge Cases
- [ ] **Session Expiry Test**
  1. Log in as any user
  2. Manually expire the session (wait or clear token)
  3. Attempt to access protected route
  4. Verify redirect to login
  5. Verify error message about session expiry

- [ ] **Role Change Test**
  1. Log in as user
  2. Have admin change user's role
  3. Refresh page
  4. Verify access rights updated accordingly
  5. Verify UI elements update to match new role

## Test Accounts
```typescript
const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    role: 'admin'
  },
  agent: {
    email: 'agent@test.com',
    password: 'agent123',
    role: 'agent'
  },
  customer: {
    email: 'customer@test.com',
    password: 'customer123',
    role: 'customer'
  }
};
```

## Expected Behaviors

### Redirect Logic
1. Unauthenticated users should be redirected to `/login`
2. The original requested URL should be preserved in location state
3. After successful login, user should be redirected to original URL
4. Users without required role should be redirected to unauthorized page
5. Session expiry should redirect to login with appropriate message

### Error Messages
- Unauthorized access: "You don't have permission to access this page"
- Session expired: "Your session has expired. Please log in again"
- Invalid role: "Your account doesn't have the required role to access this page"

## Automated Testing (Future Enhancement)
While most of these tests require manual verification due to their integration with auth systems, some aspects can be automated:

```typescript
// Example test structure for future implementation
describe('ProtectedRoute', () => {
  it('redirects to login when unauthenticated', () => {
    // Mock unauthenticated state
    // Render protected route
    // Assert redirect to login
  });

  it('preserves original location in state', () => {
    // Mock navigation to protected route
    // Assert location state contains original path
  });

  it('allows access with correct role', () => {
    // Mock authenticated state with correct role
    // Render protected route
    // Assert children are rendered
  });

  it('redirects on insufficient role', () => {
    // Mock authenticated state with incorrect role
    // Render protected route
    // Assert redirect to unauthorized
  });
});
``` 