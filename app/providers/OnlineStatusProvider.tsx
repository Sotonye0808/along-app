'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { offlineQueue } from '@/app/lib/services/offlineQueue'

interface OnlineStatusContextValue {
  isOnline: boolean
}

const OnlineStatusContext = createContext<OnlineStatusContextValue>({ isOnline: true })

export function useOnlineStatus() {
  return useContext(OnlineStatusContext)
}

export function OnlineStatusProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    offlineQueue.flush().catch(() => {})
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
  }, [])

  useEffect(() => {
    setIsOnline(navigator.onLine)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [handleOnline, handleOffline])

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  )
}
