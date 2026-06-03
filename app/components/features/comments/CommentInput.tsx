"use client"

import Link from "next/link"
import { useState, useRef } from "react"
import { Send } from "lucide-react"

interface CommentInputProps {
  userName: string
  onSubmit: (text: string) => void
}

export default function CommentInput({ userName, onSubmit }: CommentInputProps) {
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-start gap-2.5 mb-4">
      <Link href={`/profile/${userName}`} className="no-underline">
        <div className="w-8 h-8 rounded-circle bg-primary-muted flex items-center justify-center text-xs font-bold text-primary shrink-0">
          {initials}
        </div>
      </Link>
      <div className="flex-1 flex flex-col gap-1.5">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Add a comment... (use @ to mention)"
          className="w-full min-h-[60px] px-3 py-2.5 border border-border radius-sm text-sm font-sans outline-none resize-none bg-bg-base text-text-primary transition-colors duration-fast focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,98,59,0.12)] placeholder:text-text-muted"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="w-9 h-9 rounded-circle bg-primary text-white flex items-center justify-center shrink-0 border-none cursor-pointer transition-colors duration-fast hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send comment"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
