"use client"

import { useContext } from "react"
import Link from "next/link"
import { AuthContext } from "@/app/providers/AuthProvider"

export default function PublicNavActions() {
  const auth = useContext(AuthContext)
  const isAuth = auth?.isAuthenticated ?? false
  const isLoading = auth?.isLoading ?? true

  if (isLoading) {
    return <div className="w-32 h-5 bg-bg-elevated rounded animate-pulse" />
  }

  if (isAuth) {
    return (
      <Link
        href="/home"
        className="text-sm font-semibold bg-primary text-text-inverse px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity"
      >
        View Feed
      </Link>
    )
  }

  return (
    <>
      <Link href="/login" className="text-sm font-semibold text-primary hover:opacity-80 transition-opacity">
        Sign In
      </Link>
      <Link
        href="/register"
        className="text-sm font-semibold bg-primary text-text-inverse px-4 py-1.5 rounded-md hover:opacity-90 transition-opacity"
      >
        Sign Up
      </Link>
    </>
  )
}
