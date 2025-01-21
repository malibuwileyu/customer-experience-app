/**
 * @fileoverview Application footer component with links and copyright
 * @module components/layout/Footer
 * @description
 * This component provides the footer section of the application.
 * It includes copyright information, tagline, and important links
 * with a responsive layout for different screen sizes.
 */


/**
 * Footer component with responsive layout and navigation links
 * 
 * Features:
 * - Responsive design (mobile-first)
 * - Secondary navigation links
 * - Copyright/tagline text
 * - Flexible layout with centered/row arrangements
 * 
 * @component
 * @example
 * ```tsx
 * <Footer />
 * ```
 */
export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ for amazing customer experiences
          </p>
        </div>
        <div className="flex items-center space-x-1">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <a href="#" className="transition-colors hover:text-foreground/80">
              About
            </a>
            <a href="#" className="transition-colors hover:text-foreground/80">
              Contact
            </a>
            <a href="#" className="transition-colors hover:text-foreground/80">
              Privacy
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
} 