'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

export interface AppTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode
  error?: string
  wrapperClassName?: string
  autoHeight?: boolean
}

const AppTextarea = React.forwardRef<HTMLTextAreaElement, AppTextareaProps>(
  ({ label, error, wrapperClassName = '', className = '', id, autoHeight = false, onChange, ...props }, ref) => {
    const labelStr = typeof label === 'string' ? label : '';
    const inputId = id ?? (labelStr ? labelStr.toLowerCase().replace(/\s+/g, '-') : undefined)

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (autoHeight) {
          e.target.style.height = 'auto'
          e.target.style.height = `${e.target.scrollHeight}px`
        }
        onChange?.(e)
      },
      [autoHeight, onChange]
    )

    return (
      <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={`min-h-[80px] w-full border-[1.5px] rounded-sm bg-bg-base px-[12px] py-[10px] text-sm text-text-primary
            placeholder:text-text-muted transition-all duration-fast resize-y
            focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,98,59,0.12)]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-elevated
            ${autoHeight ? 'resize-none overflow-hidden' : ''}
            ${error ? 'border-error-border focus:border-error-border focus:shadow-[0_0_0_3px_rgba(127,29,29,0.12)]' : 'border-border'}
            ${className}
          `}
          aria-invalid={error ? 'true' : undefined}
          onChange={handleChange}
          {...props}
        />
        {error && (
          <span className="flex items-center gap-1 text-xs text-error-text" role="alert">
            <AlertCircle size={12} />
            {error}
          </span>
        )}
      </div>
    )
  }
)

AppTextarea.displayName = 'AppTextarea'

export { AppTextarea }
