# Customer Experience App

A modern customer experience platform built with React, TypeScript, and Supabase.

## Features

- 🔐 Secure authentication with Supabase Auth
- 👥 Role-based access control (Admin, Agent, Customer)
- 🎯 Real-time updates
- 📱 Responsive design
- 🧪 Comprehensive test coverage

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** TailwindCSS + Material-UI
- **State Management:** Zustand + React Query
- **Backend:** Supabase (Auth + Database)
- **Testing:** Vitest + React Testing Library + Cypress
- **Deployment:** AWS Amplify

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/customer-experience-app.git
   cd customer-experience-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
   Then update `.env` with your Supabase project credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

For detailed setup instructions, see [docs/setup.md](docs/setup.md).

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run linter
- `npm run format` - Format code

## Documentation

- [Setup Guide](docs/setup.md)
- [Technical Specifications](docs/specs/)
- [API Documentation](docs/api/)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
