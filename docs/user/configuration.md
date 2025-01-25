# Configuration Guide

## Overview
This guide details the configuration options and customization capabilities of the Customer Experience Application. It covers environment variables, database settings, authentication options, and feature toggles.

## Environment Configuration

### Development Environment
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5173/api

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_BULK_OPERATIONS=true

# UI Configuration
VITE_MAX_FILE_SIZE=50000000  # 50MB in bytes
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true
```

### Production Environment
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key

# Application Configuration
VITE_APP_URL=https://your-production-domain.com
VITE_API_URL=https://your-production-domain.com/api

# Feature Flags
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_FILE_UPLOAD=true
VITE_ENABLE_BULK_OPERATIONS=true

# UI Configuration
VITE_MAX_FILE_SIZE=50000000  # 50MB in bytes
VITE_DEFAULT_THEME=light
VITE_ENABLE_DARK_MODE=true

# Performance Configuration
VITE_QUERY_CACHE_TIME=300000  # 5 minutes in milliseconds
VITE_MAX_TICKETS_PER_PAGE=50
```

## Database Configuration

### Supabase Settings

#### Authentication
1. Navigate to Authentication > Settings
2. Configure email provider:
   ```json
   {
     "site_url": "your_app_url",
     "enable_signup": true,
     "mailer_autoconfirm": false,
     "jwt_exp": 3600
   }
   ```

#### Storage
1. Navigate to Storage > Buckets
2. Configure ticket-attachments bucket:
   ```json
   {
     "name": "ticket-attachments",
     "public": false,
     "file_size_limit": 52428800,
     "allowed_mime_types": [
       "image/*",
       "application/pdf",
       "application/msword",
       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
       "text/plain",
       "application/zip"
     ]
   }
   ```

#### Database Settings
1. Navigate to Database > Settings
2. Configure connection pool:
   ```json
   {
     "pool_mode": "transaction",
     "pool_size": 20,
     "pool_timeout": 30
   }
   ```

## Feature Configuration

### Real-time Subscriptions
```typescript
// src/config/realtime.ts
export const realtimeConfig = {
  enabled: import.meta.env.VITE_ENABLE_REAL_TIME === 'true',
  channels: {
    tickets: 'tickets-changes',
    teams: 'teams-changes'
  },
  events: ['INSERT', 'UPDATE', 'DELETE']
};
```

### File Upload
```typescript
// src/config/upload.ts
export const uploadConfig = {
  enabled: import.meta.env.VITE_ENABLE_FILE_UPLOAD === 'true',
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '50000000'),
  allowedTypes: [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip'
  ]
};
```

### Bulk Operations
```typescript
// src/config/bulk-operations.ts
export const bulkOperationsConfig = {
  enabled: import.meta.env.VITE_ENABLE_BULK_OPERATIONS === 'true',
  maxBatchSize: 100,
  operations: {
    delete: true,
    status: true,
    priority: true,
    team: true
  }
};
```

## Role-Based Access Control

### Role Configuration
```typescript
// src/config/roles.ts
export const roleConfig = {
  roles: ['super_admin', 'admin', 'team_lead', 'agent', 'customer'],
  defaultRole: 'customer',
  permissions: {
    super_admin: ['*'],
    admin: [
      'view:all',
      'create:*',
      'update:*',
      'delete:*',
      'manage:teams',
      'manage:roles'
    ],
    team_lead: [
      'view:team',
      'create:ticket',
      'update:team',
      'assign:team',
      'manage:team-members'
    ],
    agent: [
      'view:assigned',
      'create:ticket',
      'update:assigned',
      'comment:*'
    ],
    customer: [
      'view:own',
      'create:ticket',
      'comment:own'
    ]
  }
};
```

## UI Customization

### Theme Configuration
```typescript
// src/config/theme.ts
export const themeConfig = {
  defaultTheme: import.meta.env.VITE_DEFAULT_THEME || 'light',
  enableDarkMode: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  colors: {
    primary: {
      light: '#0070f3',
      dark: '#0761d1'
    },
    // ... other color configurations
  }
};
```

## Performance Tuning

### Query Configuration
```typescript
// src/config/query.ts
export const queryConfig = {
  defaultCacheTime: parseInt(
    import.meta.env.VITE_QUERY_CACHE_TIME || '300000'
  ),
  defaultStaleTime: 0,
  defaultRetryCount: 3,
  defaultRetryDelay: 1000
};
```

### Pagination Settings
```typescript
// src/config/pagination.ts
export const paginationConfig = {
  defaultPageSize: parseInt(
    import.meta.env.VITE_MAX_TICKETS_PER_PAGE || '50'
  ),
  maxPageSize: 100,
  pageSizeOptions: [10, 25, 50, 100]
};
```

## Security Configuration

### Authentication Settings
```typescript
// src/config/auth.ts
export const authConfig = {
  redirectUrl: import.meta.env.VITE_APP_URL,
  providers: ['email'],
  session: {
    tokenRefreshMargin: 60 * 5, // 5 minutes
    persistSession: true
  }
};
```

## Monitoring & Logging

### Error Tracking
```typescript
// src/config/error-tracking.ts
export const errorConfig = {
  enabled: process.env.NODE_ENV === 'production',
  sampleRate: 1.0,
  ignoreErrors: [
    'Network request failed',
    'User cancelled'
  ]
};
```

## Next Steps
1. Review [Feature Documentation](./features/README.md) for detailed feature configuration
2. Check [API Documentation](../api/README.md) for API-specific settings
3. See [Deployment Guide](./deployment.md) for production configuration 