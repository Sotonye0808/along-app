'use client'

import React from 'react'

interface AppSkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

function AppSkeleton({ className = '', variant = 'text', width, height }: AppSkeletonProps) {
  return (
    <div
      className={`bg-bg-elevated rounded-md animate-shimmer ${variant === 'circular' ? 'rounded-circle' : ''} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height ?? (variant === 'text' ? '16px' : undefined),
        background: 'linear-gradient(90deg, var(--color-bg-elevated) 25%, var(--color-border) 50%, var(--color-bg-elevated) 75%)',
        backgroundSize: '200% 100%',
      }}
      aria-hidden="true"
    />
  )
}

function PostCardSkeleton() {
  return (
    <div className="p-4 bg-bg-card rounded-lg shadow-sm space-y-3" aria-hidden="true">
      <div className="flex items-center gap-3">
        <AppSkeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <AppSkeleton width="60%" />
          <AppSkeleton width="40%" />
        </div>
      </div>
      <AppSkeleton width="80%" height={14} />
      <div className="space-y-2 pl-3 border-l-2 border-border">
        <AppSkeleton width="100%" />
        <AppSkeleton width="100%" />
        <AppSkeleton width="70%" />
      </div>
      <AppSkeleton variant="rectangular" width="100%" height={180} className="rounded-lg" />
      <div className="flex gap-4 pt-1">
        <AppSkeleton width={50} />
        <AppSkeleton width={50} />
        <AppSkeleton width={50} />
      </div>
    </div>
  )
}

function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3" aria-hidden="true">
      <AppSkeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <AppSkeleton width="50%" />
        <AppSkeleton width="30%" />
      </div>
    </div>
  )
}

function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-3" aria-hidden="true">
      <AppSkeleton width="12%" />
      <AppSkeleton width="25%" />
      <AppSkeleton width="18%" />
      <AppSkeleton width="22%" />
      <AppSkeleton width="15%" />
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 bg-bg-card rounded-lg shadow-sm" aria-hidden="true">
      <AppSkeleton variant="rectangular" width={40} height={40} className="rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <AppSkeleton width="60%" />
        <AppSkeleton width="40%" />
      </div>
    </div>
  )
}

function MapSkeleton() {
  return (
    <div className="relative w-full h-[280px] bg-bg-elevated rounded-lg overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 animate-shimmer"
        style={{
          background: 'linear-gradient(90deg, var(--color-bg-elevated) 25%, var(--color-border) 50%, var(--color-bg-elevated) 75%)',
          backgroundSize: '200% 100%',
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <svg className="w-12 h-12 text-text-muted opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
        </svg>
      </div>
    </div>
  )
}

export { AppSkeleton, PostCardSkeleton, UserCardSkeleton, TableRowSkeleton, StatCardSkeleton, MapSkeleton }
export type { AppSkeletonProps }
