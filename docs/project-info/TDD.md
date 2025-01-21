# Technical Design Document (TDD)

## 1. Technical Stack Specifications 🛠️

### 1.1 Frontend
- **Framework**: React 18 with TypeScript 5.0+
- **Build Tool**: Vite
- **UI Framework**: 
  - Tailwind CSS
  - ShadCN UI
  - Radix UI
- **State Management**: 
  - Zustand for global state
  - React Query v4 for server state
  - Context API for auth state
- **Form Handling**: React Hook Form
- **Testing**: 
  - Vitest + React Testing Library
  - Cypress for E2E

### 1.2 Backend (Supabase)
- **Database**: PostgreSQL 15
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Functions**: Edge Functions
- **Real-time**: Supabase Realtime
- **Security**: Row Level Security (RLS)

### 1.3 AI/ML (Week 2)
- **Framework**: LangChain.js
- **Models**: OpenAI GPT-4
- **Embeddings**: OpenAI Ada
- **Vector Store**: pgvector
- **Search**: Elasticsearch

### 1.4 Infrastructure
- **Platform**: AWS Amplify
- **CI/CD**: GitHub Actions
- **Monitoring**: 
  - AWS CloudWatch
  - Sentry for error tracking
- **Analytics**: PostHog

## 2. Database Schema 💾

### 2.1 Core Tables

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role NOT NULL,
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TYPE user_role AS ENUM ('admin', 'agent', 'team_lead', 'customer');
```

#### tickets
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject TEXT NOT NULL,
  description TEXT,
  status ticket_status NOT NULL DEFAULT 'new',
  priority priority_level NOT NULL DEFAULT 'medium',
  assignee_id UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),
  customer_id UUID REFERENCES users(id) NOT NULL,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb
);

CREATE TYPE ticket_status AS ENUM ('new', 'open', 'pending', 'on_hold', 'solved', 'closed');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
```

#### articles
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES users(id) NOT NULL,
  status article_status NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', title), 'A') ||
    setweight(to_tsvector('english', content), 'B')
  ) STORED
);

CREATE TYPE article_status AS ENUM ('draft', 'review', 'published', 'archived');
```

### 2.2 Supporting Tables

#### teams
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

#### categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

#### comments
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  ticket_id UUID REFERENCES tickets(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### 2.3 AI-Related Tables (Week 2)

#### embeddings
```sql
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(content_type, content_id)
);
```

## 3. API Specifications 📡

### 3.1 Supabase RLS Policies

#### Tickets Table
```sql
-- Read access
CREATE POLICY "Users can view assigned tickets"
ON tickets FOR SELECT
USING (
  auth.uid() = assignee_id OR
  auth.uid() = customer_id OR
  auth.uid() IN (
    SELECT user_id FROM user_teams ut
    JOIN teams t ON ut.team_id = t.id
    WHERE role IN ('admin', 'team_lead')
  )
);

-- Write access
CREATE POLICY "Agents can create tickets"
ON tickets FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM users
    WHERE role IN ('agent', 'admin', 'team_lead')
  )
);
```

### 3.2 Edge Functions

#### Ticket Classification
```typescript
// /functions/classify-ticket/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { OpenAI } from 'langchain/llms/openai'
import { PromptTemplate } from 'langchain/prompts'

serve(async (req) => {
  const { ticket } = await req.json()
  const llm = new OpenAI({ temperature: 0 })
  
  const prompt = PromptTemplate.fromTemplate(`
    Classify the following support ticket:
    Subject: {subject}
    Description: {description}
    
    Provide:
    1. Category (Technical/Billing/Account/Feature/Bug)
    2. Priority (Low/Medium/High/Urgent)
    3. Suggested team assignment
    
    Output as JSON:
  `)
  
  const result = await llm.generatePrompt(prompt, {
    subject: ticket.subject,
    description: ticket.description
  })
  
  return new Response(
    JSON.stringify(result),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

### 3.3 Real-time Subscriptions

```typescript
// Frontend subscription setup
const ticketSubscription = supabase
  .from('tickets')
  .on('*', (payload) => {
    if (payload.new.assignee_id === currentUser.id) {
      queryClient.invalidateQueries(['tickets'])
      notifyTicketUpdate(payload.new)
    }
  })
  .subscribe()
```

## 4. Frontend Architecture 🎨

### 4.1 Project Structure
```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── tickets/       # Ticket management
│   ├── kb/           # Knowledge base
│   ├── chat/         # Chat interface
│   └── common/       # Shared components
├── hooks/
│   ├── auth/         # Auth hooks
│   ├── tickets/      # Ticket hooks
│   └── kb/          # Knowledge base hooks
├── stores/
│   ├── auth.ts       # Auth store
│   ├── tickets.ts    # Ticket store
│   └── ui.ts        # UI state store
├── lib/
│   ├── supabase.ts   # Supabase client
│   └── api.ts       # API utilities
└── utils/
    ├── format.ts     # Formatting utilities
    └── validation.ts # Validation utilities
```

### 4.2 Key Components

```typescript
// /components/tickets/TicketDetail.tsx
interface TicketDetailProps {
  ticketId: string;
}

export function TicketDetail({ ticketId }: TicketDetailProps) {
  const { data: ticket, isLoading } = useTicket(ticketId)
  const { mutate: updateTicket } = useUpdateTicket()
  const { user } = useAuth()
  
  if (isLoading) return <LoadingSpinner />
  
  const canEdit = user.role !== 'customer' && 
    (user.id === ticket.assignee_id || user.role === 'admin')
  
  return (
    <Card>
      <CardHeader
        title={ticket.subject}
        subheader={<TicketMetadata ticket={ticket} />}
      />
      <CardContent>
        <TicketDescription ticket={ticket} />
        {canEdit && (
          <TicketActions ticket={ticket} onUpdate={updateTicket} />
        )}
        <TicketComments ticketId={ticketId} />
      </CardContent>
    </Card>
  )
}
```

## 5. Testing Strategy 🧪

### 5.1 Unit Tests
```typescript
// __tests__/components/auth/LoginPage.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LoginPage } from '@/components/auth/LoginPage'

describe('LoginPage', () => {
  it('handles login submission', async () => {
    const mockLogin = vi.fn()
    vi.mock('@/contexts/AuthContext', () => ({
      useAuth: () => ({ login: mockLogin })
    }))

    render(<LoginPage />)
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    })
  })

  it('shows validation errors', async () => {
    render(<LoginPage />)
    
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    expect(screen.getByText(/email is required/i)).toBeDefined()
    expect(screen.getByText(/password is required/i)).toBeDefined()
  })
})
```

### 5.2 Integration Tests
```typescript
// __tests__/integration/auth-flow.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoginPage } from '@/pages/auth/LoginPage'

describe('Authentication Flow', () => {
  it('redirects after successful login', async () => {
    const mockNavigate = vi.fn()
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate
    }))

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    )

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com')
    await userEvent.type(screen.getByLabelText(/password/i), 'password123')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
  })
})
```

## 6. Performance Benchmarks 📊

### 6.1 Frontend Metrics
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- Bundle Size: < 500KB (initial load)

### 6.2 API Performance
- API Response Time: < 200ms
- Real-time Event Latency: < 100ms
- Database Query Time: < 100ms
- Authentication Time: < 500ms

### 6.3 AI Operations (Week 2)
- Classification Time: < 1s
- Vector Search Time: < 500ms
- Embedding Generation: < 2s
- Response Generation: < 3s

## 7. Security Implementation 🔒

### 7.1 Authentication
- JWT-based auth with Supabase
- Refresh token rotation
- Session management
- MFA support
- OAuth providers

### 7.2 Authorization
- Role-based access control
- Row Level Security
- Resource-level permissions
- Team-based access

### 7.3 Data Protection
- HTTPS everywhere
- Input sanitization
- XSS prevention
- CSRF protection
- Rate limiting

---
*Last Updated: 2024-01-20*
*Version: 1.1*
*Owner: Engineering Team* 