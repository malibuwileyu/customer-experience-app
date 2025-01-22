## Future Optimizations (Non-MVP)
- [ ] Implement page caching to improve loading performance between route transitions
  - Consider using React Query's caching capabilities
  - Investigate React Suspense for loading states
  - Research keeping pages in memory temporarily 
- [ ] Implement form reset functionality in CreateTicketForm
  - Add reset button handler
  - Test form field clearing
  - Ensure proper state reset for all form fields including select components 

## Test Fixes Needed
- [ ] Fix CreateTicketForm validation test
  - Properly wait for and verify error messages after form submission
  - Ensure error messages match Zod schema validation rules
  - Add test coverage for all required fields
- [ ] Fix CreateTicketForm submission test
  - Handle form submission properly with async validation
  - Verify mutation is called with correct data
  - Add test coverage for different form states during submission 