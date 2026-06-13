'use client'

import Link from 'next/link'
import { LogIn, UserPlus } from 'lucide-react'

export default function GuestBanner() {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-text-primary">
          <span className="font-semibold">Browse as a guest.</span>{' '}
          <span className="text-text-secondary">Sign up to share routes, earn rewards, and join the community.</span>
        </p>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5"
          >
            <LogIn size={14} /> Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1 text-xs font-medium bg-primary text-text-inverse px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
          >
            <UserPlus size={14} /> Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
