"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed lg:bottom-20 bottom-28 right-6 z-50 w-12 h-12 rounded-full bg-primary text-white border-none shadow-primary shadow-lg flex items-center justify-center hover:scale-105 transition-all duration-base cursor-pointer"
    >
      <ArrowUp size={20} />
    </button>
  )
}
