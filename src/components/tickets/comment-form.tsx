/**
 * @fileoverview Comment form component for adding comments to tickets
 * @module components/tickets/comment-form
 * @description
 * A form component that allows users to add comments to tickets, with support
 * for internal notes and loading states. Uses React Hook Form for form handling
 * and validation.
 */

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "../common/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../common/form"
import { Textarea } from "../common/textarea"
import { Checkbox } from "../common/checkbox"
import type { CreateTicketCommentDTO } from "../../types/models/ticket.types"

/**
 * Schema for comment form validation
 */
const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  is_internal: z.boolean().default(false),
})

type CommentFormValues = z.infer<typeof commentSchema>

/**
 * Props for the CommentForm component
 * @interface CommentFormProps
 * @property {string} ticketId - ID of the ticket to add comment to
 * @property {function} onSubmit - Callback when comment is submitted
 * @property {boolean} [isSubmitting] - Whether the form is currently submitting
 */
interface CommentFormProps {
  ticketId: string
  onSubmit: (data: CreateTicketCommentDTO) => Promise<void>
  isSubmitting?: boolean
}

/**
 * CommentForm component for adding comments to tickets
 * 
 * @component
 * @example
 * ```tsx
 * <CommentForm
 *   ticketId="123"
 *   onSubmit={handleSubmit}
 *   isSubmitting={isLoading}
 * />
 * ```
 */
export function CommentForm({ ticketId, onSubmit, isSubmitting = false }: CommentFormProps) {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
      is_internal: false,
    },
  })

  const handleSubmit = async (values: CommentFormValues) => {
    await onSubmit({
      ticket_id: ticketId,
      content: values.content,
      is_internal: values.is_internal,
    })
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Add a comment..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="is_internal"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <label
                  htmlFor="is_internal"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Internal note
                </label>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Comment"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 