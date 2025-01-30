"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/common'
import { Alert, AlertDescription } from '../../../components/common/alert'
import { AlertCircle } from 'lucide-react'
import type { Ticket } from '../../../types/models/ticket.types'

interface TicketListProps {
  tickets: Ticket[]
  totalCount: number
  isLoading: boolean
  error: Error | null
}

export function TicketList({ tickets, totalCount, isLoading, error }: TicketListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div>Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error.message || 'Failed to load tickets'}
        </AlertDescription>
      </Alert>
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tickets ({totalCount})</h2>
      </div>
      <div className="grid gap-4">
        {tickets.map(ticket => (
          <Card key={ticket.id}>
            <CardHeader>
              <CardTitle>{ticket.title}</CardTitle>
              <CardDescription>
                Created on {new Date(ticket.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 