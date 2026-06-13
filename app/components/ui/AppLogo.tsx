import Link from 'next/link'
import Image from 'next/image'
import { LOGO_CONFIG } from '@/app/lib/config/logo'

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero'
  showText?: boolean
  linkTo?: string
  className?: string
  variant?: 'icon' | 'full'
}

export default function AppLogo({
  size = 'md',
  showText = true,
  linkTo = '/',
  className = '',
  variant = 'icon',
}: AppLogoProps) {
  const px = LOGO_CONFIG.sizes[size]

  const iconLogo = (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="rounded-full overflow-hidden shrink-0">
        <Image src={LOGO_CONFIG.iconUrl} alt="Along" width={px} height={px} />
      </div>
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

  const fullLogo = (
    <div className={`inline-flex items-center ${className}`}>
      <div className="rounded-full overflow-hidden shrink-0">
        <Image src={LOGO_CONFIG.logoUrl} alt="Along" width={px * 2} height={px * 2} />
      </div>
    </div>
  )

  const content = variant === 'full' ? fullLogo : iconLogo

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>
  }
  return content
}
