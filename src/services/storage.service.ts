/**
 * @fileoverview Storage service for handling file operations
 * @module services/storage
 */

import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Format file size for logging
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

// Storage configuration
export const storageConfig = {
  maxFileSize: 50 * 1024 * 1024, // 50MB in bytes
  acceptedFileTypes: [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip'
  ]
};

// Export individual functions
export async function uploadFile(file: File, ticketId: string): Promise<string> {
  console.log(`Starting upload for file: ${file.name} (${formatFileSize(file.size)}) to ticket: ${ticketId}`);
  
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${ticketId}/${uuidv4()}.${fileExt}`;
    console.log('Generated bucket path:', fileName);

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('ticket-attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload failed:', uploadError);
      throw uploadError;
    }

    console.log('File uploaded successfully, returning bucket path:', fileName);
    return fileName;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
}

export async function getFileUrl(path: string): Promise<string> {
  console.log('Getting signed URL for path:', path);
  
  try {
    // Ensure path is properly formatted
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    console.log('Using clean path:', cleanPath);

    const { data, error } = await supabase.storage
      .from('ticket-attachments')
      .createSignedUrl(cleanPath, 3600); // 1 hour expiry

    if (error) {
      console.error('Failed to get signed URL:', error);
      throw error;
    }

    if (!data?.signedUrl) {
      throw new Error('No signed URL returned');
    }

    console.log('Successfully generated signed URL');
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getFileUrl:', error);
    throw error;
  }
}

export async function deleteFile(path: string): Promise<void> {
  console.log('Deleting file at path:', path);
  
  try {
    const { error } = await supabase.storage
      .from('ticket-attachments')
      .remove([path]);

    if (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }

    console.log('Successfully deleted file at path:', path);
  } catch (error) {
    console.error('Error in deleteFile:', error);
    throw error;
  }
}

export async function listFiles(ticketId: string): Promise<string[]> {
  console.log('Listing files for ticket:', ticketId);
  
  try {
    const { data, error } = await supabase.storage
      .from('ticket-attachments')
      .list(ticketId);

    if (error) {
      console.error('Failed to list files:', error);
      throw error;
    }

    const paths = data.map(file => `${ticketId}/${file.name}`);
    console.log('Successfully listed files:', paths);
    return paths;
  } catch (error) {
    console.error('Error in listFiles:', error);
    throw error;
  }
}

// Export config
export { storageConfig as config }; 