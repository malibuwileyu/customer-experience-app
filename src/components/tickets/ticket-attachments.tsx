import { useState, useEffect } from 'react'
import { Button } from '../../components/common/button'
import { Card } from '../../components/common/card'
import { getFileUrl } from '../../services/storage.service'
import { toast } from 'sonner'

export interface Attachment {
  name: string
  path: string
  type: string
}

interface TicketAttachmentsProps {
  attachments: Attachment[] | null
  onError?: (error: Error) => void
}

export function TicketAttachments({ attachments, onError }: TicketAttachmentsProps) {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadSignedUrls() {
      if (!attachments?.length) return

      const urlPromises = attachments.map(async (attachment) => {
        try {
          console.log('Getting signed URL for:', attachment.path)
          const url = await getFileUrl(attachment.path)
          console.log('Got signed URL:', url)
          return { path: attachment.path, url }
        } catch (error) {
          console.error('Error getting signed URL:', error)
          onError?.(error instanceof Error ? error : new Error('Failed to get signed URL'))
          return { path: attachment.path, url: null }
        }
      })

      const results = await Promise.all(urlPromises)
      const urlMap = results.reduce((acc, { path, url }) => {
        if (url) acc[path] = url
        return acc
      }, {} as Record<string, string>)

      setSignedUrls(urlMap)
    }

    loadSignedUrls()
  }, [attachments, onError])

  if (!attachments?.length) return null

  const isImage = (type: string) => type === 'image'

  const handleDownload = async (attachment: Attachment) => {
    const url = signedUrls[attachment.path]
    if (!url) {
      toast.error('Failed to download file')
      return
    }

    try {
      // Fetch the file as a blob
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch file')
      
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      
      // Create and trigger download
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      console.error('Error downloading file:', error)
      onError?.(error instanceof Error ? error : new Error('Failed to download file'))
      toast.error('Failed to download file')
    }
  }

  return (
    <Card className="mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {attachments.map((attachment) => (
          <div key={attachment.path} className="relative">
            {isImage(attachment.type) ? (
              <img
                src={signedUrls[attachment.path] || '/placeholder-image.png'}
                alt={attachment.name}
                className="w-full h-32 object-cover rounded-md"
                onError={(e) => {
                  console.error('Error loading image')
                  ;(e.target as HTMLImageElement).src = '/placeholder-image.png'
                  onError?.(new Error('Failed to load image'))
                }}
              />
            ) : (
              <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                <span className="text-gray-500">📄 {attachment.name}</span>
              </div>
            )}
            <Button
              onClick={() => handleDownload(attachment)}
              disabled={!signedUrls[attachment.path]}
              className="mt-2 w-full"
            >
              {!signedUrls[attachment.path] ? 'Loading...' : 'Download'}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
} 