# Test Organization

## Test Directory Structure

### Unit Tests (`/src/__tests__/components`)
Component and hook unit tests that verify individual pieces of functionality:
- One test file per component/hook
- Tests basic functionality and edge cases
- Uses React Testing Library
- Mocks external dependencies

### Integration Tests (`/src/__tests__/integration`)
Tests that verify multiple components or systems working together:
- `auth.test.ts`: Authentication flow tests
- `role-management.test.ts`: Role system integration tests
- `supabase-auth.test.ts`: Supabase auth integration tests

### Test Setup (`/src/__tests__/setup`)
Test configuration and shared utilities:
- `test-users.ts`: Test user data and factories
- `setup.ts`: Global test setup and configuration

## Testing Standards

### Component Tests
1. Test rendering
2. Test user interactions
3. Test state changes
4. Test error states
5. Test loading states

### Hook Tests
1. Test initialization
2. Test state updates
3. Test side effects
4. Test cleanup
5. Test error handling

### Integration Tests
1. Test complete flows
2. Test API interactions
3. Test state management
4. Test error handling
5. Test edge cases

## Testing Tools

### Core Testing Libraries
- Vitest: Test runner
- React Testing Library: Component testing
- MSW: API mocking
- Testing Library User Event: User interaction simulation

### Test Utilities
- Custom test renderers
- Test data factories
- Mock implementations
- Helper functions

## Best Practices

### Writing Tests
1. Follow AAA pattern (Arrange, Act, Assert)
2. Use descriptive test names
3. Test behavior, not implementation
4. Keep tests focused and atomic
5. Use appropriate matchers

### Test Organization
1. Group related tests
2. Use descriptive describe blocks
3. Keep test files manageable
4. Share setup when appropriate
5. Clean up after tests

### Mocking
1. Mock external dependencies
2. Use MSW for API mocks
3. Keep mocks simple
4. Reset mocks between tests
5. Document mock behavior

## Coverage Requirements

### Coverage Targets
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

### Critical Areas
1. Authentication flows
2. Role management
3. Data mutations
4. Error handling
5. User interactions

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run specific test file
npm test path/to/test
```

### CI/CD Integration
1. Tests run on every PR
2. Coverage reports generated
3. Failed tests block merges
4. Performance metrics tracked
5. Test results archived 