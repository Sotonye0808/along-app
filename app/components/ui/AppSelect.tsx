'use client'

import React from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'

export interface AppSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface AppSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: React.ReactNode
  error?: string
  wrapperClassName?: string
  options: AppSelectOption[]
  placeholder?: string
  icon?: React.ReactNode
}

const AppSelect = React.forwardRef<HTMLSelectElement, AppSelectProps>(
  ({ label, error, wrapperClassName = '', className = '', id, options, placeholder, icon, ...props }, ref) => {
    const labelStr = typeof label === 'string' ? label : '';
    const inputId = id ?? (labelStr ? labelStr.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none shrink-0">
              {icon}
            </span>
          )}
          <select
            ref={ref}
            id={inputId}
            className={`h-[40px] w-full border-[1.5px] rounded-sm bg-bg-base px-[12px] text-sm text-text-primary
              appearance-none cursor-pointer transition-all duration-fast
              focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,98,59,0.12)]
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-elevated
              ${error ? 'border-error-border focus:border-error-border focus:shadow-[0_0_0_3px_rgba(127,29,29,0.12)]' : 'border-border'}
              ${icon ? 'pl-10' : ''}
              pr-10
              ${className}
            `}
            aria-invalid={error ? 'true' : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            <ChevronDown size={16} />
          </span>
        </div>
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

AppSelect.displayName = 'AppSelect'

export { AppSelect }
