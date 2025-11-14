"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Input, Spin, Empty, Avatar, Tag } from "antd";
import { SearchOutlined, CloseOutlined } from "@ant-design/icons";
import Link from "next/link";
import { api } from "@/lib/utils/api";
import { API_ENDPOINTS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils/format";

const { Search } = Input;

interface SearchResult {
  type: "user" | "post" | "tag";
  id: string;
  title: string;
  subtitle?: string;
  avatar?: string;
  link: string;
  metadata?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close results when clicking outside
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

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      // Fetch users, posts, and extract tags
      const [usersResponse, postsResponse] = await Promise.all([
        api.get<User[]>(API_ENDPOINTS.USERS),
        api.get<Post[]>(API_ENDPOINTS.POSTS),
      ]);

      const searchLower = searchQuery.toLowerCase();
      const searchResults: SearchResult[] = [];

      // Search users (excluding location for privacy)
      const matchingUsers = usersResponse.data
        .filter(
          (user) =>
            user.userName.toLowerCase().includes(searchLower) ||
            user.firstName.toLowerCase().includes(searchLower) ||
            user.lastName.toLowerCase().includes(searchLower)
        )
        .slice(0, 3)
        .map((user) => ({
          type: "user" as const,
          id: user.id,
          title: `${user.firstName} ${user.lastName}`,
          subtitle: `@${user.userName}`,
          avatar: user.avatar,
          link: `/profile/${user.userName}`,
          metadata: undefined, // Location is private
        }));

      searchResults.push(...matchingUsers);

      // Search posts
      const matchingPosts = postsResponse.data
        .filter(
          (post) =>
            post.title.toLowerCase().includes(searchLower) ||
            post.routes.some((route) =>
              route.text.toLowerCase().includes(searchLower)
            ) ||
            post.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        )
        .slice(0, 5)
        .map((post) => {
          const author = usersResponse.data.find((u) => u.id === post.userId);
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

      // Search tags
      const allTags = new Set<string>();
      postsResponse.data.forEach((post) => {
        post.tags.forEach((tag) => {
          if (tag.toLowerCase().includes(searchLower)) {
            allTags.add(tag);
          }
        });
      });

      const matchingTags = Array.from(allTags)
        .slice(0, 3)
        .map((tag) => {
          const postsWithTag = postsResponse.data.filter((post) =>
            post.tags.includes(tag)
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

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, performSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowResults(true);
  };

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
          <Avatar src={result.avatar} size={40}>
            {result.title[0]}
          </Avatar>
        );
      case "post":
        return (
          <div className="w-10 h-10 rounded-md bg-[#00623B] flex items-center justify-center text-white font-semibold">
            P
          </div>
        );
      case "tag":
        return (
          <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-600">
            #
          </div>
        );
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      <Search
        placeholder="Search users, posts, or tags..."
        value={query}
        onChange={handleSearchChange}
        onFocus={() => query && setShowResults(true)}
        prefix={<SearchOutlined className="text-gray-400" />}
        suffix={
          query && (
            <CloseOutlined
              className="text-gray-400 cursor-pointer hover:text-gray-600"
              onClick={handleClear}
            />
          )
        }
        className="search-bar"
        size="large"
      />

      {/* Search Results Dropdown */}
      {showResults && (query || results.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-[500px] overflow-y-auto z-[9999]">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Spin />
            </div>
          ) : results.length === 0 ? (
            <div className="py-8">
              <Empty
                description="No results found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          ) : (
            <div className="py-2">
              {/* Users Section */}
              {results.filter((r) => r.type === "user").length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Users
                  </div>
                  {results
                    .filter((r) => r.type === "user")
                    .map((result) => (
                      <Link
                        key={result.id}
                        href={result.link}
                        onClick={handleResultClick}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {getResultIcon(result)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {result.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {result.subtitle}
                            </div>
                            {result.metadata && (
                              <div className="text-xs text-gray-400 mt-1">
                                📍 {result.metadata}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                </div>
              )}

              {/* Posts Section */}
              {results.filter((r) => r.type === "post").length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Posts
                  </div>
                  {results
                    .filter((r) => r.type === "post")
                    .map((result) => (
                      <Link
                        key={result.id}
                        href={result.link}
                        onClick={handleResultClick}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {getResultIcon(result)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">
                              {result.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-500">
                                {result.subtitle}
                              </span>
                              {result.metadata && (
                                <span className="text-xs text-gray-400">
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

              {/* Tags Section */}
              {results.filter((r) => r.type === "tag").length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Tags
                  </div>
                  {results
                    .filter((r) => r.type === "tag")
                    .map((result) => (
                      <Link
                        key={result.id}
                        href={result.link}
                        onClick={handleResultClick}
                        className="block px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {getResultIcon(result)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-[#00623B]">
                              {result.title}
                            </div>
                            <div className="text-sm text-gray-500">
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
