/**
 * @fileoverview User ticket portal page component
 * @module pages/user-tickets/UserTicketsPage
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/common/button'
import { Card } from '../../components/common/card'
import { useUserTickets } from '../../hooks/tickets/use-user-tickets'
import { TicketItem } from '../../components/tickets/ticket-item'
import { Dialog, DialogContent, DialogTrigger } from '../../components/common/dialog'
import { CreateTicketForm } from '../../components/tickets/create-ticket-form'
import { Plus } from 'lucide-react'

export default function UserTicketsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const { tickets, isLoading, error, totalPages, totalCount } = useUserTickets({
    page: currentPage
  })

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <p className="text-muted-foreground">View and manage your support tickets</p>
        </div>
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

      {error && (
        <div className="text-red-500">
          Error loading tickets: {error.message}
        </div>
      )}

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {tickets.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No tickets found. Create a new ticket to get started.
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Link 
                    key={ticket.id}
                    to={`/app/user-tickets/${ticket.id}`}
                    className="block transition-colors hover:bg-muted/50"
                  >
                    <TicketItem ticket={ticket} />
                  </Link>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, totalCount)} of {totalCount} tickets
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
} 