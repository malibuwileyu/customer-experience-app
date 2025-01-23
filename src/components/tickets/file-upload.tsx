'use client'

import { useCallback, useState } from 'react'
import { useDropzone, Accept } from 'react-dropzone'
import { Button } from '../common/button'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { storageConfig } from '../../services/storage.service'

interface FileUploadProps {
  onFileSelect: (files: File[]) => void
  onError: (error: string) => void
  maxFiles?: number
  maxSize?: number // in bytes
  className?: string
}

interface FileWithPreview extends File {
  preview?: string
}

// Convert string array to Accept type
const acceptedTypes = storageConfig.acceptedFileTypes.reduce((acc, type) => {
  acc[type] = []
  return acc
}, {} as Accept)

export function FileUpload({
  onFileSelect,
  onError,
  maxFiles = 5,
  maxSize = storageConfig.maxFileSize,
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > maxFiles) {
      onError(`Maximum ${maxFiles} files allowed`)
      return
    }

    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSize)
    if (oversizedFiles.length > 0) {
      onError(`Files must be smaller than ${maxSize / 1024 / 1024}MB`)
      return
    }

    // Create preview for images
    const filesWithPreview = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: file.type.startsWith('image/') 
          ? URL.createObjectURL(file)
          : undefined
      })
    )
    setFiles(filesWithPreview)
    onFileSelect(acceptedFiles)
  }, [maxFiles, maxSize, onFileSelect, onError])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedTypes,
    maxFiles
  })

  const removeFile = useCallback((file: FileWithPreview) => {
    setFiles((prev) => {
      const newFiles = prev.filter((f) => f !== file)
      onFileSelect(newFiles)
      return newFiles
    })
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  }, [onFileSelect])

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
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

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
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
                <div className="flex h-full items-center justify-center p-2">
                  <span className="text-xs text-muted-foreground text-center break-all">
                    {file.name}
                  </span>
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(file)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 