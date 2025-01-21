## 3. Import Rules

### 3.1 Import Order
```typescript
// 1. External imports
import React from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Internal imports (using relative paths)
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

// 3. Local imports (same directory or direct parent/child)
import { TicketList } from './TicketList'
import { TicketItem } from './components/TicketItem'
```

### 3.2 Path Rules
- Use relative imports for all internal project files
- Keep imports as shallow as possible (prefer `./` and `../` over deeper paths)
- Group imports by their relative depth
- NEVER use path aliases like `@/*`
- Document deep imports (more than two levels) with a comment explaining the dependency 