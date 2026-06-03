'use client'

import React from 'react'

export interface AppDividerProps {
  className?: string
  variant?: 'solid' | 'dashed'
  children?: React.ReactNode
}

const AppDivider = React.forwardRef<HTMLHRElement, AppDividerProps & React.HTMLAttributes<HTMLHRElement>>(
  ({ className = '', variant = 'solid', children, ...props }, ref) => {
    if (children) {
      return (
        <div className={`flex items-center gap-3 w-full ${className}`} role="separator" aria-orientation="horizontal">
          <hr
            ref={ref}
            className={`flex-1 border-border ${variant === 'dashed' ? 'border-dashed' : 'border-solid'}`}
            {...props}
          />
          <span className="text-sm text-text-muted whitespace-nowrap shrink-0">{children}</span>
          <hr
            className={`flex-1 border-border ${variant === 'dashed' ? 'border-dashed' : 'border-solid'}`}
          />
        </div>
      )
    }

    return (
      <hr
        ref={ref}
        className={`w-full border-border ${variant === 'dashed' ? 'border-dashed' : 'border-solid'} ${className}`}
        role="separator"
        aria-orientation="horizontal"
        {...props}
      />
    )
  }
)

AppDivider.displayName = 'AppDivider'

export { AppDivider }
