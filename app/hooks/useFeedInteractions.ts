"use client"

import { useCallback } from "react"
import { undoService } from "@/app/lib/services/undoService"
import { toastService } from "@/app/lib/services/toastService"

interface UseFeedInteractionsOptions {
  onLike?: (postId: string, liked: boolean) => Promise<void> | void
  onDislike?: (postId: string, disliked: boolean) => Promise<void> | void
  onBookmark?: (postId: string, bookmarked: boolean) => Promise<void> | void
}

export function useFeedInteractions(options: UseFeedInteractionsOptions = {}) {
  const handleLike = useCallback(async (postId: string, liked: boolean) => {
    if (liked) {
      toastService.success("Route liked!")
    }
    try {
      await options.onLike?.(postId, liked)
    } catch {
      toastService.error("Failed to like route")
    }
  }, [options])

  const handleDislike = useCallback(async (postId: string, disliked: boolean) => {
    try {
      await options.onDislike?.(postId, disliked)
    } catch {
      toastService.error("Failed to dislike route")
    }
  }, [options])

  const handleBookmark = useCallback(async (postId: string, bookmarked: boolean) => {
    const undoId = `bookmark:${postId}`
    
    if (bookmarked) {
      toastService.success("Route bookmarked!")
    } else {
      undoService.register({
        id: undoId,
        label: "Undo bookmark removal",
        onUndo: () => {
          options.onBookmark?.(postId, true)
          toastService.success("Bookmark restored!")
        },
      })
      toastService.undo({
        message: "Bookmark removed",
        undoLabel: "Undo",
        onUndo: () => undoService.execute(undoId),
      })
    }

    try {
      await options.onBookmark?.(postId, bookmarked)
    } catch {
      toastService.error("Failed to update bookmark")
    }
  }, [options])

  const handleComment = useCallback((postId: string) => {
    window.location.href = `/posts/${postId}`
  }, [])

  return {
    handleLike,
    handleDislike,
    handleBookmark,
    handleComment,
  }
}
