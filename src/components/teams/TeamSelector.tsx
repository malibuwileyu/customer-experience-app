/**
 * @fileoverview Team selector component for assigning teams to tickets
 * @module components/teams/TeamSelector
 */

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../common/select"
import { Team } from "../../types/models/team.types"
import { teamService } from "../../services/team.service"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from 'sonner'

export interface TeamSelectorProps {
  value?: string | null
  onChange: (teamId: string | null) => void
  placeholder?: string
  disabled?: boolean
}

export function TeamSelector({ value, onChange, placeholder = 'Select a team...', disabled = false }: TeamSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { } = useAuth()

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const fetchedTeams = await teamService.getTeams()
        setTeams(fetchedTeams)
      } catch (error) {
        console.error('Failed to load teams:', error)
        toast.error('Failed to load teams')
      } finally {
        setIsLoading(false)
      }
    }

    loadTeams()
  }, [])

  const handleValueChange = (val: string) => {
    if (val === 'none') {
      onChange(null)
    } else {
      onChange(val)
    }
  }

  return (
    <Select
      value={value || 'none'}
      onValueChange={handleValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Select a team to assign to</SelectItem>
        {teams.map((team) => (
          <SelectItem key={team.id} value={team.id}>
            {team.name}
          </SelectItem>
        ))}
        {teams.length === 0 && !isLoading && (
          <SelectItem value="no-teams" disabled>
            No teams available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
} 