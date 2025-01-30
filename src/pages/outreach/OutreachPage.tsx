/**
 * @fileoverview OutreachGPT main page component
 * @module pages/outreach
 * @description
 * Main page for the OutreachGPT feature, providing AI-powered message generation
 * and template management capabilities.
 */

import { useAIStore } from '../../stores/ai.store'
import { MessageComposer } from '../../components/outreach/message/MessageComposer'
import { MessagePreview } from '../../components/outreach/message/MessagePreview'
import { FeedbackPanel } from '../../components/outreach/feedback/FeedbackPanel'

export const OutreachPage = () => {
  const { generatedMessage, isGenerating, error } = useAIStore()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">OutreachGPT</h1>
          <p className="text-muted-foreground">
            Generate personalized messages powered by AI
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column - Message composer */}
          <div className="space-y-4">
            <MessageComposer />
          </div>

          {/* Right column - Preview and feedback */}
          <div className="space-y-4">
            {isGenerating ? (
              <div className="p-8 border rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : error ? (
              <div className="p-8 border rounded-lg bg-destructive/10 text-destructive">
                {error.message}
              </div>
            ) : generatedMessage ? (
              <div className="space-y-4">
                <MessagePreview message={generatedMessage} />
                <FeedbackPanel messageId={generatedMessage.id} />
              </div>
            ) : (
              <div className="p-8 border rounded-lg text-center text-muted-foreground">
                Your generated message will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
