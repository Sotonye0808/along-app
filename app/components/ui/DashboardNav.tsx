"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import {
  Home, Compass, MapPin, Bookmark, User,
  Shield, ShieldCheck,
  PanelLeftClose, PanelRight,
  Settings, Navigation,
} from "lucide-react"
import { useAuth } from "@/app/hooks/useAuth"
import { filterNavItems } from "@/app/lib/config/navigation"
import AppLogo from "./AppLogo"

const ShareRouteModal = dynamic(
  () => import("@/app/components/features/posts/ShareRouteModal"),
  { ssr: false }
)

const MOBILE_TABS = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Share Route", href: "/home?share=true", icon: MapPin, isFab: true },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { label: "Profile", href: "/profile", icon: User },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { user, isGuest } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const mainNavItems = filterNavItems(user?.role ?? "user", "main")

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home"
    if (href === "/profile") return pathname.startsWith("/profile")
    return pathname.startsWith(href)
  }

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-60"

  const handleShareSubmit = useCallback(() => {
    setShowShareModal(false)
  }, [])

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed lg:hidden bottom-0 left-0 right-0 z-20 bg-bg-card/88 backdrop-blur-xl border-t border-border flex items-center justify-around h-16 px-2">
        {MOBILE_TABS.map((tab) => {
          if (tab.isFab) {
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className="w-14 h-14 rounded-full bg-primary text-white grid place-items-center -mt-5 shadow-primary shadow-lg transition-transform hover:scale-105"
                aria-label={tab.label}
              >
                <MapPin className="w-6 h-6" />
              </Link>
            )
          }
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 min-w-[48px] transition-colors ${
                active ? "text-primary" : "text-text-muted"
              }`}
            >
              <tab.icon className={`w-5 h-5 ${active ? "stroke-primary" : ""}`} />
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 sticky top-0 h-screen bg-bg-card border-r border-border transition-all duration-200 relative ${sidebarWidth}`}
      >
        {/* Sidebar Brand */}
        <div className={`flex items-center pt-6 pb-4 ${sidebarCollapsed ? "justify-center px-2" : "px-5"}`}>
          {sidebarCollapsed ? (
            <AppLogo size="sm" variant="icon" showText={false} linkTo="/home" />
          ) : (
            <Link href="/home">
              <AppLogo size="sm" variant="icon" linkTo="" />
            </Link>
          )}
        </div>

        {/* Collapse Toggle - floating on right border */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-[28px] z-10 w-6 h-6 rounded-circle bg-bg-card border border-border grid place-items-center text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-colors shadow-sm cursor-pointer"
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelRight className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
        </button>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2 py-2 overflow-y-auto">
          {/* Share Route - always first, opens modal */}
          {!isGuest && (
            <button
              onClick={() => setShowShareModal(true)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-elevated hover:text-text-primary transition-colors w-full text-left cursor-pointer ${
                sidebarCollapsed ? "justify-center px-0" : ""
              }`}
              title={sidebarCollapsed ? "Share Route" : undefined}
            >
              <Navigation className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">Share Route</span>}
            </button>
          )}

          {!sidebarCollapsed && !isGuest && <div className="h-px bg-border my-1 mx-3" />}

          {mainNavItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-muted text-primary"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? "stroke-primary" : ""}`} />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )
          })}

          {user?.role === "admin" && (
            <>
              <div className="h-px bg-border my-2 mx-3" />
              {!sidebarCollapsed && (
                <div className="text-[11px] font-medium tracking-wider uppercase text-text-muted px-3 mb-1">
                  Admin
                </div>
              )}
              <Link
                href="/admin"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-primary-muted text-primary"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                title={sidebarCollapsed ? "Dashboard" : undefined}
              >
                <Shield className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>Dashboard</span>}
              </Link>
              <Link
                href="/admin/posts"
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/posts")
                    ? "bg-primary-muted text-primary"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
                title={sidebarCollapsed ? "Moderation" : undefined}
              >
                <ShieldCheck className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>Moderation</span>}
              </Link>
            </>
          )}
        </nav>

        {/* Sidebar User Section */}
        <div className={`flex items-center py-4 border-t border-border ${sidebarCollapsed ? "justify-center px-2 gap-1" : "gap-2.5 px-5"}`}>
          {isGuest ? (
            <Link
              href="/login"
              className={`flex items-center gap-2 text-sm font-medium text-primary hover:underline ${sidebarCollapsed ? "flex-col gap-1" : ""}`}
              title={sidebarCollapsed ? "Sign In" : undefined}
            >
              <User className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span>Sign In</span>}
            </Link>
          ) : (
            <>
              <Link
                href={`/profile/${user?.userName}`}
                className={`flex items-center ${sidebarCollapsed ? "" : "gap-2.5 min-w-0 flex-1"}`}
                title={sidebarCollapsed ? `${user?.firstName} ${user?.lastName}` : undefined}
              >
                <div className="w-8 h-8 rounded-full bg-primary-muted text-primary grid place-items-center text-sm font-bold shrink-0">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                {!sidebarCollapsed && (
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {user?.firstName} {user?.lastName}
                    </div>
                    {user?.role && (
                      <span className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-info text-info-text uppercase tracking-wide">
                        {user.role}
                      </span>
                    )}
                  </div>
                )}
              </Link>
              <Link
                href="/profile"
                className="shrink-0 w-8 h-8 rounded-full grid place-items-center text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-colors"
                aria-label="Settings"
                title={sidebarCollapsed ? "Settings" : undefined}
              >
                <Settings className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </aside>

      {/* Share Route Modal */}
      {showShareModal && (
        <ShareRouteModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          onSubmit={handleShareSubmit}
        />
      )}
    </>
  )
}
