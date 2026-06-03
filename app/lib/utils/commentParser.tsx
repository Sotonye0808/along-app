import React from "react"
import Link from "next/link"

export function commentParser(text: string): React.ReactNode {
  const parts = text.split(/(@\w+)/g)
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("@")) {
          const userName = part.slice(1)
          return (
            <Link
              key={index}
              href={`/profile/${userName}`}
              onClick={(e) => e.stopPropagation()}
              className="text-primary font-medium no-underline hover:underline"
            >
              {part}
            </Link>
          )
        }
        return <span key={index}>{part}</span>
      })}
    </>
  )
}
