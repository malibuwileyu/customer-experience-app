'use client'

import { Card } from "../../../components/common/card"
import { TicketDetails } from "../../../components/tickets/ticket-details"

interface TicketPageProps {
  params: {
    id: string
  }
}

export default function TicketPage({ params }: TicketPageProps) {
  return (
    <Card>
      <TicketDetails ticketId={params.id} />
    </Card>
  )
} 