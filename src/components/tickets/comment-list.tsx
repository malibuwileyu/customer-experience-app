import { formatDistanceToNow } from "date-fns"
import { Avatar, AvatarFallback, AvatarImage } from "../common/avatar"
import { Badge } from "../common/badge"
import { Skeleton } from "../common/skeleton"
import type { TicketComment } from "../../types/models/ticket.types"

interface CommentListProps {
  comments: TicketComment[]
  isLoading?: boolean
}

export function CommentList({ comments, isLoading = false }: CommentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (!comments.length) {
    return (
      <p className="text-sm text-muted-foreground">No comments yet</p>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className={`rounded-lg border p-4 ${
            comment.is_internal ? "bg-muted" : ""
          }`}
        >
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.user.avatar_url || undefined} />
              <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{comment.user.name}</span>
                {comment.is_internal && (
                  <Badge variant="outline">Internal Note</Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 