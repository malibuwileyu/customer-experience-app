# Storage Service Documentation

## Overview
The Storage Service manages file operations for ticket attachments, including uploading, downloading, and deleting files. It provides secure file handling with size limits and type restrictions.

## Configuration

### Storage Config
```typescript
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
}
```

## API Endpoints

### File Operations

#### Upload File
```typescript
async uploadFile(file: File, ticketId: string): Promise<string>
```
- **Purpose**: Uploads a file to the ticket attachments bucket
- **Authentication**: Required
- **Parameters**:
  - `file`: File object to upload
  - `ticketId`: ID of the ticket to attach the file to
- **Returns**: Bucket path of the uploaded file
- **Throws**: Error if upload fails
- **Notes**: 
  - Generates unique filename using UUID
  - Validates file size and type
  - Files are stored in ticket-specific folders

#### Get File URL
```typescript
async getFileUrl(path: string): Promise<string>
```
- **Purpose**: Generates a signed URL for file download
- **Authentication**: Required
- **Parameters**:
  - `path`: Bucket path of the file
- **Returns**: Signed URL with 1-hour expiry
- **Throws**: Error if URL generation fails
- **Notes**: Handles path formatting automatically

#### Delete File
```typescript
async deleteFile(path: string): Promise<void>
```
- **Purpose**: Deletes a file from storage
- **Authentication**: Required
- **Parameters**:
  - `path`: Bucket path of the file to delete
- **Throws**: Error if deletion fails

#### List Files
```typescript
async listFiles(ticketId: string): Promise<string[]>
```
- **Purpose**: Lists all files attached to a ticket
- **Authentication**: Required
- **Parameters**:
  - `ticketId`: ID of the ticket
- **Returns**: Array of file paths
- **Throws**: Error if listing fails

## Error Handling

### Common Errors
1. Upload Errors
   - File size exceeds limit
   - Invalid file type
   - Upload failed
   - Storage quota exceeded

2. Access Errors
   - Invalid file path
   - File not found
   - Permission denied

3. Operation Errors
   - Failed to generate URL
   - Failed to delete file
   - Failed to list files

### Error Response Format
```typescript
{
  message: string;
  details?: {
    path?: string;
    size?: number;
    type?: string;
  };
}
```

## Authentication Requirements

### Required Headers
```typescript
{
  Authorization: 'Bearer <token>';
  Content-Type: depends on operation
}
```

### File Upload Headers
```typescript
{
  Authorization: 'Bearer <token>';
  Content-Type: 'multipart/form-data';
}
```

## Storage Bucket Structure
```
ticket-attachments/
├── {ticketId}/
│   ├── {uuid}.{extension}
│   └── ...
└── ...
```

## Best Practices
1. Always check file size before upload
2. Validate file types against acceptedFileTypes
3. Use signed URLs for file access
4. Clean up files when tickets are deleted
5. Handle path formatting consistently 