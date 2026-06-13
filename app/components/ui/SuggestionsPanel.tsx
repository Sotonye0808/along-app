"use client"

import Link from "next/link"

const SUGGESTED_USERS = [
  { initials: "KO", name: "Kelechi Okafor", handle: "kelechi_o", color: "bg-info text-info-text" },
  { initials: "BS", name: "Blessing Samuel", handle: "blessing_s", color: "bg-warning text-warning-text" },
  { initials: "IM", name: "Ibrahim Musa", handle: "ibrahim_m", color: "bg-success text-success-text" },
]

const TRENDING_TAGS = [
  "lagos", "abuja", "portharcourt", "brt", "keke", "carpool", "commute", "nightride",
]

const EVENTS = [
  { title: "Lagos Transport Summit", date: "Jun 15", location: "Eko Hotel" },
  { title: "Oshodi Market Day", date: "Jun 18", location: "Oshodi" },
]

export default function SuggestionsPanel() {
  return (
    <aside className="hidden xl:block w-[280px] shrink-0 py-4 pr-4 pl-2 space-y-4">
      {/* Who to follow */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 text-sm font-semibold border-b border-border">
          Who to follow
        </div>
        {SUGGESTED_USERS.map((u) => (
          <div key={u.handle} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-bg-elevated transition-colors">
            <div className={`w-10 h-10 rounded-full grid place-items-center text-sm font-bold shrink-0 ${u.color}`}>
              {u.initials}
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/profile/${u.handle}`} className="text-sm font-semibold no-underline hover:underline text-text-primary">
                {u.name}
              </Link>
              <div className="text-xs text-text-secondary">@{u.handle}</div>
            </div>
            <button className="shrink-0 h-7 px-3 rounded-md text-xs font-semibold bg-transparent text-primary border border-primary hover:bg-primary hover:text-white transition-colors cursor-pointer">
              Follow
            </button>
          </div>
        ))}
      </div>

      {/* Trending tags */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 text-sm font-semibold border-b border-border">
          Trending tags
        </div>
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {TRENDING_TAGS.map((tag) => (
            <Link
              key={tag}
              href={`/explore?tag=${encodeURIComponent(tag)}`}
              className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-bg-elevated border border-border text-text-secondary no-underline hover:bg-primary-muted hover:text-primary hover:border-primary-muted transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </div>

      {/* Events near you */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 text-sm font-semibold border-b border-border">
          Events near you
        </div>
        {EVENTS.map((ev) => (
          <div key={ev.title} className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-elevated transition-colors">
            <div className="w-9 h-9 rounded-lg bg-bg-elevated flex items-center justify-center text-text-muted shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold">{ev.title}</div>
              <div className="text-xs text-text-muted">{ev.date} · {ev.location}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
