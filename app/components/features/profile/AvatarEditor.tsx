'use client'

import React, { useState } from 'react'
import { Check } from 'lucide-react'
import { AppModal, AppAvatar, AppButton } from '@/app/components/ui'
import { AVATAR_STYLES, buildAvatarUrl } from '@/app/lib/config/avatar'
import type { AvatarConfig } from '@/app/lib/types'

interface AvatarEditorProps {
  open: boolean
  onClose: () => void
  currentConfig?: AvatarConfig
  userName?: string
  onSave: (config: AvatarConfig) => Promise<void>
}

function AvatarEditor({ open, onClose, currentConfig, userName, onSave }: AvatarEditorProps) {
  const [config, setConfig] = useState<AvatarConfig>(
    currentConfig ?? { style: 'avataaars', seed: userName }
  )
  const [saving, setSaving] = useState(false)

  const previewUrl = buildAvatarUrl(config)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(config)
      onClose()
    } catch {
      // error handled by parent
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppModal open={open} onClose={onClose} size="default" title="Customize Avatar">
      <div className="flex gap-6 py-4">
        <div className="flex-1">
          <label className="text-xs font-medium text-text-secondary mb-2 block uppercase tracking-wider">
            Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_STYLES.map((style) => {
              const styleUrl = buildAvatarUrl({ ...config, style: style.value })
              const selected = config.style === style.value
              return (
                <button
                  key={style.value}
                  onClick={() => setConfig((prev) => ({ ...prev, style: style.value }))}
                  className={`relative flex flex-col items-center gap-1.5 p-2.5 radius-lg border-2 cursor-pointer transition-all duration-fast bg-transparent font-sans ${
                    selected
                      ? 'border-primary bg-primary-muted'
                      : 'border-border hover:border-primary-light'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={styleUrl}
                    alt={style.label}
                    className="w-10 h-10 rounded-circle object-cover"
                  />
                  <span className="text-[11px] font-medium text-text-secondary">{style.label}</span>
                  {selected && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-circle bg-primary flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
        <div className="w-40 flex flex-col items-center gap-3 pt-6">
          <label className="text-xs font-medium text-text-secondary block uppercase tracking-wider">
            Preview
          </label>
          <AppAvatar
            src={previewUrl}
            alt="Preview"
            size={120}
            linkToProfile={false}
          />
          <div className="flex flex-col items-center gap-1.5 w-full">
            <label className="text-xs text-text-secondary">Seed</label>
            <input
              type="text"
              value={config.seed ?? ''}
              onChange={(e) => setConfig((prev) => ({ ...prev, seed: e.target.value }))}
              placeholder="Name or seed"
              className="w-full h-8 px-2 text-xs border border-border radius-sm outline-none bg-bg-base text-text-primary focus:border-primary"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-4 border-t border-border">
        <AppButton variant="ghost" onClick={onClose}>Cancel</AppButton>
        <AppButton variant="primary" onClick={handleSave} loading={saving}>
          Save Avatar
        </AppButton>
      </div>
    </AppModal>
  )
}

export { AvatarEditor }
