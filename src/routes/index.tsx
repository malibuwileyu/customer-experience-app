import { createBrowserRouter, Navigate } from "react-router-dom"
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage"
import { RoleManagementPage } from "@/pages/admin/RoleManagementPage"
import { TeamList } from "@/components/teams/TeamList"
import { CreateTeamPage } from "@/pages/teams/CreateTeamPage"
import { OutreachPage } from "@/pages/outreach/OutreachPage"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { DashboardLayout } from "@/components/layout/DashboardLayout"

// Define allowed roles for features based on database roles
const FEATURE_ROLES = {
  outreach: ['admin', 'support_agent', 'team_lead', 'support_manager'],
  teams: ['admin', 'team_lead'],
  roles: ['admin'],
} as const

// Helper to convert readonly arrays to mutable
const toMutable = <T extends readonly any[]>(arr: T): Array<T[number]> => [...arr]

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/app/dashboard" replace />
  },
  {
    path: "/app",
    element: <DashboardLayout />,
    children: [
      {
        path: "outreach",
        element: (
          <ProtectedRoute allowedRoles={toMutable(FEATURE_ROLES.outreach)}>
            <OutreachPage />
          </ProtectedRoute>
        )
      },
      {
        path: "teams",
        element: (
          <ProtectedRoute allowedRoles={toMutable(FEATURE_ROLES.teams)}>
            <TeamList />
          </ProtectedRoute>
        )
      },
      {
        path: "teams/create",
        element: (
          <ProtectedRoute allowedRoles={toMutable(FEATURE_ROLES.teams)}>
            <CreateTeamPage />
          </ProtectedRoute>
        )
      },
      {
        path: "admin/roles",
        element: (
          <ProtectedRoute allowedRoles={toMutable(FEATURE_ROLES.roles)}>
            <RoleManagementPage />
          </ProtectedRoute>
        )
      },
      {
        path: "admin/dashboard",
        element: (
          <ProtectedRoute allowedRoles={toMutable(FEATURE_ROLES.roles)}>
            <AdminDashboardPage />
          </ProtectedRoute>
        )
      }
    ]
  }
])

export default router 