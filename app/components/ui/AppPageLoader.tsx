'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

export interface AppPageLoaderProps {
  text?: string
  className?: string
}

const AppPageLoader = React.forwardRef<HTMLDivElement, AppPageLoaderProps>(
  ({ text = 'Loading...', className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`fixed inset-0 flex flex-col items-center justify-center gap-4 bg-bg-base z-50 ${className}`}
        role="status"
        aria-live="polite"
      >
        <Loader2 size={32} className="animate-spin-slow text-primary" />
        <p className="text-sm text-text-secondary">{text}</p>
      </div>
    )
  }
)

AppPageLoader.displayName = 'AppPageLoader'

export { AppPageLoader }
