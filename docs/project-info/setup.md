# Project Setup Guide

## Prerequisites
- Node.js (latest LTS version)
- npm (comes with Node.js)
- Git
- AWS account (for Amplify deployment)
- Supabase account

## 1. Initial Project Setup

### 1.1 Create Project
```bash
# Create new Vite project with React and TypeScript
npm create vite@latest customer-experience-app -- --template react-ts
cd customer-experience-app

# Install core dependencies
npm install @supabase/supabase-js @tanstack/react-query @emotion/react @emotion/styled
npm install @mui/material @mui/icons-material @mui/lab
npm install react-router-dom zustand @types/node
npm install -D tailwindcss postcss autoprefixer

# Install testing dependencies
npm install -D @testing-library/react @testing-library/user-event
npm install -D vitest jsdom @vitejs/plugin-react @testing-library/react
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

### 1.2 Configure TypeScript
Create/update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 1.3 Configure Vite
Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "./runtimeConfig": "./runtimeConfig.browser", // For AWS Amplify
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
})
```

### 1.4 Setup Environment Variables
Create `.env`:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 1.5 Update index.html
Add AWS Amplify support:
```html
    </body>
    <!-- Add this script after the body -->
    <script>
      // AWS Amplify needs this to work. See https://github.com/aws/aws-sdk-js/issues/3673
      const isBrowser = () => typeof window !== "undefined";
      const isGlobal = () => typeof global !== "undefined";
      if (!isGlobal() && isBrowser()) {
        var global = window;
      }
    </script>
    </html>
```

## 2. Project Structure Setup

Create the following directory structure:
```
src/
├── components/
│   ├── auth/
│   ├── layout/
│   └── shared/
├── hooks/
├── pages/
├── stores/
├── styles/
├── types/
├── utils/
└── lib/
    └── supabase.ts

docs/
├── specs/
└── api/

__tests__/
├── unit/
├── integration/
└── e2e/

cypress/
└── e2e/

tests/
├── fixtures/
├── mocks/
└── utils/
```

## 3. Supabase Setup

### 3.1 Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Note down project URL and anon key
4. Enable Email Auth in Authentication > Providers
5. Disable "Confirm Email" in Authentication > Providers > Email

### 3.2 Database Setup
Run the following SQL in your Supabase SQL editor:
```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text check (role in ('admin', 'agent', 'customer')) default 'customer',
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create profiles policies
create policy "Public profiles are viewable by everyone"
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (new.id, new.raw_user_meta_data->>'full_name', null, 'customer');
  return new;
end;
$$;

-- Trigger the function on user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger updated_at on profile changes
create trigger on_profile_updated
  before update on profiles
  for each row execute procedure handle_updated_at();
```

### 3.3 Setup Supabase Client
Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

## 4. AWS Amplify Setup

### 4.1 Initialize Amplify
```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Configure Amplify
amplify configure

# Initialize Amplify in project
amplify init
```

### 4.2 Configure Amplify
Create `amplify.yml`:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

## 5. Testing Setup

### 5.1 Test Configuration
Create `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // Vitest specific configuration
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.ts',
      ]
    }
  }
})
```

### 5.2 Test Setup File
Create `src/test/setup.ts`:
```typescript
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Run cleanup after each test case
afterEach(() => {
  cleanup()
})
```

### 5.3 Install Testing Dependencies
```bash
# Install Vitest and testing utilities
npm install -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react jsdom
```

### 5.4 Update Package Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

## 6. Final Steps

### 6.1 Update Package Scripts
Update `package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  }
}
```

### 6.2 Initial Git Setup
```bash
git init
git add .
git commit -m "Initial project setup"
git branch -M main
git remote add origin <your-repository-url>
git push -u origin main
```

### 6.3 Start Development
```bash
npm run dev
```

## 7. Next Steps
After completing the setup:
1. Review the auth system specification in `docs/specs/auth-system.md`
2. Create test specifications for auth components
3. Implement core auth components following the technical specification
4. Set up CI/CD pipeline in AWS Amplify 