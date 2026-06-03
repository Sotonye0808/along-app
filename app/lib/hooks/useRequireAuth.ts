'use client'

import { useContext } from 'react'
import { AuthContext } from '@/app/providers/AuthProvider'

export function useRequireAuth() {
  const ctx = useContext(AuthContext)
  const requireAuth = (action: string): boolean => {
    if (!ctx) return false
    return ctx.requireAuth(action)
  }
  return { requireAuth, isGuest: ctx?.isGuest ?? false, isAuthenticated: ctx?.isAuthenticated ?? false }
}
