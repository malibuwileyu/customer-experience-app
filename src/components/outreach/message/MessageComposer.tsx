/**
 * @fileoverview Message composer component for OutreachGPT
 * @module components/outreach/message/MessageComposer
 * @description
 * Component for composing and generating AI-powered messages.
 */

import { useState } from 'react'
import { useAIStore } from '../../../stores/ai.store'
import { Button } from '../../../components/common/button'
import { Textarea } from '../../../components/common/textarea'
import { Card, CardContent, CardFooter } from '../../../components/common/card'
import { MessageGenerationService, type MessageContext } from '../../../services/message-generation.service'

// Create a single instance of the service
const messageService = new MessageGenerationService()

export const MessageComposer = () => {
  const [prompt, setPrompt] = useState('')
  const { isGenerating, setGenerating, setGeneratedMessage, setError } = useAIStore()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError(new Error('Please enter a message prompt'))
      return
    }

    try {
      setGenerating(true)
      
      const context: MessageContext = {
        hasValidDbAccess: true,
        ticketId: undefined,
        customerId: undefined,
        previousMessages: [{
          role: 'customer',
          content: prompt,
          timestamp: new Date().toISOString()
        }]
      }
      
      const result = await messageService.generateResponse(prompt, context)

      const message = {
        id: Date.now().toString(),
        content: result.content,
        createdAt: new Date().toISOString()
      }
      
      setGeneratedMessage(message)
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to generate message'))
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Textarea
          placeholder="Enter your message prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[200px] resize-none"
          disabled={isGenerating}
        />
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          onClick={() => setPrompt('')}
          variant="outline"
          disabled={isGenerating || !prompt}
        >
          Clear
        </Button>
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </CardFooter>
    </Card>
  )
} 

