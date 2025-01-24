import { getFileUrl } from '../../services/storage.service';
import { useState } from 'react';
import { FileIcon, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

export interface Attachment {
  path: string;
  filename: string;
  isPreviewable: boolean;
}

interface TicketAttachmentsProps {
  attachments: Attachment[];
  onError?: (error: Error) => void;
}

export function TicketAttachments({ attachments, onError }: TicketAttachmentsProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleDownload = async (attachment: Attachment) => {
    try {
      setLoadingStates(prev => ({ ...prev, [attachment.path]: true }));
      
      const signedUrl = await getFileUrl(attachment.path);
      
      // Fetch the file as a blob first
      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename; // This forces download instead of opening in browser
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success(`Downloaded ${attachment.filename}`);
    } catch (error) {
      console.error('Download error:', error);
      onError?.(error as Error);
      toast.error(`Failed to download ${attachment.filename}`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [attachment.path]: false }));
    }
  };

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.path}
          className="flex items-center gap-2 p-2 rounded-md border hover:bg-gray-50"
        >
          {attachment.isPreviewable ? (
            <ImageIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <FileIcon className="h-5 w-5 text-gray-500" />
          )}
          <span className="flex-1 truncate">{attachment.filename}</span>
          <button
            className="px-3 py-1 text-sm font-medium rounded-md border hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => handleDownload(attachment)}
            disabled={loadingStates[attachment.path]}
          >
            {loadingStates[attachment.path] ? 'Downloading...' : 'Download'}
          </button>
        </div>
      ))}
    </div>
  );
} 