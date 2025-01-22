/**
 * @fileoverview Application header component with navigation and user menu
 * @module components/layout/Header
 * @description
 * This component provides the main navigation header for the application.
 * It includes the application logo, main navigation links, and user menu.
 * Navigation items are conditionally rendered based on user roles.
 */

import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useUserRoles } from '../../hooks/auth/useUserRoles';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/common/dropdown-menu';
import { Button } from '../../components/common/button';
import { ChevronDown } from 'lucide-react';

/**
 * Header component with responsive navigation and user controls
 * 
 * Features:
 * - Application branding
 * - Role-based navigation links
 * - User menu with logout functionality
 * - Responsive design with mobile support
 * - Sticky positioning with backdrop blur
 * 
 * @component
 * @example
 * ```tsx
 * <Header />
 * ```
 */
export function Header() {
  const { user, signOut } = useAuth();
  const { roles } = useUserRoles(user?.id);

  /**
   * Handles user logout action
   * 
   * @async
   * @function
   * @throws {Error} If logout fails
   */
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Customer Experience</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/app/dashboard" className="transition-colors hover:text-foreground/80">
              Dashboard
            </Link>
            {(roles?.includes('admin') || roles?.includes('agent')) && (
              <Link to="/app/tickets" className="transition-colors hover:text-foreground/80">
                Tickets
              </Link>
            )}
            {roles?.includes('admin') && (
              <Link to="/app/admin/dashboard" className="transition-colors hover:text-foreground/80">
                Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  {user.email}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
} 