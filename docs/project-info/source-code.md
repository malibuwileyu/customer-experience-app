# Source Code Documentation

## Directory Structure Overview

### `/src` Root Directory
The source code root directory contains the core application code.

### Components (`/src/components`)
React components organized by feature and responsibility:

- `/auth`: Authentication-related components
  - `LoginForm.tsx`: Handles user login with email/password
  - `RegistrationForm.tsx`: New user registration form
  - `ProtectedRoute.tsx`: Route wrapper for authentication checks

- `/common`: Reusable UI components
  - Base components from Shadcn UI
  - Custom shared components

- `/layout`: Layout-related components
  - `MainLayout.tsx`: Main application layout wrapper
  - `Header.tsx`: Application header with navigation
  - `Footer.tsx`: Application footer

### Contexts (`/src/contexts`)
React contexts for global state management:
- `AuthContext.tsx`: Authentication state and methods

### Hooks (`/src/hooks`)
Custom React hooks:
- `/supabase`: Supabase-related hooks for data fetching
- `/api`: API interaction hooks
- `useAuth.ts`: Authentication hook for user management

### Library (`/src/lib`)
Third-party library configurations:
- `supabase.ts`: Supabase client configuration
- `queryClient.ts`: React Query client setup

### Pages (`/src/pages`)
Page components representing routes:
- `/auth`: Authentication pages (login, register)
- `LandingPage.tsx`: Public landing page
- `DashboardPage.tsx`: Main dashboard
- `UnauthorizedPage.tsx`: Access denied page

### Services (`/src/services`)
Business logic and API services:
- `role-management.service.ts`: User role and permission management
- `auth.service.ts`: Authentication service methods

### Stores (`/src/stores`)
Zustand stores for state management:
- `auth.store.ts`: Authentication state
- `ui.store.ts`: UI-related state

### Types (`/src/types`)
TypeScript type definitions:
- `/api`: API-related types
- `common.types.ts`: Shared type definitions
- `supabase.ts`: Supabase database types

### Utils (`/src/utils`)
Utility functions and helpers:
- `date-utils.ts`: Date manipulation utilities
- `string-utils.ts`: String manipulation utilities

### Tests (`/src/__tests__`)
Test files organized by type:
- `/components`: Component tests
- `/integration`: Integration tests
- `/setup`: Test setup and configuration

### Core Files
- `main.tsx`: Application entry point
- `App.tsx`: Root component
- `index.css`: Global styles

## File Organization Rules

1. Each component should be in its own file
2. Related components should be grouped in feature directories
3. Shared utilities should be in the utils directory
4. Types should be centralized in the types directory
5. Tests should mirror the source structure in __tests__

## Naming Conventions

1. Components: PascalCase (e.g., `UserProfile.tsx`)
2. Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`)
3. Utilities: kebab-case (e.g., `string-utils.ts`)
4. Types: PascalCase with '.types.ts' suffix
5. Tests: Same name as source with '.test.tsx' suffix

## Import Guidelines

1. Use relative imports for files in the same directory
2. Use absolute imports for shared utilities and components
3. Group imports by external, internal, and local
4. Avoid circular dependencies 