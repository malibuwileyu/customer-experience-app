# Documentation Index

## Project Documentation

### Core Documentation
- [Product Requirements Document (PRD.md)](./PRD.md)
  - Product vision and requirements
  - User stories and features
  - Business requirements
  - Success metrics

- [Software Design Document (SDD.md)](./SDD.md)
  - System architecture
  - Technical decisions
  - Component design
  - Data models

- [Test-Driven Development Guide (TDD.md)](./TDD.md)
  - Testing methodology
  - Test organization
  - Coverage requirements
  - Testing best practices

### Setup & Development
- [Setup Guide (setup.md)](./setup.md)
  - Project prerequisites
  - Initial setup steps
  - Environment configuration
  - Development tools setup

- [Project Structure (project-structure.md)](./project-structure.md)
  - Directory organization
  - File naming conventions
  - Component organization
  - Testing structure

- [Codebase Organization Rules (codebase-organization-rules.md)](./codebase-organization-rules.md)
  - Directory structure rules
  - Naming conventions
  - Import rules
  - Component structure
  - State management
  - Testing organization
  - Documentation standards
  - Asset organization
  - Configuration management

- [Progress Tracking (steps.md)](./steps.md)
  - Completed tasks
  - Next steps
  - Development timeline
  - Implementation checklist

### Technical Specifications
- [Authentication System (specs/auth-system.md)](./specs/auth-system.md)
  - Authentication flows
  - Profile management
  - Role-based access control
  - Security considerations

### Database
- [Database Schema (schema.sql)](./schema.sql)
  - Table definitions
  - Relationships
  - Triggers
  - Security policies

## Development Guidelines

### Document-Driven Development (DDD)
1. Documentation Requirements
   - Technical specifications
   - Interface definitions
   - API documentation
   - Database documentation
   - Test documentation
   - Architecture documentation

2. Documentation Location
   - Technical specs in `/docs/specs/<feature-name>.md`
   - API docs in `/docs/api/<endpoint-name>.md`
   - Component docs as TSDoc comments
   - Test specifications in `__tests__/*.spec.md`

### Test-Driven Development (TDD)
1. Test Organization
   - Unit tests alongside source files
   - Integration tests in `__tests__/integration/`
   - E2E tests in `cypress/e2e/`
   - Test utilities in `__tests__/utils/`

2. Testing Requirements
   - Unit tests for business logic
   - Integration tests for API endpoints
   - Component tests for UI elements
   - E2E tests for critical flows
   - Minimum 80% coverage

### Implementation Workflow
1. Documentation Phase
   - Create technical specification
   - Define interfaces and types
   - Document test cases
   - Review documentation

2. Test Creation Phase
   - Write unit test cases
   - Create integration tests
   - Setup E2E scenarios
   - Verify test failures

3. Implementation Phase
   - Implement feature code
   - Make tests pass
   - Refactor if needed
   - Document changes

4. Review Phase
   - Code review
   - Documentation review
   - Test coverage verification
   - Performance testing

### Code Style & Structure
1. TypeScript Guidelines
   - Use functional programming patterns
   - Avoid classes, prefer functions
   - Use descriptive variable names
   - Implement proper typing

2. React Guidelines
   - Use functional components
   - Implement hooks properly
   - Follow React best practices
   - Use proper prop typing

3. Testing Guidelines
   - Write descriptive test names
   - Follow AAA pattern
   - Mock external dependencies
   - Test edge cases

### Quality Gates
1. Documentation Requirements
   - All interfaces documented
   - API endpoints specified
   - Database changes documented
   - Test cases defined
   - Architecture impacts assessed

2. Testing Requirements
   - Tests written before implementation
   - Coverage meets threshold
   - All test types implemented
   - Performance verified

3. Implementation Requirements
   - Follows style guide
   - Passes all tests
   - No regression issues
   - Meets performance criteria

### Naming Conventions
1. Database
   - Tables: Plural, snake_case (e.g., `user_profiles`)
   - Columns: Singular, snake_case (e.g., `first_name`)
   - Foreign keys: `<table_name>_id`
   - Indexes: `idx_<table>_<column(s)>`

2. Backend (Express, Node/TS)
   - Controllers: kebab-case + `-controller.ts`
   - Services: kebab-case + `-service.ts`
   - Routes: kebab-case + `-routes.ts`
   - Types: PascalCase
   - Interfaces: PascalCase with `I` prefix

3. Frontend (React/TypeScript)
   - Components: PascalCase + `.tsx`
   - Hooks: camelCase + `use` prefix
   - Stores: kebab-case + `.store.ts`
   - Types: PascalCase + `.types.ts`
   - Services: kebab-case + `.service.ts`

### Git Workflow
1. Commit Process
   - Check status with `git status`
   - Stage specific files
   - Use conventional commit format
   - Include feature IDs
   - Verify before push

2. Commit Types
   - `feat`: new feature
   - `fix`: bug fix
   - `docs`: documentation
   - `style`: formatting
   - `refactor`: code restructure
   - `test`: testing changes
   - `chore`: maintenance

### Environment & Configuration
1. Environment Variables
   - Group by functionality
   - Never commit secrets
   - Maintain `.env.example`
   - Document dependencies

2. Configuration Files
   - Avoid modifying dependent configs
   - Document changes
   - Follow existing patterns
   - Version control safely

## API Documentation
- [API Documentation Index](./api/README.md)
  - API endpoints
  - Request/response schemas
  - Authentication
  - Rate limiting 