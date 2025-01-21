'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '../common/button'
import { Progress } from '../common/progress'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface FileUploadProps {
  onUpload: (urls: string[]) => void
  onError: (error: string) => void
  maxFiles?: number
  maxSize?: number // in bytes
  accept?: Record<string, string[]>
  className?: string
}

interface FileWithPreview extends File {
  preview?: string
}

export function FileUpload({
  onUpload,
  onError,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
  },
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length + files.length > maxFiles) {
        onError(`Maximum ${maxFiles} files allowed`)
        return
      }

      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      )

      setFiles((prev) => [...prev, ...newFiles])

      try {
        setUploading(true)
        setProgress(0)

        // TODO: Implement actual file upload to storage service
        // This is a mock implementation
        await new Promise((resolve) => {
          let progress = 0
          const interval = setInterval(() => {
            progress += 10
            setProgress(progress)
            if (progress >= 100) {
              clearInterval(interval)
              resolve(null)
            }
          }, 100)
        })

        // Mock URLs for now
        const urls = newFiles.map((file) => URL.createObjectURL(file))
        onUpload(urls)
      } catch (error) {
        onError('Failed to upload files')
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
    [files.length, maxFiles, onError, onUpload]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept,
    disabled: uploading,
  })

  const removeFile = useCallback((file: FileWithPreview) => {
    setFiles((prev) => prev.filter((f) => f !== file))
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  }, [])

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the files here...</p>
        ) : (
          <p>
            Drag & drop files here, or click to select files
            <br />
            <span className="text-sm text-muted-foreground">
              Max {maxFiles} files, up to {maxSize / 1024 / 1024}MB each
            </span>
          </p>
        )}
      </div>

      {uploading && <Progress value={progress} className="w-full" />}

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <div
              key={file.name}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
            >
              {file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-50"
                  onLoad={() => {
                    URL.revokeObjectURL(file.preview!)
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-muted-foreground">{file.name}</span>
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(file)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 