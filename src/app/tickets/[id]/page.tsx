'use client'

import * as React from 'react'
import { Card } from "../../../components/common/card"
import { TicketDetails } from "../../../components/tickets/ticket-details"

interface TicketPageProps {
  params: {
    id: string
  }
}

export default function TicketPage({ params }: TicketPageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="p-6">
        <TicketDetails ticketId={params.id} />
      </Card>
    </div>
  )
} 