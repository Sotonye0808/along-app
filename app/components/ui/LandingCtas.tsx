"use client"

import { useContext } from "react"
import Link from "next/link"
import { AuthContext } from "@/app/providers/AuthProvider"

export function HeroCtas() {
  const auth = useContext(AuthContext)
  const isAuth = auth?.isAuthenticated ?? false
  const isLoading = auth?.isLoading ?? true

  if (isLoading) {
    return <div className="h-12 w-56 bg-white/20 rounded-md animate-pulse mx-auto" />
  }

  if (isAuth) {
    return (
      <Link
        href="/home"
        className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-white text-primary text-base font-semibold hover:shadow-lg transition-shadow"
      >
        View Feed &rarr;
      </Link>
    )
  }

  return (
    <>
      <Link
        href="/register"
        className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-white text-primary text-base font-semibold hover:shadow-lg transition-shadow"
      >
        Get Started &rarr;
      </Link>
      <Link
        href="/login"
        className="inline-flex items-center gap-2 h-12 px-6 rounded-md bg-transparent text-white text-base font-medium border border-white/40 hover:bg-white/10 transition-colors"
      >
        Sign In
      </Link>
    </>
  )
}

export function BottomCta() {
  const auth = useContext(AuthContext)
  const isAuth = auth?.isAuthenticated ?? false
  const isLoading = auth?.isLoading ?? true

  if (isLoading) {
    return <div className="h-12 w-56 bg-white/20 rounded-md animate-pulse mx-auto" />
  }

  if (isAuth) {
    return (
      <Link
        href="/home"
        className="inline-flex items-center gap-2 h-12 px-7 rounded-md bg-white text-primary text-base font-semibold hover:shadow-lg transition-shadow"
      >
        View Feed &rarr;
      </Link>
    )
  }

  return (
    <Link
      href="/register"
      className="inline-flex items-center gap-2 h-12 px-7 rounded-md bg-white text-primary text-base font-semibold hover:shadow-lg transition-shadow"
    >
      Create Free Account &rarr;
    </Link>
  )
}
