import Link from 'next/link'
import { LOGO_CONFIG } from '@/app/lib/config/logo'

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero'
  showText?: boolean
  linkTo?: string
  className?: string
}

export default function AppLogo({
  size = 'md',
  showText = true,
  linkTo = '/',
  className = '',
}: AppLogoProps) {
  const px = LOGO_CONFIG.sizes[size]
  const content = (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill={LOGO_CONFIG.brandColor}
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Along logo"
      >
        <path d={LOGO_CONFIG.iconPath} />
      </svg>
      {showText && (
        <span
          className="font-bold tracking-tight"
          style={{
            fontSize: `${px * 0.5}px`,
            color: LOGO_CONFIG.brandColor,
            lineHeight: 1,
          }}
        >
          {LOGO_CONFIG.wordmark}
        </span>
      )}
    </div>
  )
  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>
  }
  return content
}
