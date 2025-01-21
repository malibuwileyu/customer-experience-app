'use client'

import { CreateTicketForm } from '@/components/tickets/create-ticket-form'

export default function CreateTicketPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Ticket</h1>
      <CreateTicketForm />
    </div>
  )
} 