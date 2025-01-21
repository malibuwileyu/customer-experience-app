# UI Rules

## 1. Component Design Principles

### 1.1 Layout
- Use consistent spacing (0.5rem, 1rem, 1.5rem, 2rem)
- Maintain clear visual hierarchy
- Implement responsive design using Tailwind breakpoints
- Use grid and flex layouts for alignment
- Keep components modular and reusable

### 1.2 Typography
- Use system font stack for optimal performance
- Maintain consistent font sizes using Tailwind scale
- Ensure sufficient contrast for readability
- Use appropriate line heights for readability
- Implement proper text hierarchy

### 1.3 Interactive Elements
- Clear hover and focus states
- Consistent click/tap targets (min 44x44px)
- Visual feedback for all interactions
- Keyboard navigation support
- Loading states for async actions

### 1.4 Forms
- Clear input validation
- Inline error messages
- Required field indicators
- Consistent label placement
- Proper input sizing

## 2. Accessibility Guidelines

### 2.1 Core Requirements
- WCAG 2.1 AA compliance
- Proper ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

### 2.2 Implementation
```typescript
// Button example
<button
  className="focus:ring-2 focus:ring-primary-500"
  aria-label="Action description"
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  Content
</button>
```

### 2.3 Color Contrast
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text
- Visible focus indicators
- Non-color dependent information
- High contrast mode support

## 3. Component Architecture

### 3.1 Base Components
```typescript
// Base button component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  isDisabled?: boolean
  children: React.ReactNode
}
```

### 3.2 Composition
- Use composition over inheritance
- Implement compound components when needed
- Keep components focused and single-purpose
- Use proper prop drilling alternatives
- Implement proper type safety

## 4. UI Patterns

### 4.1 Navigation
- Clear current location indicators
- Consistent back navigation
- Breadcrumb for deep navigation
- Mobile-friendly menus
- Proper route transitions

### 4.2 Data Display
- Clear loading states
- Empty states
- Error states
- Pagination/infinite scroll
- Proper data formatting

### 4.3 Feedback
- Toast notifications
- Progress indicators
- Success/error states
- Loading skeletons
- Inline validation

## 5. Mobile Considerations

### 5.1 Touch Targets
- Minimum 44x44px touch targets
- Proper spacing between elements
- Clear tap feedback
- Avoid hover-dependent interactions
- Support for touch gestures

### 5.2 Responsive Design
```typescript
// Responsive component example
<div className="
  p-4
  md:p-6
  lg:p-8
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4
">
  {children}
</div>
```

## 6. Performance

### 6.1 Loading
- Implement lazy loading
- Use proper image optimization
- Implement code splitting
- Optimize component re-renders
- Use proper caching strategies

### 6.2 Animation
- Use CSS transforms over position
- Implement proper transition timing
- Respect reduced motion preferences
- Optimize animation performance
- Use appropriate easing functions

## 7. Error Handling

### 7.1 User Errors
- Clear error messages
- Proper form validation
- Recovery options
- Preserve user input
- Clear next steps

### 7.2 System Errors
- Fallback UI components
- Error boundaries
- Retry mechanisms
- Proper error logging
- User-friendly error messages

## 8. Best Practices

### 8.1 Code Quality
- Consistent component structure
- Proper prop types
- Documented components
- Unit tests for components
- Storybook documentation

### 8.2 Maintainability
- Clear component hierarchy
- Proper file organization
- Consistent naming conventions
- Reusable styles
- Proper documentation

## 9. UI Testing

### 9.1 Component Testing
- Unit tests for logic
- Integration tests for flows
- Visual regression tests
- Accessibility tests
- Performance tests

### 9.2 Test Coverage
```typescript
// Component test example
describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeDefined()
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalled()
  })
}) 