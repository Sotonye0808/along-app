'use client'

import React from 'react'
import Link from 'next/link'
import { BadgeCheck, Star, Award, Trophy } from 'lucide-react'
import { REWARD_TIERS } from '@/app/lib/config/rewards'
import { AppAvatar } from './AppAvatar'

const tierIconMap: Record<string, React.ElementType> = {
  Star,
  Award,
  Trophy,
}

const tierColorMap: Record<string, string> = {
  BRONZE: '#CD7F32',
  SILVER: '#C0C0C0',
  GOLD: '#FFD700',
  PLATINUM: '#E5E4E2',
}

interface UserLabelUser {
  firstName: string
  lastName: string
  userName: string
  avatarConfig?: { style: string; seed?: string; flip?: boolean; backgroundColor?: string }
  avatar?: string
  isVerified?: boolean
  rewardTier?: string
}

interface AppUserLabelProps {
  user: UserLabelUser
  size?: 'sm' | 'md'
  vertical?: boolean
  showHandle?: boolean
  linkToProfile?: boolean
}

function AppUserLabel({
  user,
  size = 'md',
  vertical = false,
  showHandle = true,
  linkToProfile = true,
}: AppUserLabelProps) {
  const avatarSize = size === 'sm' ? 24 : 32
  const displayName = `${user.firstName} ${user.lastName}`

  const tier = user.rewardTier ? REWARD_TIERS[user.rewardTier] : null
  const TierIcon = tier ? tierIconMap[tier.icon] ?? Star : null

  const content = (
    <div
      className={`inline-flex gap-2 ${vertical ? 'flex-col items-center text-center' : 'items-center'}`}
    >
      <AppAvatar
        src={user.avatar}
        alt={displayName}
        size={avatarSize}
        config={user.avatarConfig}
        verified={user.isVerified}
        linkToProfile={false}
        userName={user.userName}
      />
      <div className={vertical ? '' : ''}>
        <div className={`flex items-center gap-1 ${vertical ? 'justify-center' : ''}`}>
          <span className="text-sm font-semibold text-text-primary leading-tight">
            {displayName}
          </span>
          {user.isVerified && (
            <BadgeCheck size={14} className="text-primary shrink-0" />
          )}
          {tier && TierIcon && (
            <TierIcon
              size={12}
              className="shrink-0"
              style={{ color: tierColorMap[user.rewardTier!] ?? tier.color }}
            />
          )}
        </div>
        {showHandle && (
          <p className="text-xs text-text-secondary leading-tight">
            @{user.userName}
          </p>
        )}
      </div>
    </div>
  )

  if (linkToProfile) {
    return (
      <Link
        href={`/profile/${user.userName}`}
        onClick={(e) => e.stopPropagation()}
        className="inline-flex"
      >
        {content}
      </Link>
    )
  }

  return content
}

export { AppUserLabel }
export type { AppUserLabelProps, UserLabelUser }
