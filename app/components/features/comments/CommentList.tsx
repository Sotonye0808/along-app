"use client"

import Link from "next/link"
import { Trash2 } from "lucide-react"
import { AppEmptyState } from "@/app/components/ui"
import { EMPTY_STATES } from "@/app/lib/config"
import { commentParser } from "@/app/lib/utils/commentParser"
import { useAuth } from "@/app/hooks/useAuth"

interface CommentUser {
  id: string
  userName: string
  firstName: string
  lastName: string
  avatar?: string | null
  avatarConfig?: unknown
}

interface Comment {
  id: string
  text: string
  createdAt: string | Date
  user: CommentUser
}

interface CommentListProps {
  comments: Comment[]
  onDelete?: (commentId: string) => void
}

function getTimeAgo(date: string | Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export default function CommentList({ comments, onDelete }: CommentListProps) {
  const { user: currentUser } = useAuth()

  if (comments.length === 0) {
    return (
      <div className="py-8">
        <AppEmptyState {...EMPTY_STATES.comments} />
      </div>
    )
  }

  return (
    <div>
      {comments.map((comment) => {
        const initials = `${comment.user.firstName[0]}${comment.user.lastName[0]}`.toUpperCase()
        const isOwner = currentUser?.id === comment.user.id

        return (
          <div key={comment.id} className="flex gap-2.5 py-3 border-b border-border last:border-b-0">
            <Link
              href={`/profile/${comment.user.userName}`}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-circle bg-bg-elevated flex items-center justify-center text-xs font-bold text-text-secondary shrink-0 no-underline"
            >
              {initials}
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/profile/${comment.user.userName}`}
                onClick={(e) => e.stopPropagation()}
                className="text-sm font-semibold text-text-primary no-underline hover:underline"
              >
                {comment.user.firstName} {comment.user.lastName}
              </Link>
              <div className="text-sm text-text-primary mt-0.5">
                {commentParser(comment.text)}
              </div>
              <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
                <span>{getTimeAgo(comment.createdAt)}</span>
                {isOwner && onDelete && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="flex items-center gap-1 border-none bg-transparent text-text-muted cursor-pointer p-0.5 hover:text-error-text transition-colors duration-fast"
                    aria-label="Delete comment"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
