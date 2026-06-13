'use client'

import React from 'react'

type StatusDotVariant = 'success' | 'warning' | 'error' | 'info'

export interface AppStatusDotProps {
  variant?: StatusDotVariant
  pulse?: boolean
  className?: string
}

const variantStyles: Record<StatusDotVariant, string> = {
  success: 'bg-success-text',
  warning: 'bg-warning-text',
  error: 'bg-error-text',
  info: 'bg-info-text',
}

const AppStatusDot = React.forwardRef<HTMLSpanElement, AppStatusDotProps>(
  ({ variant = 'info', pulse = false, className = '' }, ref) => {
    return (
      <span
        ref={ref}
        className={`inline-block w-2 h-2 rounded-circle ${variantStyles[variant]} ${pulse ? 'animate-pulse' : ''} ${className}`}
        role="status"
        aria-label={`${variant} status`}
      />
    )
  }
)

AppStatusDot.displayName = 'AppStatusDot'

export { AppStatusDot }
