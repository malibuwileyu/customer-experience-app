/**
 * @fileoverview Feedback panel component for OutreachGPT
 * @module components/outreach/feedback/FeedbackPanel
 * @description
 * Component for collecting user feedback on generated messages.
 */

import { useState } from 'react'
import { Button } from '../../../components/common/button'
import { Card, CardContent, CardFooter } from '../../../components/common/card'
import { ThumbsUp, ThumbsDown } from 'lucide-react'

interface FeedbackPanelProps {
  messageId: string
}

export const FeedbackPanel = ({ messageId }: FeedbackPanelProps) => {
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleFeedback = async (type: 'positive' | 'negative') => {
    if (submitted) return

    setFeedback(type)
    setSubmitted(true)

    // TODO: Implement feedback submission to backend
    console.log('Feedback submitted:', { messageId, type })
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Thanks for your feedback!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-center text-muted-foreground">
          Was this message helpful?
        </p>
      </CardContent>
      <CardFooter className="flex justify-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback('positive')}
          className={feedback === 'positive' ? 'bg-primary text-primary-foreground' : ''}
        >
          <ThumbsUp className="h-4 w-4 mr-2" />
          Yes
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleFeedback('negative')}
          className={feedback === 'negative' ? 'bg-primary text-primary-foreground' : ''}
        >
          <ThumbsDown className="h-4 w-4 mr-2" />
          No
        </Button>
      </CardFooter>
    </Card>
  )
} 

