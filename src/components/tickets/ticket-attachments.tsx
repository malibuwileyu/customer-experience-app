/**
 * @fileoverview Ticket attachments component for displaying and managing file attachments
 * @module components/tickets/ticket-attachments
 * @description
 * Displays and manages file attachments for tickets. Supports file downloads,
 * loading states, and error handling. Includes preview capabilities for
 * supported file types.
 */

import { getFileUrl } from '../../services/storage.service';
import { useState } from 'react';
import { FileIcon, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Represents a normalized attachment with consistent properties
 * @interface NormalizedAttachment
 * @property {string} path - Storage path of the attachment
 * @property {string} filename - Original filename
 * @property {boolean} isPreviewable - Whether the file can be previewed
 */
export interface NormalizedAttachment {
  path: string;
  filename: string;
  isPreviewable: boolean;
}

/**
 * Props for the TicketAttachments component
 * @interface TicketAttachmentsProps
 * @property {NormalizedAttachment[]} attachments - Array of normalized attachments
 * @property {function} [onError] - Callback when an error occurs during download
 */
interface TicketAttachmentsProps {
  attachments: NormalizedAttachment[];
  onError?: (error: Error) => void;
}

/**
 * Normalizes a raw attachment path into a structured format
 * @function normalizeAttachment
 * @param {string} path - Raw attachment path from storage
 * @returns {NormalizedAttachment | null} Normalized attachment or null if invalid
 */
export function normalizeAttachment(path: string): NormalizedAttachment | null {
  try {
    const filename = path.split('/').pop() || path;
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const isPreviewable = ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
    
    return {
      path,
      filename,
      isPreviewable
    };
  } catch (error) {
    console.error('Failed to normalize attachment:', error);
    return null;
  }
}

/**
 * TicketAttachments component for displaying and managing file attachments
 * 
 * @component
 * @example
 * ```tsx
 * <TicketAttachments
 *   attachments={normalizedAttachments}
 *   onError={handleError}
 * />
 * ```
 */
export function TicketAttachments({ attachments, onError }: TicketAttachmentsProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleDownload = async (attachment: NormalizedAttachment) => {
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