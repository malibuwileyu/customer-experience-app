/**
 * @fileoverview Teams layout component
 * @module app/teams/layout
 */

import { Metadata } from "next"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: {
    default: "Teams",
    template: "%s | Teams",
  },
  description: "Manage your teams and team members.",
}

interface TeamsLayoutProps {
  children: React.ReactNode
}

export default function TeamsLayout({ children }: TeamsLayoutProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
} 