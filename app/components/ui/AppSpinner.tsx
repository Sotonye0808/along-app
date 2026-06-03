'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

export interface AppSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  color?: string
}

const sizeMap: Record<string, number> = {
  sm: 16,
  md: 24,
  lg: 32,
}

const AppSpinner = React.forwardRef<SVGSVGElement, AppSpinnerProps>(
  ({ size = 'md', className = '', color }, ref) => {
    return (
      <Loader2
        ref={ref}
        size={sizeMap[size]}
        className={`animate-spin-slow shrink-0 ${color ? '' : 'text-text-muted'} ${className}`}
        style={color ? { color } : undefined}
      />
    )
  }
)

AppSpinner.displayName = 'AppSpinner'

export { AppSpinner }
