import Link from "next/link"
import { Compass } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-bg-base">
      <div className="text-center max-w-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mx-auto mb-4">
          <Compass size={32} className="text-text-muted" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">Page not found</h1>
        <p className="text-sm text-text-secondary mb-6">
          This page doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center h-10 px-5 rounded-md bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
