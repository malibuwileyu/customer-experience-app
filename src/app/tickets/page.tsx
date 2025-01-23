"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/common/button"
import { Plus } from "lucide-react"
import { TicketList } from "./components/ticket-list"
import { TicketFilters } from "./components/ticket-filters"
import { Dialog, DialogContent, DialogTrigger } from "@/components/common/dialog"
import { CreateTicketForm } from "@/components/tickets/create-ticket-form"

export default function TicketsPage() {
  const router = useRouter()

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
        <TicketFilters />
        <TicketList />
      </div>
    </div>
  )
} 