/**
 * @fileoverview Teams page component
 * @module app/teams/page
 */

import { TeamList } from "@/components/teams/TeamList"

export const metadata = {
  title: "Teams",
  description: "Manage your teams and team members.",
}

export default function TeamsPage() {
  return (
    <div className="container py-8">
      <TeamList />
    </div>
  )
} 