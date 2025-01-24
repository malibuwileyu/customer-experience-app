"use client"

import { useRouter } from "next/navigation"
import { TicketCard } from "./ticket-card"
import { Skeleton } from "@/components/common/skeleton"
import { useAllTickets } from "@/hooks/tickets/use-all-tickets"
import { useTickets } from "@/hooks/tickets/use-tickets"
import { useAuth } from "@/contexts/AuthContext"

export function TicketList() {
  const router = useRouter()
  const { user } = useAuth()
  console.log('Auth user data:', user)
  
  const isAdminOrAgent = user?.role === 'admin' || user?.role === 'agent'
  console.log('Role check in TicketList:', { 
    userRole: user?.role,
    isAdminOrAgent,
    usingHook: isAdminOrAgent ? 'useAllTickets' : 'useTickets'
  })

  // Only fetch the appropriate tickets based on user role
  const {
    tickets,
    isLoading,
  } = isAdminOrAgent 
    ? useAllTickets()
    : useTickets({ filters: {} })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!tickets?.length) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">No tickets found</h3>
          <p className="text-sm text-muted-foreground">
            {isAdminOrAgent 
              ? "No tickets in the system yet"
              : "Try adjusting your filters or create a new ticket"
            }
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.map(ticket => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onClick={() => router.push(`/app/tickets/${ticket.id}`)}
        />
      ))}
    </div>
  )
} 