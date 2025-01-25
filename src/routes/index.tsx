import { createBrowserRouter } from "react-router-dom"
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage"
import { RoleManagementPage } from "@/pages/admin/RoleManagementPage"
import { TeamList } from "@/components/teams/TeamList"
import { CreateTeamPage } from "@/pages/teams/CreateTeamPage"

export const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminDashboardPage />,
  },
  {
    path: "/admin/roles",
    element: <RoleManagementPage />,
  },
  {
    path: "/teams",
    element: <TeamList />,
  },
  {
    path: "/teams/new",
    element: <CreateTeamPage />,
  },
])

export default router 