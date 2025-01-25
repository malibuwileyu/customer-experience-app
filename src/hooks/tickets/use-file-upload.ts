/**
 * @fileoverview Hook for managing file uploads in tickets
 * @module hooks/tickets/use-file-upload
 * @description
 * A custom hook that provides file upload functionality for tickets.
 * Handles file validation, upload progress tracking, and error handling.
 * Supports multiple file uploads with size and count limitations.
 */

import { useState } from 'react';
import { uploadFile, storageConfig } from '../../services/storage.service';

/**
 * Options for the useFileUpload hook
 * @interface UseFileUploadOptions
 * @property {number} [maxFiles=5] - Maximum number of files allowed
 * @property {number} [maxSize] - Maximum size per file in bytes
 * @property {function} [onSuccess] - Callback when upload succeeds
 * @property {function} [onError] - Callback when upload fails
 * @property {string} [ticketId] - ID of the ticket to attach files to
 */
interface UseFileUploadOptions {
  maxFiles?: number;
  maxSize?: number;
  onSuccess?: (paths: string[]) => void;
  onError?: (error: string) => void;
  ticketId?: string;
}

/**
 * Hook for managing file uploads
 * 
 * @function useFileUpload
 * @param {UseFileUploadOptions} options - Configuration options for the hook
 * @returns {Object} File upload functionality and state
 * @property {function} uploadFiles - Function to handle file uploads
 * @property {boolean} isUploading - Whether files are currently uploading
 * @property {number} progress - Upload progress percentage (0-100)
 * @property {Object} config - Current configuration (maxFiles, maxSize, acceptedTypes)
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const { uploadFiles, isUploading, progress } = useFileUpload({
 *   ticketId: '123',
 *   onSuccess: (paths) => console.log('Uploaded files:', paths),
 *   onError: (error) => console.error('Upload failed:', error)
 * });
 * 
 * // With custom limits
 * const { uploadFiles, config } = useFileUpload({
 *   maxFiles: 3,
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   ticketId: '123'
 * });
 * 
 * // Usage in a component
 * const handleFileSelect = async (files: FileList) => {
 *   try {
 *     const paths = await uploadFiles(Array.from(files));
 *     console.log('Upload successful:', paths);
 *   } catch (error) {
 *     console.error('Upload failed:', error);
 *   }
 * };
 * ```
 * 
 * @throws {Error} When ticketId is missing
 * @throws {Error} When file count exceeds maxFiles
 * @throws {Error} When file size exceeds maxSize
 */
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