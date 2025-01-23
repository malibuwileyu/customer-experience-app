/**
 * @fileoverview User ticket details page component
 * @module pages/user-tickets/[id]
 */

import { useParams, useNavigate } from 'react-router-dom'
import { Card } from '../../components/common/card'
import { TicketDetails } from '../../components/tickets/ticket-details'
import { Button } from '../../components/common/button'
import { ChevronLeft } from 'lucide-react'

export function UserTicketDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  console.log('UserTicketDetails rendered with id:', id)

  if (!id) {
    console.error('UserTicketDetails: No ID provided')
    return null
  }

  const handleBack = () => {
    navigate('/user-tickets')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to My Tickets
        </Button>
      </div>
      <Card className="p-6">
        <TicketDetails ticketId={id} isUserTicket={true} />
      </Card>
    </div>
  )
}

export default UserTicketDetails 