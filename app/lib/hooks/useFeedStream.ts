/**
 * useFeedStream — RxJS-powered reactive feed hook.
 *
 * Replaces the manual polling in useFeedPosts with a declarative RxJS pipeline.
 * Emits fresh post arrays on a configurable interval, deduplicating emissions
 * when the post list hasn't changed (by comparing the latest post ID and count).
 *
 * Usage:
 *   const { posts, loading, error, refresh } = useFeedStream({ intervalMs: 30_000 });
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { Subject, timer, Subscription } from "rxjs";
import { switchMap, startWith, distinctUntilChanged, map, share } from "rxjs/operators";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { combinePostsWithAuthors } from "@/lib/utils/feedHelpers";

interface PostWithAuthor extends Post {
  author: User;
}

interface FeedStreamOptions {
  /** How often to poll the feed (milliseconds). Default: 30 000 ms. */
  intervalMs?: number;
  enabled?: boolean;
}

interface FeedStreamResult {
  posts: PostWithAuthor[];
  loading: boolean;
  error: string | null;
  /** Imperatively trigger an immediate refresh. */
  refresh: () => void;
}

async function fetchFeedOnce(): Promise<PostWithAuthor[]> {
  const [postsRes, usersRes] = await Promise.all([
    api.get<Post[]>(API_ENDPOINTS.POSTS),
    api.get<User[]>(API_ENDPOINTS.USERS),
  ]);
  return combinePostsWithAuthors(postsRes.data ?? [], usersRes.data ?? []);
}

function postsFingerprint(posts: PostWithAuthor[]): string {
  // Cheap change-detection: count + newest id
  return `${posts.length}:${posts[0]?.id ?? ""}`;
}

export function useFeedStream({
  intervalMs = 30_000,
  enabled = true,
}: FeedStreamOptions = {}): FeedStreamResult {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subject that triggers an immediate refresh when next() is called
  const refreshSubject = useRef(new Subject<void>());

  // Keep a ref to the active subscription so we can cleanly unsubscribe
  const subscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    // Build the observable pipeline once
    const feed$ = refreshSubject.current.pipe(
      startWith(undefined as void), // emit immediately on subscribe
      switchMap(() =>
        // After each refresh trigger, re-start the interval
        timer(0, intervalMs),
      ),
      // For each tick, fetch the feed
      switchMap(async () => {
        try {
          const result = await fetchFeedOnce();
          return { data: result, error: null };
        } catch (err) {
          return { data: null, error: (err as Error).message ?? "Failed to load feed" };
        }
      }),
      // Only propagate when the fingerprint changes (avoids unnecessary re-renders)
      map((result) => ({
        ...result,
        fingerprint: result.data ? postsFingerprint(result.data) : "error",
      })),
      distinctUntilChanged((a, b) => a.fingerprint === b.fingerprint && a.error === b.error),
      share(),
    );

    subscriptionRef.current = feed$.subscribe(({ data, error: fetchError }) => {
      if (!mounted) return;
      setLoading(false);
      if (fetchError || !data) {
        setError(fetchError ?? "Unknown error");
      } else {
        setError(null);
        setPosts(data);
      }
    });

    return () => {
      mounted = false;
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, enabled]);

  const refresh = useCallback(() => {
    setLoading(true);
    refreshSubject.current.next();
  }, []);

  return { posts, loading, error, refresh };
}
