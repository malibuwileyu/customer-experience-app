"use client"

import { Button } from "@/components/common/button"
import { Plus } from "lucide-react"
import { TicketList } from "./components/ticket-list"
import { TicketFilters } from "./components/ticket-filters"
import { Dialog, DialogContent, DialogTrigger } from "@/components/common/dialog"
import { CreateTicketForm } from "@/components/tickets/create-ticket-form"
import { useAuth } from "@/contexts/AuthContext"
import { useTickets } from "@/hooks/tickets/use-tickets"

export default function TicketsPage() {
  const { user } = useAuth()
  const isAdminOrAgent = user?.role === 'admin' || user?.role === 'agent'
  const { tickets, totalCount, isLoading, error } = useTickets()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <CreateTicketForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col space-y-8">
        {!isAdminOrAgent && <TicketFilters />}
        <TicketList 
          tickets={tickets} 
          totalCount={totalCount} 
          isLoading={isLoading} 
          error={error} 
        />
      </div>
    </div>
  )
} 