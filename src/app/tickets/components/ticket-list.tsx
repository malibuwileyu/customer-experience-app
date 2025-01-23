"use client"

import { useRouter } from "next/navigation"
import { TicketCard } from "./ticket-card"
import { Ticket } from "../../../types/models/ticket.types"
import { Skeleton } from "@/components/common/skeleton"

interface TicketListProps {
  tickets?: Ticket[]
  isLoading?: boolean
}

export function TicketList({ tickets = [], isLoading = false }: TicketListProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!tickets.length) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <h3 className="text-lg font-medium">No tickets found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or create a new ticket
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