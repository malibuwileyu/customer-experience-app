'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTicketStore } from '../../stores/ticket.store'
import { TICKET_PRIORITY } from '../../types/models/ticket.types'
import { Button } from '../common/button'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '../common/card'
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '../common/form'
import { Input } from '../common/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../common/select'
import { FormTextarea } from '../common/form-textarea'
import { Alert, AlertDescription } from '../common/alert'
import { FileUpload } from './file-upload'
import { useCreateTicket } from '../../hooks/tickets/use-create-ticket'
import { Textarea } from '../common/textarea'

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

export function CreateTicketForm() {
  const [isUploading, setIsUploading] = useState(false)
  const { mutate: createTicketMutate, isPending, error } = useCreateTicket()

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  })

  const onSubmit = async (data: TicketFormData) => {
    try {
      // Remove empty optional fields
      const cleanedData = {
        ...data,
        internal_notes: data.internal_notes?.trim() || undefined,
        attachments: data.attachments?.length ? data.attachments : undefined,
      }
      await createTicketMutate(cleanedData)
    } catch (err) {
      console.error('Error submitting form:', err)
    }
  }

  const handleReset = () => {
    form.reset(defaultValues)
    form.clearErrors()
    // Reset file upload state if needed
    setIsUploading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Ticket</CardTitle>
        <CardDescription>
          Submit a new support ticket. Please provide as much detail as possible.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-6">
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

            <FormField
              control={form.control}
              name="attachments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attachments</FormLabel>
                  <FormControl>
                    <FileUpload
                      onUpload={(urls) => field.onChange(urls)}
                      onError={(error) => form.setError('attachments', { message: error })}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload files related to this ticket
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end space-x-4">
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