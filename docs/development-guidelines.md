# Development Guidelines

## Database and Query Rules

1. **Code Modification Rules**
   - NEVER modify existing working code or methods
   - Only add new methods when necessary
   - Keep all database queries simple and direct

2. **Query Guidelines**
   - Use basic table operations only: `select`, `insert`, `update`, `delete`
   - Avoid complex joins or foreign key relationships
   - Keep queries focused on single tables where possible
   - Use simple filters with `eq`, `neq`, `gt`, `lt`
   - Order results using basic `order` clauses

3. **Response Handling**
   - Return direct table data where possible
   - Map responses to match types when necessary
   - Handle errors gracefully without complex logic
   - Use early returns for error cases

4. **Data Access Patterns**
   - Fetch data directly from primary tables
   - Use separate queries for related data if needed
   - Avoid nested selections and complex relationships
   - Keep data transformations simple and clear 