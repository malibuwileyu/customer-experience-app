import { useState } from 'react';
import { uploadFile, storageConfig } from '../../services/storage.service';

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSize?: number;
  onSuccess?: (paths: string[]) => void;
  onError?: (error: string) => void;
  ticketId?: string;
}

export function useFileUpload({
  maxFiles = 5,
  maxSize = storageConfig.maxFileSize,
  onSuccess,
  onError,
  ticketId
}: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFiles = async (files: File[], id?: string): Promise<string[]> => {
    const uploadTicketId = id || ticketId;
    if (!uploadTicketId) {
      throw new Error('Ticket ID is required for file upload');
    }

    if (files.length > maxFiles) {
      throw new Error(`Maximum ${maxFiles} files allowed`);
    }

    const oversizedFiles = files.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      throw new Error(`Files must be smaller than ${maxSize / 1024 / 1024}MB`);
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const path = await uploadFile(file, uploadTicketId);
        
        // Update progress
        setProgress(((index + 1) / files.length) * 100);
        
        return path;
      });

      const paths = await Promise.all(uploadPromises);
      onSuccess?.(paths);
      return paths;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload files';
      onError?.(message);
      throw error;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadFiles,
    isUploading,
    progress,
    config: {
      maxFiles,
      maxSize,
      acceptedTypes: storageConfig.acceptedFileTypes
    }
  };
} 