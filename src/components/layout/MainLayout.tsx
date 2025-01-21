/**
 * @fileoverview Main layout component that provides the application shell
 * @module components/layout/MainLayout
 * @description
 * This component serves as the main layout wrapper for the application.
 * It provides a consistent structure with header, footer, and main content area.
 */

import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

/**
 * Props interface for the MainLayout component
 * 
 * @interface
 * @property {React.ReactNode} [children] - Optional child content to render instead of router outlet
 */
interface MainLayoutProps {
  children?: React.ReactNode;
}

/**
 * Main layout component that wraps the application content
 * 
 * @component
 * @param {MainLayoutProps} props - Component props
 * @returns {JSX.Element} Layout structure with header, content area, and footer
 * 
 * @example
 * ```tsx
 * // With router outlet
 * <MainLayout />
 * 
 * // With explicit children
 * <MainLayout>
 *   <CustomContent />
 * </MainLayout>
 * ```
 */
export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">
          {children || <Outlet />}
        </div>
        <Footer />
      </div>
    </div>
  );
} 