'use client'

import React from 'react'

export interface AppProgressProps {
  value: number
  max?: number
  label?: string
  size?: 'sm' | 'md'
  gradient?: boolean
  className?: string
  showValue?: boolean
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2',
}

const AppProgress = React.forwardRef<HTMLDivElement, AppProgressProps>(
  ({ value, max = 100, label, size = 'md', gradient = false, className = '', showValue = false }, ref) => {
    const clampedValue = Math.min(Math.max(value, 0), max)
    const percent = max > 0 ? (clampedValue / max) * 100 : 0

    return (
      <div ref={ref} className={`flex flex-col gap-1 ${className}`}>
        {(label || showValue) && (
          <div className="flex items-center justify-between text-xs text-text-secondary">
            {label && <span>{label}</span>}
            {showValue && <span>{Math.round(percent)}%</span>}
          </div>
        )}
        <div className={`w-full rounded-pill bg-bg-elevated overflow-hidden ${sizeStyles[size]}`} role="progressbar" aria-valuenow={clampedValue} aria-valuemin={0} aria-valuemax={max}>
          <div
            className={`h-full rounded-pill transition-all duration-moderate ${gradient ? 'bg-gradient-to-r from-primary-light to-primary' : 'bg-primary'}`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    )
  }
)

AppProgress.displayName = 'AppProgress'

export { AppProgress }
