/**
 * @fileoverview Tests for useFileUpload hook
 * @module hooks/__tests__/tickets/use-file-upload
 */

import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFileUpload } from '../../../../hooks/tickets/use-file-upload'
import { uploadFile, storageConfig } from '../../../../services/storage.service'

// Mock dependencies
vi.mock('../../../../services/storage.service', () => ({
  uploadFile: vi.fn(),
  storageConfig: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    acceptedFileTypes: ['.pdf', '.doc', '.docx', '.txt']
  }
}))

describe('useFileUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should upload files successfully', async () => {
    const mockFiles = [
      new File(['test content'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['test content'], 'test2.txt', { type: 'text/plain' })
    ]

    const mockPaths = [
      'uploads/ticket-1/test1.pdf',
      'uploads/ticket-1/test2.txt'
    ]

    vi.mocked(uploadFile).mockImplementation((file, ticketId) => 
      Promise.resolve(`uploads/${ticketId}/${file.name}`)
    )

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useFileUpload({
      ticketId: 'ticket-1',
      onSuccess
    }))

    expect(result.current.isUploading).toBe(false)
    expect(result.current.progress).toBe(0)

    let uploadedPaths: string[] = []
    await act(async () => {
      uploadedPaths = await result.current.uploadFiles(mockFiles)
    })

    expect(uploadedPaths).toEqual(mockPaths)
    expect(onSuccess).toHaveBeenCalledWith(mockPaths)
    expect(uploadFile).toHaveBeenCalledTimes(2)
    expect(result.current.isUploading).toBe(false)
    expect(result.current.progress).toBe(0)
  })

  it('should throw error when ticketId is missing', async () => {
    const mockFiles = [
      new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    ]

    const onError = vi.fn()
    const { result } = renderHook(() => useFileUpload({ onError }))

    await expect(result.current.uploadFiles(mockFiles)).rejects.toThrow('Ticket ID is required for file upload')
    expect(onError).toHaveBeenCalledWith('Ticket ID is required for file upload')
  })

  it('should throw error when file count exceeds maxFiles', async () => {
    const mockFiles = [
      new File(['test content'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['test content'], 'test2.pdf', { type: 'application/pdf' }),
      new File(['test content'], 'test3.pdf', { type: 'application/pdf' })
    ]

    const onError = vi.fn()
    const { result } = renderHook(() => useFileUpload({
      ticketId: 'ticket-1',
      maxFiles: 2,
      onError
    }))

    await expect(result.current.uploadFiles(mockFiles)).rejects.toThrow('Maximum 2 files allowed')
    expect(onError).toHaveBeenCalledWith('Maximum 2 files allowed')
  })

  it('should throw error when file size exceeds maxSize', async () => {
    const maxSize = 10 // 10 bytes
    const mockFiles = [
      new File(['test content that exceeds 10 bytes'], 'test.pdf', { type: 'application/pdf' })
    ]

    const onError = vi.fn()
    const { result } = renderHook(() => useFileUpload({
      ticketId: 'ticket-1',
      maxSize,
      onError
    }))

    await expect(result.current.uploadFiles(mockFiles)).rejects.toThrow('Files must be smaller than 0MB')
    expect(onError).toHaveBeenCalledWith('Files must be smaller than 0MB')
  })

  it('should handle upload error', async () => {
    const mockFiles = [
      new File(['test content'], 'test.pdf', { type: 'application/pdf' })
    ]

    const mockError = new Error('Upload failed')
    vi.mocked(uploadFile).mockRejectedValue(mockError)

    const onError = vi.fn()
    const { result } = renderHook(() => useFileUpload({
      ticketId: 'ticket-1',
      onError
    }))

    await expect(result.current.uploadFiles(mockFiles)).rejects.toThrow('Upload failed')
    expect(onError).toHaveBeenCalledWith('Upload failed')
  })

  it('should track upload progress', async () => {
    const mockFiles = [
      new File(['test content'], 'test1.pdf', { type: 'application/pdf' }),
      new File(['test content'], 'test2.pdf', { type: 'application/pdf' })
    ]

    // Mock uploadFile to delay resolution to allow progress tracking
    vi.mocked(uploadFile).mockImplementation((file, ticketId) => 
      new Promise(resolve => {
        setTimeout(() => {
          resolve(`uploads/${ticketId}/${file.name}`)
        }, 100)
      })
    )

    const { result } = renderHook(() => useFileUpload({
      ticketId: 'ticket-1'
    }))

    const uploadPromise = act(async () => {
      await result.current.uploadFiles(mockFiles)
    })

    // Check initial state
    expect(result.current.isUploading).toBe(true)
    expect(result.current.progress).toBe(0)

    // Wait for first file to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150))
    })

    // Progress should be 50% after first file
    expect(result.current.progress).toBe(50)

    // Wait for upload to complete
    await uploadPromise

    // Check final state
    expect(result.current.isUploading).toBe(false)
    expect(result.current.progress).toBe(0)
  })

  it('should provide correct config values', () => {
    const { result } = renderHook(() => useFileUpload({
      ticketId: 'ticket-1',
      maxFiles: 3,
      maxSize: 1024 * 1024 // 1MB
    }))

    expect(result.current.config).toEqual({
      maxFiles: 3,
      maxSize: 1024 * 1024,
      acceptedTypes: storageConfig.acceptedFileTypes
    })
  })
}) 