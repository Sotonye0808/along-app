'use client'

import React from 'react'
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

export interface AppAlertProps {
  variant?: AlertVariant
  title?: string
  description?: string
  icon?: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
  children?: React.ReactNode
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-info text-info-text border-info-border',
  success: 'bg-success text-success-text border-success-border',
  warning: 'bg-warning text-warning-text border-warning-border',
  error: 'bg-error text-error-text border-error-border',
}

const defaultIcons: Record<AlertVariant, React.ReactNode> = {
  info: <Info size={18} />,
  success: <CheckCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <AlertCircle size={18} />,
}

const AppAlert = React.forwardRef<HTMLDivElement, AppAlertProps>(
  ({ variant = 'info', title, description, icon, dismissible = false, onDismiss, className = '', children }, ref) => {
    const [visible, setVisible] = React.useState(true)

    if (!visible) return null

    const handleDismiss = () => {
      setVisible(false)
      onDismiss?.()
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={`relative flex items-start gap-3 rounded-md border px-4 py-3 text-sm animate-fade-slide-up ${variantStyles[variant]} ${className}`}
      >
        <span className="shrink-0 mt-0.5">{icon ?? defaultIcons[variant]}</span>
        <div className="flex-1 min-w-0">
          {title && <p className="font-semibold">{title}</p>}
          {(description || children) && (
            <div className="mt-0.5">{description || children}</div>
          )}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 p-0.5 rounded-sm transition-opacity duration-fast hover:opacity-70 cursor-pointer"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        )}
      </div>
    )
  }
)

AppAlert.displayName = 'AppAlert'

export { AppAlert }
