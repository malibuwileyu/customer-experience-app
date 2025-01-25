# File Management

## Overview
The file management system enables secure file uploads and attachments for tickets, with support for multiple file types, size limits, and role-based access control. It provides features for uploading, downloading, and managing attachments within the support system.

## Core Features

### 1. File Upload
- Multiple file upload support
- Progress tracking
- File type validation
- Size limit enforcement (50MB per file)
- Drag and drop interface

### 2. File Storage
- Secure storage in Supabase
- Automatic file organization
- Ticket-based file association
- Temporary URL generation

### 3. File Access
- Role-based file access
- Secure download links
- File preview capabilities
- Access audit logging

### 4. Supported File Types
- Images (jpg, png, gif, webp)
- Documents (pdf, doc, docx)
- Text files (txt, log)
- Archives (zip)
- Size limit: 50MB per file

## Role-Based Access

### Admin
- Upload files to any ticket
- Download any file
- Delete any file
- View all attachments

### Team Lead
- Upload files to team tickets
- Download team ticket files
- Manage team ticket files
- View team attachments

### Agent
- Upload files to assigned tickets
- Download assigned ticket files
- View assigned ticket attachments
- Cannot delete files

### Customer
- Upload files to own tickets
- Download own ticket files
- View own ticket attachments
- Cannot delete files

## Usage Examples

### File Upload
```typescript
const { uploadFiles } = useFileUpload({
  ticketId: "ticket123",
  maxFiles: 5,
  maxSize: 50000000 // 50MB
});

// Single file upload
await uploadFiles([file]);

// Multiple file upload
await uploadFiles([file1, file2, file3]);
```

### File Download
```typescript
const { getFileUrl } = useFileDownload();

// Get temporary download URL
const url = await getFileUrl({
  ticketId: "ticket123",
  fileId: "file456"
});
```

### File Management
```typescript
const { deleteFile } = useFileManagement();

// Delete file
await deleteFile({
  ticketId: "ticket123",
  fileId: "file456"
});
```

## Error Handling

### Common Errors
1. **Upload Errors**
   - File size too large
   - Invalid file type
   - Upload quota exceeded
   - Network failures

2. **Access Errors**
   - Unauthorized access
   - Invalid ticket association
   - Missing permissions

3. **Storage Errors**
   - Storage quota exceeded
   - File corruption
   - Storage service errors

### Error Responses
```typescript
interface FileErrorResponse {
  code: string;
  message: string;
  details?: {
    fileId?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    maxSize?: number;
  };
}

// Example error
{
  code: "FILE_TOO_LARGE",
  message: "File exceeds maximum size limit",
  details: {
    fileName: "large-file.pdf",
    fileSize: 75000000,
    maxSize: 50000000
  }
}
```

## Performance Considerations
- Chunked file uploads
- Progressive loading
- Caching of file metadata
- Optimized storage paths

## Security
- Secure file storage
- Access control
- File scanning
- URL expiration

## Related Components
- `FileUploadDialog`: File upload interface
- `FileList`: Displays attached files
- `FilePreview`: Preview component for supported files
- `UploadProgress`: Progress indicator for uploads

## Database Schema
```sql
-- File metadata storage
CREATE TABLE ticket_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES tickets(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- RLS policies for file access
CREATE POLICY "Users can view their own ticket attachments"
  ON ticket_attachments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT created_by FROM tickets WHERE id = ticket_id
      UNION
      SELECT assignee_id FROM tickets WHERE id = ticket_id
    )
  );
```

## API Endpoints
- `POST /files/upload`: Upload files
- `GET /files/:id`: Get file metadata
- `GET /files/:id/download`: Get download URL
- `DELETE /files/:id`: Delete file
- `GET /tickets/:id/files`: List ticket files

## Storage Organization
```
ticket-attachments/
├── ticket-{id}/
│   ├── {timestamp}-{filename}
│   └── {timestamp}-{filename}
└── temp/
    └── {upload-id}/
        └── chunks/
```

## See Also
- [Ticket Management](./ticket-management.md)
- [Security Configuration](../configuration/security.md)
- [Storage Configuration](../configuration/storage.md) 