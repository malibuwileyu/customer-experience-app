# Authentication System Technical Specification

## Overview
This document outlines the technical implementation of the authentication system using Supabase Auth and custom profile management.

## 1. Authentication Flows

### 1.1 Email/Password Authentication
- Sign Up Flow:
  1. User submits email/password through registration form
  2. Supabase Auth creates user in `auth.users`
  3. Trigger creates profile in `public.profiles`
  4. User receives confirmation email
  5. On confirmation, user is assigned 'customer' role by default

- Sign In Flow:
  1. User submits credentials
  2. Supabase validates credentials
  3. Session is established
  4. Profile data is fetched
  5. User is redirected to dashboard

### 1.2 Session Management
- JWT-based authentication
- Session persistence in localStorage
- Auto-refresh of expired tokens
- Secure session termination

## 2. Profile Management

### 2.1 Profile Data Structure
```typescript
interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  role: 'admin' | 'agent' | 'customer';
  avatar_url: string | null;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
```

### 2.2 Profile Operations
- Automatic creation on signup
- Update profile information
- Upload/update avatar
- Manage preferences
- Role management (admin only)

## 3. Role-Based Access Control

### 3.1 User Roles
- Customer: Basic access to own tickets and public knowledge base
- Agent: Access to assigned tickets and customer profiles
- Admin: Full system access

### 3.2 Role-Based UI Elements
- Dynamic navigation based on role
- Protected route components
- Conditional rendering of admin/agent features

## 4. Technical Implementation

### 4.1 Core Components
```typescript
// AuthContext
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: SignUpMetadata) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole[];
}
```

### 4.2 Data Flow
1. Authentication State:
   ```typescript
   const authStore = create<AuthState>((set) => ({
     user: null,
     profile: null,
     loading: true,
     setUser: (user) => set({ user }),
     setProfile: (profile) => set({ profile }),
     reset: () => set({ user: null, profile: null }),
   }));
   ```

2. Real-time Profile Updates:
   ```typescript
   supabase
     .channel('public:profiles')
     .on('postgres_changes', { 
       event: '*', 
       schema: 'public', 
       table: 'profiles',
       filter: `id=eq.${profileId}` 
     }, handleProfileChange)
     .subscribe();
   ```

## 5. Security Considerations

### 5.1 Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character

### 5.2 Rate Limiting
- Login attempts: 5 per minute
- Password reset requests: 3 per hour
- Profile updates: 10 per minute

### 5.3 Session Security
- HTTP-only cookies for session tokens
- CSRF protection
- XSS prevention through proper escaping
- Secure session invalidation

## 6. Error Handling

### 6.1 Authentication Errors
```typescript
enum AuthError {
  INVALID_CREDENTIALS = 'Invalid email or password',
  EMAIL_IN_USE = 'Email already registered',
  WEAK_PASSWORD = 'Password does not meet requirements',
  UNAUTHORIZED = 'Unauthorized access',
  SESSION_EXPIRED = 'Session expired',
}
```

### 6.2 Error Responses
- Clear error messages for users
- Detailed logging for debugging
- Graceful fallbacks for network issues

## 7. Testing Strategy

### 7.1 Unit Tests
- Auth hook behavior
- Context provider methods
- Utility functions
- Form validation

### 7.2 Integration Tests
- Supabase auth flows
- Profile management
- Role-based access
- Real-time updates

### 7.3 E2E Tests
- Complete signup flow
- Login/logout process
- Profile updates
- Role-based navigation

## 8. Performance Considerations

### 8.1 Optimizations
- Caching of profile data
- Lazy loading of protected routes
- Minimal re-renders through memoization
- Efficient role checking

### 8.2 Metrics
- Auth operation response times < 500ms
- Profile updates < 200ms
- Session validation < 100ms

## 9. Dependencies
```json
{
  "@supabase/supabase-js": "^2.x",
  "zustand": "^4.x",
  "@tanstack/react-query": "^4.x",
  "zod": "^3.x"
}
``` 