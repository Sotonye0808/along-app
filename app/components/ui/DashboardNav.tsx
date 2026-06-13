"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import {
  Home, Compass, MapPin, Bookmark, User,
  Bell, Shield, ShieldCheck,
  Search, PanelLeftClose, PanelLeft,
  Settings, ChevronLeft, ChevronRight,
} from "lucide-react"
import { useAuth } from "@/app/hooks/useAuth"
import { filterNavItems } from "@/app/lib/config/navigation"
import AppLogo from "./AppLogo"

const MOBILE_TABS = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Share Route", href: "/home", icon: MapPin, isFab: true },
  { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { label: "Profile", href: "/profile", icon: User },
]

export default function DashboardNav() {
  const pathname = usePathname()
  const { user, isGuest } = useAuth()
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const mainNavItems = filterNavItems(user?.role ?? "user", "main")

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home"
    if (href === "/profile") return pathname.startsWith("/profile")
    return pathname.startsWith(href)
  }

  const sidebarWidth = sidebarCollapsed ? "w-16" : "w-60"

  return (
    <>
      {/* Mobile Top Bar */}
      <nav className="flex lg:hidden items-center justify-between h-14 px-4 bg-bg-card border-b border-border sticky top-0 z-20">
        <AppLogo size="sm" variant="icon" linkTo="/home" />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="w-9 h-9 rounded-full grid place-items-center text-text-secondary hover:bg-bg-elevated transition-colors"
            aria-label="Open menu"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
          <Link
            href="/explore"
            className="w-9 h-9 rounded-full grid place-items-center text-text-secondary hover:bg-bg-elevated transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </Link>
          {!isGuest && (
            <Link
              href="/notifications"
              className="w-9 h-9 rounded-full grid place-items-center text-text-secondary hover:bg-bg-elevated transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>
          )}
        </div>
      </nav>

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
        className={`hidden lg:flex flex-col shrink-0 h-full min-h-screen bg-bg-card border-r border-border transition-all duration-200 ${sidebarWidth}`}
      >
        {/* Sidebar Brand + Toggle */}
        <div className={`flex items-center ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-5"} pt-6 pb-4`}>
          {sidebarCollapsed ? (
            <div className="w-8 h-8">
              <AppLogo size="sm" variant="icon" linkTo="/home" />
            </div>
          ) : (
            <Link href="/home">
              <AppLogo size="sm" variant="icon" linkTo="" />
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-7 h-7 rounded-md grid place-items-center text-text-muted hover:bg-bg-elevated hover:text-text-secondary transition-colors"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 flex flex-col gap-0.5 px-2 py-2">
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
        <div className={`flex items-center py-4 border-t border-border ${sidebarCollapsed ? "justify-center px-2" : "gap-2.5 px-5"}`}>
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
              {!sidebarCollapsed && (
                <Link
                  href="/profile"
                  className="ml-auto shrink-0 w-8 h-8 rounded-full grid place-items-center text-text-muted hover:text-text-secondary hover:bg-bg-elevated transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-4 h-4" />
                </Link>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed lg:hidden top-0 left-0 z-40 h-full w-60 bg-bg-card border-r border-border flex flex-col transition-transform duration-200 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <Link href="/home">
            <AppLogo size="sm" variant="icon" linkTo="" />
          </Link>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="w-8 h-8 rounded-full grid place-items-center text-text-muted hover:bg-bg-elevated transition-colors"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 flex flex-col gap-0.5 px-3 py-2">
          {mainNavItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary-muted text-primary"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "stroke-primary" : ""}`} />
                {item.label}
              </Link>
            )
          })}
          {user?.role === "admin" && (
            <>
              <div className="h-px bg-border my-3 mx-4" />
              <div className="text-[11px] font-medium tracking-wider uppercase text-text-muted px-4 mb-1">
                Admin
              </div>
              <Link
                href="/admin"
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-primary-muted text-primary"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                }`}
              >
                <Shield className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="/admin/posts"
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin/posts")
                    ? "bg-primary-muted text-primary"
                    : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
                Moderation
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-2.5 px-5 py-4 border-t border-border mt-auto">
          {isGuest ? (
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <User className="w-5 h-5" />
              Sign In
            </Link>
          ) : (
            <Link
              href={`/profile/${user?.userName}`}
              className="flex items-center gap-2.5 min-w-0"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <div className="w-8 h-8 rounded-full bg-primary-muted text-primary grid place-items-center text-sm font-bold shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
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
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
