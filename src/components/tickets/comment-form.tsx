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

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
  is_internal: z.boolean().default(false),
})

type CommentFormValues = z.infer<typeof commentSchema>

interface CommentFormProps {
  ticketId: string
  onSubmit: (data: CreateTicketCommentDTO) => Promise<void>
  isSubmitting?: boolean
}

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