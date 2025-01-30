/**
 * @fileoverview Message preview component for OutreachGPT
 * @module components/outreach/message/MessagePreview
 * @description
 * Component for displaying generated AI messages with copy functionality.
 */

import { useState } from 'react'
import { Button } from '../../../components/common/button'
import { Card, CardContent, CardFooter } from '../../../components/common/card'
import { Check, Copy } from 'lucide-react'

interface MessagePreviewProps {
  message: {
    id: string
    content: string
    createdAt: string
  }
}

export const MessagePreview = ({ message }: MessagePreviewProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="prose prose-sm max-w-none">
          {message.content}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Generated at {new Date(message.createdAt).toLocaleTimeString()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="space-x-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
} 
