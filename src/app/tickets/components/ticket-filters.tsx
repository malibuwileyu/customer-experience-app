"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/common/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select"
import { Button } from "@/components/common/button"
import { TicketPriority, TicketStatus } from "@/types/tickets"

interface TicketFiltersProps {
  onFilterChange?: (filters: {
    status?: TicketStatus[]
    priority?: TicketPriority[]
    team?: string
    search?: string
  }) => void
}

export function TicketFilters({ onFilterChange }: TicketFiltersProps) {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<TicketStatus[]>([])
  const [priority, setPriority] = useState<TicketPriority[]>([])
  const [team, setTeam] = useState<string>("")

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onFilterChange?.({
      search: value,
      status,
      priority,
      team,
    })
  }

  const handleStatusChange = (value: TicketStatus) => {
    const newStatus = status.includes(value)
      ? status.filter(s => s !== value)
      : [...status, value]
    setStatus(newStatus)
    onFilterChange?.({
      search,
      status: newStatus,
      priority,
      team,
    })
  }

  const handlePriorityChange = (value: TicketPriority) => {
    const newPriority = priority.includes(value)
      ? priority.filter(p => p !== value)
      : [...priority, value]
    setPriority(newPriority)
    onFilterChange?.({
      search,
      status,
      priority: newPriority,
      team,
    })
  }

  const clearFilters = () => {
    setSearch("")
    setStatus([])
    setPriority([])
    setTeam("")
    onFilterChange?.({})
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex flex-1 items-center gap-4">
        <Select
          value={status[0]}
          onValueChange={value => handleStatusChange(value as TicketStatus)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={priority[0]}
          onValueChange={value => handlePriorityChange(value as TicketPriority)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={clearFilters}
          className="whitespace-nowrap"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  )
} 