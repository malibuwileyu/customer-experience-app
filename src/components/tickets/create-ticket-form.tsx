'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../common/button'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../common/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '../common/form'
import { Input } from '../common/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/select'
import { Alert, AlertDescription } from '../common/alert'
import { FileUpload } from './file-upload'
import { useCreateTicket } from '../../hooks/tickets/use-create-ticket'
import { Textarea } from '../common/textarea'
import { useState } from 'react'
import { useFileUpload } from '../../hooks/tickets/use-file-upload'
import { storageConfig } from '../../services/storage.service'
import { ticketService } from '../../services/ticket.service'
import { useAuth } from '../../contexts/AuthContext'
import { useUserRoles } from '../../hooks/auth/useUserRoles'
import { toast } from 'sonner'

interface CreateTicketFormProps {
  onClose?: () => void
}

const ticketFormSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent'] as const),
  category_id: z.string().optional(),
  team_id: z.string().optional(),
  assignee_id: z.string().optional(),
  internal_notes: z.string().optional(),
  attachments: z.array(z.string()).optional(),
})

type TicketFormData = z.infer<typeof ticketFormSchema>

const defaultValues: Partial<TicketFormData> = {
  title: '',
  description: '',
  priority: 'medium',
  attachments: [],
  internal_notes: '',
}

export function CreateTicketForm({ onClose }: CreateTicketFormProps) {
  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  const { user } = useAuth()
  const { roles } = useUserRoles(user?.id)
  const isStaff = roles?.some(role => ['admin', 'agent'].includes(role))

  const { mutateAsync: createTicketMutate, isPending, error } = useCreateTicket({
    onSuccess: onClose
  })
  const [uploadError, setUploadError] = useState<string>()
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  // Initialize file upload hook
  const { uploadFiles } = useFileUpload({
    maxFiles: 5,
    maxSize: storageConfig.maxFileSize,
    onError: (error) => setUploadError(error)
  })

  const onSubmit = async (data: TicketFormData) => {
    try {
      // Remove empty optional fields
      const cleanedData = {
        ...data,
        internal_notes: data.internal_notes?.trim() || undefined,
      }

      // Create ticket first without attachments
      const ticket = await createTicketMutate(cleanedData)

      // If we have pending files and ticket was created successfully
      if (pendingFiles.length > 0 && ticket?.id) {
        try {
          console.log('Starting file upload process for ticket:', ticket.id)
          console.log('Pending files:', pendingFiles.map(f => ({ name: f.name, size: f.size })))
          
          const paths = await uploadFiles(pendingFiles, ticket.id)
          console.log('Files uploaded successfully, received paths:', paths)

          if (paths.length > 0) {
            console.log('Updating ticket with attachment paths:', paths)
            // Update ticket with file paths using ticketService directly
            const updatedTicket = await ticketService.updateTicket(ticket.id, {
              attachments: paths
            })
            console.log('Ticket updated successfully with attachments:', updatedTicket.attachments)
          }
        } catch (uploadError) {
          console.error('Error in file upload process:', uploadError)
          setUploadError(uploadError instanceof Error ? uploadError.message : 'Failed to upload files')
          toast.error('Ticket created but file upload failed')
        }
      }

      // Reset form and state
      form.reset(defaultValues)
      setPendingFiles([])
      setUploadError(undefined)
    } catch (err) {
      console.error('Error submitting form:', err)
      setUploadError(err instanceof Error ? err.message : 'Failed to create ticket')
    }
  }

  const handleReset = () => {
    form.reset(defaultValues)
    form.clearErrors()
    setPendingFiles([])
    setUploadError(undefined)
  }

  return (
    <Card className="max-h-[80vh] flex flex-col overflow-hidden">
      <CardHeader className="pb-4 shrink-0">
        <CardTitle>Create New Ticket</CardTitle>
        <CardDescription>
          Submit a new support ticket. Please provide as much detail as possible.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col min-h-0 flex-1">
          <CardContent className="space-y-6 overflow-y-auto">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to create ticket
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Brief summary of the issue" 
                      aria-invalid={!!fieldState.error}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A clear and concise title helps us understand your issue quickly.
                  </FormDescription>
                  {fieldState.error && (
                    <FormMessage role="alert">
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed description of the issue"
                      className="min-h-[120px]"
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Please provide all relevant details about the issue.
                  </FormDescription>
                  {fieldState.error && (
                    <FormMessage role="alert">
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select 
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the priority level based on the urgency of your issue.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isStaff && (
              <FormField
                control={form.control}
                name="internal_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes (internal use only)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional notes visible only to support staff.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="attachments"
              render={() => (
                <FormItem>
                  <FormLabel>Attachments</FormLabel>
                  <FormControl>
                    <FileUpload
                      onFileSelect={(files) => setPendingFiles(files)}
                      onError={(error) => setUploadError(error)}
                      maxFiles={5}
                      maxSize={storageConfig.maxFileSize}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload files related to this ticket
                  </FormDescription>
                  {uploadError && (
                    <FormMessage role="alert">
                      {uploadError}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end space-x-4 border-t py-4 shrink-0 bg-background">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isPending}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating...' : 'Create Ticket'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
} 