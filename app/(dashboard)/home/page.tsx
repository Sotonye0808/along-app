"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { RefreshCw } from "lucide-react"
import dynamic from "next/dynamic"
import { PostCard } from "@/app/components/features/posts"

const ShareRouteModal = dynamic(() => import("@/app/components/features/posts/ShareRouteModal"), { ssr: false })
import { AppEmptyState, PostCardSkeleton } from "@/app/components/ui"
import { EMPTY_STATES } from "@/app/lib/config"
import { useAuth } from "@/app/hooks/useAuth"
import { useFeedInteractions } from "@/app/hooks/useFeedInteractions"

interface FeedPost {
  id: string
  title: string
  routes: unknown
  images: string[]
  tags: string[]
  likes: number
  dislikes: number
  comments: number
  bookmarks: number
  validityScore: number
  validityTier: string | null
  isPlatformGen?: boolean
  createdAt: string
  user: {
    id: string
    userName: string
    firstName: string
    lastName: string
    avatar?: string | null
    avatarConfig?: unknown
  }
  _isLiked?: boolean
  _isBookmarked?: boolean
  totalDistanceKm?: number | null
  estimatedMins?: number | null
  region?: string | null
}

export default function HomePage() {
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [newPostsCount, setNewPostsCount] = useState(0)
  const [showShareModal, setShowShareModal] = useState(false)
  const loaderRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const fetchFeed = useCallback(async (cursorVal?: string) => {
    try {
      const params = new URLSearchParams()
      if (cursorVal) params.set("cursor", cursorVal)
      params.set("limit", "10")
      const res = await fetch(`/api/posts/feed?${params}`)
      const data = await res.json()
      return data as { posts: FeedPost[]; nextCursor: string | null }
    } catch {
      return { posts: [], nextCursor: null }
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    setLoading(true)
    const data = await fetchFeed(cursor ?? undefined)
    setPosts((prev) => [...prev, ...data.posts])
    setCursor(data.nextCursor)
    setHasMore(!!data.nextCursor)
    setLoading(false)
  }, [cursor, hasMore, loading, fetchFeed])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const data = await fetchFeed()
      setPosts(data.posts)
      setCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
      setLoading(false)
    }
    init()
  }, [fetchFeed])

  useEffect(() => {
    const el = loaderRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading, loadMore])

  useEffect(() => {
    const interval = setInterval(() => {
      if (posts.length > 0 && Math.random() > 0.85) {
        setNewPostsCount((prev) => prev + Math.floor(Math.random() * 3) + 1)
      }
    }, 30000)
    return () => clearInterval(interval)
  }, [posts.length])

  const refreshFeed = async () => {
    setNewPostsCount(0)
    setLoading(true)
    const data = await fetchFeed()
    setPosts(data.posts)
    setCursor(data.nextCursor)
    setHasMore(!!data.nextCursor)
    setLoading(false)
  }

  const { handleLike, handleDislike, handleBookmark, handleComment } = useFeedInteractions({
    onLike: async (postId, liked) => {
      await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: liked ? "LIKE" : "DISLIKE" }),
      })
    },
    onDislike: async (postId, _disliked) => {
      await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "DISLIKE" }),
      })
    },
    onBookmark: async (postId, _bookmarked) => {
      await fetch(`/api/posts/${postId}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    },
  })

  const initials = user
    ? `${(user.firstName as string)?.[0] ?? ""}${(user.lastName as string)?.[0] ?? ""}`.toUpperCase()
    : "?"

  return (
    <>
      <div className="max-w-[640px] mx-auto px-4 py-4 flex flex-col gap-3">
        {newPostsCount > 0 && (
          <button
            onClick={refreshFeed}
            className="sticky top-0 z-10 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-semibold cursor-pointer radius-lg shadow-md border-none mb-2 animate-[slideDown_300ms_ease-out]"
          >
            <RefreshCw size={16} />
            {newPostsCount} new {newPostsCount === 1 ? "post" : "posts"}
          </button>
        )}

        <div
          onClick={() => setShowShareModal(true)}
          className="bg-bg-card border border-border radius-lg px-4 py-3 flex items-center gap-2.5 cursor-pointer transition-shadow duration-base shadow-sm hover:shadow-md"
        >
          <div className="w-8 h-8 rounded-circle bg-primary-muted flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {initials}
          </div>
          <div className="flex-1 text-sm text-text-muted px-3 py-2 radius-md bg-bg-elevated">
            Share a route...
          </div>
        </div>

        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post as never}
              onLike={handleLike}
              onDislike={handleDislike}
              onBookmark={handleBookmark}
              onComment={handleComment}
              currentUserId={user?.id as string}
            />
          ))
        ) : loading ? (
          Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
        ) : (
          <AppEmptyState {...EMPTY_STATES.feed} />
        )}

        <div ref={loaderRef} className="h-4" />

        {loading && posts.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-circle animate-spin" />
          </div>
        )}
      </div>

      <ShareRouteModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSubmit={async (data) => {
          try {
            const res = await fetch("/api/posts", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            })
            if (res.ok) {
              refreshFeed()
            }
          } catch {
            console.error("Failed to create post")
          }
        }}
      />
    </>
  )
}
