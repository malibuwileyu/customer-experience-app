/**
 * @fileoverview Reusable role selector component for team management
 * @module components/teams/TeamRoleSelector
 */

import { useAuth } from "../../hooks/auth/use-auth"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/common/select"
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/common/form"

interface TeamRoleSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  name?: string
  label?: string
  disabled?: boolean
  showFormField?: boolean
  error?: string
}

export function TeamRoleSelector({
  value,
  onValueChange,
  name,
  label = "Role",
  disabled = false,
  showFormField = true,
  error
}: TeamRoleSelectorProps) {
  const { user } = useAuth()
  
  // Determine available roles based on user's role
  const availableRoles = (() => {
    if (!user?.role) return ["agent"]
    
    switch (user.role) {
      case "admin":
      case "super_admin":
        return ["admin", "team_lead", "agent"]
      case "team_lead":
        return ["agent"]
      default:
        return ["agent"]
    }
  })()

  const SelectComponent = (
    <Select
      name={name}
      onValueChange={onValueChange}
      value={value}
      disabled={disabled}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  if (!showFormField) {
    return SelectComponent
  }

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      {SelectComponent}
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  )
} 