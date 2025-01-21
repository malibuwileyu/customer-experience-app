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
    │   ├── common/          # Common reusable components
    │   ├── layout/          # Layout components
    │   ├── tickets/         # Ticket management components
    │   └── kb/             # Knowledge base components
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
    │   └── shadcn/        # ShadcN UI theme
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
``` 