'use client'

import React, { useCallback, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface RoutePin {
  lat: number
  lng: number
  label: string
  type: 'origin' | 'waypoint' | 'destination'
}

interface RouteStepInputProps {
  value?: RoutePin
  onChange: (pin: RoutePin) => void
  placeholder?: string
  type?: 'origin' | 'waypoint' | 'destination'
  disabled?: boolean
}

const MOCK_SUGGESTIONS = [
  { label: 'Marina, Lagos', lat: 6.4551, lng: 3.3948 },
  { label: 'Yaba, Lagos', lat: 6.5088, lng: 3.3763 },
  { label: 'Ikeja, Lagos', lat: 6.6018, lng: 3.3515 },
  { label: 'Lekki Phase 1, Lagos', lat: 6.4376, lng: 3.4669 },
  { label: 'Victoria Island, Lagos', lat: 6.4281, lng: 3.4216 },
  { label: 'Oshodi, Lagos', lat: 6.5459, lng: 3.3491 },
  { label: 'Surulere, Lagos', lat: 6.4989, lng: 3.3505 },
  { label: 'Mile 2, Lagos', lat: 6.4699, lng: 3.3066 },
]

function RouteStepInput({
  value,
  onChange,
  placeholder = 'Search location...',
  type = 'waypoint',
  disabled = false,
}: RouteStepInputProps) {
  const [query, setQuery] = useState(value?.label ?? '')
  const [suggestions, setSuggestions] = useState<{ label: string; lat: number; lng: number }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setQuery(val)

      if (timerRef.current) clearTimeout(timerRef.current)

      if (val.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setLoading(true)
      timerRef.current = setTimeout(() => {
        const filtered = MOCK_SUGGESTIONS.filter((s) =>
          s.label.toLowerCase().includes(val.toLowerCase())
        )
        setSuggestions(filtered)
        setShowSuggestions(filtered.length > 0)
        setLoading(false)
      }, 300)
    },
    []
  )

  const selectSuggestion = useCallback(
    (suggestion: { label: string; lat: number; lng: number }) => {
      setQuery(suggestion.label)
      setShowSuggestions(false)
      onChange({
        label: suggestion.label,
        lat: suggestion.lat,
        lng: suggestion.lng,
        type,
      })
    },
    [onChange, type]
  )

  return (
    <div className="relative">
      <div className="relative">
        <MapPin
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full h-10 pl-9 pr-3 text-sm border border-border rounded-sm bg-bg-base text-text-primary outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,98,59,0.12)] placeholder:text-text-muted disabled:opacity-50"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-circle animate-spin" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-bg-card border border-border rounded-lg shadow-md max-h-48 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-bg-elevated transition-colors flex items-center gap-2"
              onMouseDown={() => selectSuggestion(s)}
            >
              <MapPin size={14} className="text-text-muted shrink-0" />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { RouteStepInput }
export type { RouteStepInputProps, RoutePin }
