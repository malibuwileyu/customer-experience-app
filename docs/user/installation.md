# Installation Guide

## Overview
This guide walks you through the process of setting up the Customer Experience Application. The application is built with React, TypeScript, and Supabase, providing a modern ticket management system with real-time capabilities.

## Prerequisites

### Required Software
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher) or yarn (v1.22.0 or higher)
- Git (v2.30.0 or higher)

### Development Environment
- A code editor (VS Code recommended)
- Terminal/Command Line access
- Modern web browser (Chrome, Firefox, or Edge recommended)

### Required Accounts
- Supabase account (for database and authentication)
- GitHub account (for version control)

## Installation Steps

### 1. Clone the Repository
```bash
# Clone the repository
git clone https://github.com/yourusername/customer-experience-app.git

# Navigate to project directory
cd customer-experience-app
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Environment Setup

1. Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

2. Configure the following environment variables in `.env.local`:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
VITE_APP_URL=http://localhost:5173
VITE_API_URL=http://localhost:5173/api
```

### 4. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Navigate to Project Settings > API
3. Copy the Project URL and anon/public key
4. Update your `.env.local` with these values
5. Run the database migrations:
```bash
# Using provided script
npm run db:migrate

# Or manually in Supabase dashboard
# Copy contents of supabase/migrations/* and run in SQL editor
```

### 5. Start Development Server
```bash
# Using npm
npm run dev

# Or using yarn
yarn dev
```

The application should now be running at `http://localhost:5173`

## Verification Steps

### 1. Database Connection
1. Open the application in your browser
2. Verify that the login page loads
3. Check browser console for any connection errors

### 2. Authentication
1. Create a new account
2. Verify email verification flow
3. Test login functionality

### 3. Core Features
1. Create a test ticket
2. Verify real-time updates
3. Test file upload functionality

## Common Issues & Solutions

### Database Connection Issues
- **Issue**: "Failed to connect to database"
  - **Solution**: Verify Supabase URL and anon key in `.env.local`
  - **Solution**: Check if Supabase project is active

### Authentication Issues
- **Issue**: "Invalid credentials"
  - **Solution**: Clear browser cache and local storage
  - **Solution**: Verify email confirmation

### Build Issues
- **Issue**: TypeScript compilation errors
  - **Solution**: Run `npm install` to ensure all dependencies are installed
  - **Solution**: Check Node.js version compatibility

## Development Tools

### Recommended VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

### Browser Extensions
- React Developer Tools
- Redux DevTools (if using Redux)

## Next Steps

After installation:
1. Review the [Configuration Guide](./configuration.md) for customization options
2. Check [Feature Documentation](./features/README.md) for available features
3. Join our [GitHub Discussions](https://github.com/yourusername/customer-experience-app/discussions) for community support

## Support

For installation issues:
1. Check our [GitHub Issues](https://github.com/yourusername/customer-experience-app/issues)
2. Review [Common Issues](#common-issues--solutions)
3. Create a new issue if your problem persists 