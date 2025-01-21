import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

interface MainLayoutProps {
  children?: React.ReactNode;
}

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