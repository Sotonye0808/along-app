"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ArrowUp, MapPin, Search, X } from "lucide-react";
import { App } from "antd";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { AppInput } from "@/components/ui/AppInput";
import { AppTag } from "@/components/ui/AppTag";
import { AppUserLabel } from "@/components/ui/AppUserLabel";
import { TrustBadge } from "@/components/ui/TrustBadge";
import { PostCardSkeleton } from "@/components/ui/AppSkeleton";
import { RouteMap } from "@/components/features/map";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { combinePostsWithAuthors } from "@/lib/utils/feedHelpers";
import { EMPTY_STATES } from "@/lib/config/emptyStates";

interface PostWithAuthor extends Post {
  author: User;
}

const REGION_FILTERS = [
  "All",
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Kano",
];

function useExplorePosts() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const { message } = App.useApp();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const [postsRes, usersRes] = await Promise.all([
        api.get<Post[]>(API_ENDPOINTS.POSTS),
        api.get<User[]>(API_ENDPOINTS.USERS),
      ]);
      setPosts(
        combinePostsWithAuthors(postsRes.data ?? [], usersRes.data ?? []) as PostWithAuthor[],
      );
    } catch {
      message.error("Failed to load routes");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, refetch: fetchPosts };
}

function BackToTopFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg transition hover:bg-[var(--color-primary)]/90 md:bottom-8"
    >
      <ArrowUp size={20} />
    </button>
  );
}

interface GlassPopupProps {
  post: PostWithAuthor;
  onClose: () => void;
}

function GlassPopup({ post, onClose }: GlassPopupProps) {
  return (
    <div className="absolute left-3 bottom-3 z-10 w-64 pointer-events-auto">
      <AppCard variant="glass" padding="sm" className="!rounded-xl shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          aria-label="Close popup"
        >
          <X size={14} />
        </button>
        <div className="mb-2">
          <AppUserLabel
            user={{
              userName: post.author.userName,
              firstName: post.author.firstName,
              lastName: post.author.lastName,
              avatar: post.author.avatar,
              verified: post.author.verified,
            }}
            avatarSize={32}
          />
        </div>
        <p className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-2 mb-2">
          {post.title}
        </p>
        {typeof post.validityScore === "number" && (
          <div className="mb-2">
            <TrustBadge score={post.validityScore} size="small" />
          </div>
        )}
        <Link
          href={`/posts/${post.id}`}
          className="block w-full text-center text-xs font-medium text-[var(--color-primary)] hover:underline"
        >
          View route →
        </Link>
      </AppCard>
    </div>
  );
}

export default function ExplorePage() {
  const { posts, loading } = useExplorePosts();
  const [search, setSearch] = useState("");
  const [activeRegion, setActiveRegion] = useState("All");
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchRegion =
        activeRegion === "All" ||
        (p.region?.toLowerCase().includes(activeRegion.toLowerCase()) ?? false);
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.region?.toLowerCase().includes(q) ?? false);
      return matchRegion && matchSearch;
    });
  }, [posts, search, activeRegion]);

  // Build share-this-view URL with filters as query params
  const shareViewUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    url.pathname = "/explore";
    url.searchParams.set("region", activeRegion);
    if (search) url.searchParams.set("q", search);
    return url.toString();
  }, [activeRegion, search]);

  const handleShareView = useCallback(() => {
    navigator.clipboard.writeText(shareViewUrl).then(() => {
      /* success silently */
    }).catch(() => {
      /* clipboard not available */
    });
  }, [shareViewUrl]);

  // Map post with best geo for the overview map
  const mapPost = useMemo(
    () =>
      filtered.find(
        (p) =>
          p.startLat != null &&
          p.startLng != null &&
          p.endLat != null &&
          p.endLng != null,
      ) ?? filtered[0],
    [filtered],
  );

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Explore
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Discover community routes now, with upcoming event and ticketing integrations.
            </p>
          </div>
          <AppButton
            variant="secondary"
            size="sm"
            icon={MapPin}
            onClick={handleShareView}
          >
            Share this view
          </AppButton>
        </div>

        <AppCard variant="glass" padding="sm">
          <p className="text-xs text-[var(--color-text-secondary)]">
            Stay tuned for upcoming events and ticketing discovery features. Track rollout updates
            on the{" "}
            <Link href="/events" className="font-medium text-[var(--color-primary)] hover:underline">
              Events page
            </Link>
            .
          </p>
        </AppCard>

        {/* Search */}
        <AppInput
          placeholder="Search routes, tags, or regions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          prefix={<Search size={15} className="text-[var(--color-text-secondary)]" />}
          suffix={
            search ? (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={14} className="text-[var(--color-text-secondary)]" />
              </button>
            ) : null
          }
        />

        {/* Region filter chips */}
        <div className="flex flex-wrap gap-2">
          {REGION_FILTERS.map((r) => (
            <button key={r} onClick={() => setActiveRegion(r)}>
              <AppTag
                label={r}
                variant={activeRegion === r ? "primary" : "default"}
                size="sm"
              />
            </button>
          ))}
        </div>

        {/* Overview map */}
        {!loading && mapPost && (
          <div className="relative rounded-xl overflow-hidden">
            <RouteMap
              post={mapPost}
              height={280}
              className="w-full"
            />
            {selectedPost && (
              <GlassPopup
                post={selectedPost}
                onClose={() => setSelectedPost(null)}
              />
            )}
          </div>
        )}

        {/* Post list */}
        <div ref={listRef} className="space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <PostCardSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <AppEmptyState
              icon={EMPTY_STATES.noResults?.icon}
              title={EMPTY_STATES.noResults?.title ?? "No routes found"}
              description={
                EMPTY_STATES.noResults?.description ??
                "Try adjusting your search or region filter."
              }
            />
          ) : (
            filtered.map((post) => (
              <AppCard
                key={post.id}
                variant={post.isPlatformGen ? "suggestion" : "default"}
                hover
                clickable
                onClick={() => setSelectedPost(post)}
                className="cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <AppUserLabel
                        user={{
                          userName: post.author.userName,
                          firstName: post.author.firstName,
                          lastName: post.author.lastName,
                          avatar: post.author.avatar,
                          verified: post.author.verified,
                        }}
                        avatarSize={32}
                      />
                    </div>
                    <Link
                      href={`/posts/${post.id}`}
                      className="font-semibold text-[var(--color-text-primary)] hover:underline line-clamp-2 block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {post.title}
                    </Link>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {post.region && (
                        <AppTag label={post.region} variant="info" size="xs" icon={MapPin} />
                      )}
                      {post.tags.slice(0, 3).map((tag) => (
                        <AppTag key={tag} label={`#${tag}`} variant="primary" size="xs" />
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {typeof post.validityScore === "number" && (
                      <TrustBadge score={post.validityScore} size="small" />
                    )}
                  </div>
                </div>
              </AppCard>
            ))
          )}
        </div>
      </div>

      <BackToTopFab />
    </>
  );
}
