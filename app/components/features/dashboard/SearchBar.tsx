"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { FileText, Hash, Search, X } from "lucide-react";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils/format";
import { AppAvatar } from "@/components/ui/AppAvatar";
import { AppInput } from "@/components/ui/AppInput";
import { AppEmptyState, EMPTY_STATES } from "@/components/ui/AppEmptyState";
import { AppSpinner } from "@/components/ui/AppSpinner";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const [usersResponse, postsResponse] = await Promise.all([
        api.get<User[]>(API_ENDPOINTS.USERS),
        api.get<Post[]>(API_ENDPOINTS.POSTS),
      ]);

      const searchLower = searchQuery.toLowerCase();
      const searchResults: SearchResult[] = [];

      const matchingUsers = usersResponse.data
        .filter(
          (user) =>
            user.userName.toLowerCase().includes(searchLower) ||
            user.firstName.toLowerCase().includes(searchLower) ||
            user.lastName.toLowerCase().includes(searchLower),
        )
        .slice(0, 3)
        .map((user) => ({
          type: "user" as const,
          id: user.id,
          title: `${user.firstName} ${user.lastName}`,
          subtitle: `@${user.userName}`,
          avatar: user.avatar,
          link: `/profile/${user.userName}`,
          metadata: undefined,
        }));

      searchResults.push(...matchingUsers);

      const matchingPosts = postsResponse.data
        .filter(
          (post) =>
            post.title.toLowerCase().includes(searchLower) ||
            post.routes.some((route) =>
              route.text.toLowerCase().includes(searchLower),
            ) ||
            post.tags.some((tag) => tag.toLowerCase().includes(searchLower)),
        )
        .slice(0, 5)
        .map((post) => {
          const author = (usersResponse.data || []).find(
            (u) => u.id === post.userId,
          );
          return {
            type: "post" as const,
            id: post.id,
            title: post.title,
            subtitle: author ? `by @${author.userName}` : "",
            link: `/posts/${post.id}`,
            metadata: `${formatNumber(post.likes)} likes`,
          };
        });

      searchResults.push(...matchingPosts);

      const allTags = new Set<string>();
      (postsResponse.data || []).forEach((post) => {
        post.tags.forEach((tag) => {
          if (tag.toLowerCase().includes(searchLower)) {
            allTags.add(tag);
          }
        });
      });

      const matchingTags = Array.from(allTags)
        .slice(0, 3)
        .map((tag) => {
          const postsWithTag = (postsResponse.data || []).filter((post) =>
            post.tags.includes(tag),
          );
          return {
            type: "tag" as const,
            id: tag,
            title: `#${tag}`,
            subtitle: `${postsWithTag.length} posts`,
            link: `/explore?tag=${encodeURIComponent(tag)}`,
          };
        });

      searchResults.push(...matchingTags);
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        void performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setQuery("");
    setResults([]);
  };

  const getResultIcon = (result: SearchResult) => {
    switch (result.type) {
      case "user":
        return (
          <AppAvatar
            user={{
              userName: result.subtitle?.replace("@", "") || result.title,
              firstName: result.title,
              avatar: result.avatar,
            }}
            size={40}
            linkToProfile={false}
            showVerifiedBadge={false}
          />
        );
      case "post":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-primary)]/15 text-[var(--color-primary)]">
            <FileText size={18} aria-hidden="true" />
          </div>
        );
      case "tag":
        return (
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]">
            <Hash size={18} aria-hidden="true" />
          </div>
        );
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <AppInput
        placeholder="Search users, posts, or tags..."
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setShowResults(true);
        }}
        onFocus={() => query && setShowResults(true)}
        prefix={<Search size={16} className="text-[var(--color-text-muted)]" />}
        suffix={
          query ? (
            <button
              type="button"
              onClick={handleClear}
              className="cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              aria-label="Clear search">
              <X size={16} />
            </button>
          ) : null
        }
        className="search-bar"
        size="large"
      />

      {showResults && (query || results.length > 0) && (
        <div className="absolute left-0 right-0 top-full z-[9999] mt-2 max-h-[500px] overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] shadow-lg">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <AppSpinner size={22} className="text-[var(--color-primary)]" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-4">
              <AppEmptyState {...EMPTY_STATES.noResults} size="sm" />
            </div>
          ) : (
            <div className="py-2">
              {results.filter((r) => r.type === "user").length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                    Users
                  </div>
                  {results
                    .filter((r) => r.type === "user")
                    .map((result) => (
                      <Link
                        key={result.id}
                        href={result.link}
                        onClick={handleResultClick}
                        className="block px-4 py-3 transition-colors hover:bg-[var(--color-bg-elevated)]">
                        <div className="flex items-center gap-3">
                          {getResultIcon(result)}
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-[var(--color-text-primary)]">
                              {result.title}
                            </div>
                            <div className="truncate text-sm text-[var(--color-text-secondary)]">
                              {result.subtitle}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              )}

              {results.filter((r) => r.type === "post").length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                    Posts
                  </div>
                  {results
                    .filter((r) => r.type === "post")
                    .map((result) => (
                      <Link
                        key={result.id}
                        href={result.link}
                        onClick={handleResultClick}
                        className="block px-4 py-3 transition-colors hover:bg-[var(--color-bg-elevated)]">
                        <div className="flex items-center gap-3">
                          {getResultIcon(result)}
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-[var(--color-text-primary)]">
                              {result.title}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <span className="text-sm text-[var(--color-text-secondary)]">
                                {result.subtitle}
                              </span>
                              {result.metadata && (
                                <span className="text-xs text-[var(--color-text-muted)]">
                                  • {result.metadata}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              )}

              {results.filter((r) => r.type === "tag").length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold uppercase text-[var(--color-text-muted)]">
                    Tags
                  </div>
                  {results
                    .filter((r) => r.type === "tag")
                    .map((result) => (
                      <Link
                        key={result.id}
                        href={result.link}
                        onClick={handleResultClick}
                        className="block px-4 py-3 transition-colors hover:bg-[var(--color-bg-elevated)]">
                        <div className="flex items-center gap-3">
                          {getResultIcon(result)}
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-[var(--color-primary)]">
                              {result.title}
                            </div>
                            <div className="text-sm text-[var(--color-text-secondary)]">
                              {result.subtitle}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
