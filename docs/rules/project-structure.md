# Project Structure

## Directory Organization

```
customer-experience-app/
├── .github/                    # GitHub workflows and templates
│   └── workflows/             # CI/CD workflow definitions
├── __tests__/                 # Test files and utilities
│   ├── unit/                 # Unit tests
│   ├── integration/          # Integration tests
│   └── e2e/                 # End-to-end tests
├── cypress/                   # Cypress testing
│   └── e2e/                 # Cypress E2E tests
├── docs/                      # Project documentation
│   ├── api/                 # API documentation
│   ├── project-info/        # Project information and requirements
│   ├── rules/              # Project rules and guidelines
│   └── specs/              # Technical specifications
├── public/                    # Static assets
│   ├── assets/              # General assets
│   │   ├── images/         # Image files
│   │   ├── icons/         # Icon files
│   │   └── fonts/         # Font files
│   └── locales/            # Internationalization files
└── src/                       # Source code
    ├── components/           # React components
    │   ├── auth/            # Authentication components
    │   ├── common/          # Shared/reusable components
    │   ├── layout/          # Layout components
    │   ├── tickets/         # Ticket management components
    │   ├── kb/             # Knowledge base components
    │   └── ui/             # ShadCN UI components
    ├── contexts/            # React contexts
    ├── hooks/               # Custom React hooks
    │   ├── supabase/       # Supabase-related hooks
    │   └── api/            # API-related hooks
    ├── lib/                # Third-party library configurations
    │   ├── supabase/       # Supabase configuration
    │   └── langchain/      # LangChain configuration (Week 2)
    ├── pages/              # Page components
    │   ├── auth/           # Authentication pages
    │   ├── dashboard/      # Dashboard pages
    │   ├── tickets/        # Ticket management pages
    │   └── kb/            # Knowledge base pages
    ├── services/           # API and business logic services
    ├── stores/             # State management (Zustand)
    │   ├── auth.store.ts   # Authentication state
    │   ├── ticket.store.ts # Ticket management state
    │   └── ui.store.ts     # UI-related state
    ├── styles/             # Global styles and themes
    │   ├── globals.css    # Global styles
    │   └── shadcn/        # ShadCN UI theme
    ├── test/              # Test utilities and setup
    ├── types/             # TypeScript type definitions
    │   ├── api/          # API-related types
    │   │   ├── requests/ # Request types
    │   │   └── responses/# Response types
    │   ├── models/       # Domain model types
    │   ├── store/        # Store-related types
    │   └── common.ts     # Shared utility types
    └── utils/             # Utility functions
        ├── api/          # API utilities
        ├── auth/         # Auth utilities
        ├── format/       # Formatting utilities
        └── validation/   # Validation utilities

## File Naming Conventions

### Components
- Files: PascalCase + `.tsx` (e.g., `UserProfile.tsx`)
- Directories: kebab-case (e.g., `user-profile/`)
- Tests: ComponentName + `.test.tsx` (e.g., `UserProfile.test.tsx`)

### Hooks
- Files: camelCase + `use` prefix + `.ts` (e.g., `useAuth.ts`)
- Tests: HookName + `.test.ts` (e.g., `useAuth.test.ts`)

### Contexts
- Files: PascalCase + `Context.tsx` (e.g., `AuthContext.tsx`)
- Tests: ContextName + `.test.tsx` (e.g., `AuthContext.test.tsx`)

### Types
- Files: PascalCase + `.types.ts` (e.g., `User.types.ts`)
- Interfaces: PascalCase with `I` prefix (e.g., `IUser`)
- Types: PascalCase (e.g., `UserRole`)

### Services
- Files: kebab-case + `.service.ts` (e.g., `auth.service.ts`)
- Tests: ServiceName + `.test.ts` (e.g., `auth.service.test.ts`)

### Stores
- Files: kebab-case + `.store.ts` (e.g., `auth.store.ts`)
- Tests: StoreName + `.test.ts` (e.g., `auth.store.test.ts`)

## Import Conventions

```typescript
// External imports first
import React from 'react'
import { useQuery } from '@tanstack/react-query'

// Absolute imports using @ alias
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// Relative imports last
import { TicketList } from './TicketList'
```

## Component Organization

### Directory Structure
```
components/
└── feature/
    ├── index.ts           # Barrel exports
    ├── Component.tsx      # Main component
    ├── Component.test.tsx # Tests
    └── types.ts          # Component-specific types
```

### File Structure
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Helper functions
// 5. Component definition
// 6. Exports
```

## Testing Structure

### Unit Tests
```
__tests__/unit/
├── components/
├── hooks/
├── services/
└── utils/
```

### Integration Tests
```
__tests__/integration/
├── api/
├── auth/
└── features/
```

### E2E Tests
```
cypress/e2e/
├── auth/
├── tickets/
└── kb/
```

## Documentation Structure

### API Documentation
```
docs/api/
├── endpoints/
├── models/
└── README.md
```

### Technical Specifications
```
docs/specs/
├── auth-system.md
├── ticket-system.md
└── kb-system.md
```