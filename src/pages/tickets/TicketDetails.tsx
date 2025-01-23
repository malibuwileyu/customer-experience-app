import { useParams } from 'react-router-dom'
import { Card } from '../../components/common/card'
import { TicketDetails as TicketDetailsComponent } from '../../components/tickets/ticket-details'

export function TicketDetails() {
  const { id } = useParams<{ id: string }>()

  if (!id) {
    return null
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card className="p-6">
        <TicketDetailsComponent ticketId={id} />
      </Card>
    </div>
  )
} 