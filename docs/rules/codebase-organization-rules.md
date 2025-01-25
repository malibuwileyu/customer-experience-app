# Codebase Organization Rules

## 1. Directory Structure

### 1.1 Root Level Organization
```
customer-experience-app/
├── .github/            # GitHub workflows and templates
├── __tests__/          # Test files and utilities
├── cypress/            # E2E test files
├── docs/              # Project documentation
├── public/            # Static assets
└── src/               # Source code
```

### 1.2 Source Code Organization (`src/`)
```
src/
├── components/        # React components
│   ├── auth/         # Authentication components
│   ├── common/       # Shared/reusable components
│   ├── layout/       # Layout components
│   ├── tickets/      # Ticket management components
│   └── kb/          # Knowledge base components
├── contexts/         # React contexts
├── hooks/            # Custom React hooks
│   ├── supabase/    # Supabase-related hooks
│   └── api/         # API-related hooks
├── lib/             # Third-party library configurations
│   └── langchain/   # LangChain configuration
├── pages/           # Page components
│   └── auth/        # Authentication pages
├── services/        # API and business logic services
├── stores/          # State management (Zustand)
├── styles/          # Global styles and themes
├── test/            # Test utilities and setup
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

### 1.3 Test Organization
```
__tests__/
├── unit/            # Unit tests
├── integration/     # Integration tests
└── e2e/            # End-to-end tests

cypress/
└── e2e/            # Cypress end-to-end tests
```

## 2. Naming Conventions

### 2.1 Files and Directories
- Directories: kebab-case (e.g., `user-profile/`, `chat-messages/`)
- React Components: PascalCase + `.tsx` (e.g., `UserProfile.tsx`)
- Hooks: camelCase + `use` prefix + `.ts` (e.g., `useAuth.ts`)
- Contexts: PascalCase + `Context.tsx` (e.g., `AuthContext.tsx`)
- Types: PascalCase + `.types.ts` (e.g., `User.types.ts`)
- Tests: Same name as tested file + `.test.ts(x)` or `.spec.ts(x)`

### 2.2 Component Organization
- One component per file
- Component and its styles in same directory
- Index file for exporting multiple components
- Separate directories for feature-specific components

### 2.3 Type Organization
```
types/
├── api/             # API-related types
│   ├── requests/    # Request types
│   └── responses/   # Response types
├── models/          # Domain model types
├── store/           # Store-related types
└── common.ts        # Shared utility types
```

## 3. Import Rules

### 3.1 Import Order
```typescript
// 1. External imports
import React from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal imports from src/ (using relative paths)
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// 3. Local imports (same directory)
import { TicketList } from './TicketList'
```

### 3.2 Path Rules
- Use relative paths (`../../`) for imports from `src/` directory
- Use `./` for imports from the same directory
- Keep imports organized by type (external, internal, local)
- Avoid mixing relative and absolute paths

## 4. Component Structure

### 4.1 File Organization
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Helper functions
// 5. Component definition
// 6. Exports
```

### 4.2 Component Rules
- Use functional components
- Props interface above component
- Early returns for loading/error states
- Consistent JSX formatting
- Extract complex logic to hooks

## 5. State Management

### 5.1 Zustand Store Organization
```
stores/
├── auth.store.ts    # Authentication state
├── ticket.store.ts  # Ticket management state
└── ui.store.ts      # UI-related state
```

### 5.2 Store Rules
- One store per feature domain
- Define initial state constant
- Include standard actions
- Handle loading/error states
- Clean up on unmount

## 6. Testing Organization

### 6.1 Test File Location
- Unit tests: Next to source files
- Integration tests: `__tests__/integration/`
- E2E tests: `cypress/e2e/`
- Test utilities: `__tests__/utils/`

### 6.2 Test Naming
- Test files: `*.test.ts(x)` or `*.spec.ts(x)`
- Test suites: Describe component/function
- Test cases: Describe expected behavior

## 7. Documentation Organization

### 7.1 Code Documentation
- TSDoc comments for components and functions
- Inline comments for complex logic
- Type definitions for all exports
- README files in major directories

### 7.2 Project Documentation
```
docs/
├── api/             # API documentation
├── specs/           # Technical specifications
└── README.md        # Project overview
```

## 8. Asset Organization

### 8.1 Static Assets
```
public/
├── assets/          # General assets
│   ├── images/      # Image files
│   ├── icons/       # Icon files
│   └── fonts/       # Font files
└── locales/         # Internationalization files
```

### 8.2 Style Assets
```
styles/
├── theme/          # Theme configuration
├── components/     # Component-specific styles
└── globals.css    # Global styles
```

## 9. Configuration Files

### 9.1 Root Level Config
- `vite.config.ts`: Vite configuration
- `tsconfig.json`: TypeScript configuration
- `.env.*`: Environment variables
- `.eslintrc.js`: ESLint configuration
- `.prettierrc`: Prettier configuration

### 9.2 Environment Files
- `.env.development`: Development variables
- `.env.production`: Production variables
- `.env.test`: Test variables
- `.env.local`: Local overrides (gitignored)

## 10. Version Control

### 10.1 Git Organization
- Feature branches from `dev`
- Release branches from `main`
- Hotfix branches from `main`
- Protected `main` and `dev` branches

### 10.2 Git Ignore Rules
- Ignore build artifacts
- Ignore dependency directories
- Ignore environment files
- Ignore IDE/editor files

## 11. Dependency Management

### 11.1 Package Organization
- Core dependencies in `dependencies`
- Development tools in `devDependencies`
- Peer dependencies declared
- Version constraints specified

### 11.2 Package Rules
- Lock file committed
- Consistent package manager
- Avoid duplicate dependencies
- Regular dependency updates 