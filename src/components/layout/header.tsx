import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            Support Portal
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link 
              to="/tickets"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              All Tickets
            </Link>
            <Link 
              to="/user-tickets"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              My Tickets
            </Link>
          </nav>
        </div>
        
        // ... rest of the header unchanged ...
      </div>
    </header>
  )
} 