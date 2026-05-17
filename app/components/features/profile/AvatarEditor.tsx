"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { AVATAR_STYLES, buildAvatarUrl } from "@/lib/config/avatar";
import type { AvatarConfig, AvatarStyle } from "@/lib/config/avatar";
import { AppButton } from "@/components/ui/AppButton";
import { AppModal } from "@/components/ui/AppModal";
import { AppSpinner } from "@/components/ui/AppSpinner";

interface AvatarEditorProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentConfig?: AvatarConfig | null;
  onSaved: (config: AvatarConfig) => void;
}

const BG_COLORS = [
  { value: "#dbeafe", className: "bg-[#dbeafe]" },
  { value: "#dcfce7", className: "bg-[#dcfce7]" },
  { value: "#fef9c3", className: "bg-[#fef9c3]" },
  { value: "#fce7f3", className: "bg-[#fce7f3]" },
  { value: "#ede9fe", className: "bg-[#ede9fe]" },
  { value: "#fee2e2", className: "bg-[#fee2e2]" },
  { value: "#f0f9ff", className: "bg-[#f0f9ff]" },
  { value: "#f5f5f5", className: "bg-[#f5f5f5]" },
];

export function AvatarEditor({
  open,
  onClose,
  userId,
  userName,
  currentConfig,
  onSaved,
}: AvatarEditorProps): React.ReactElement {
  const [selectedStyle, setSelectedStyle] = useState<AvatarStyle>(
    (currentConfig?.style as AvatarStyle) ?? "adventurer-neutral",
  );
  const [selectedBg, setSelectedBg] = useState<string>(
    currentConfig?.backgroundColor ?? "#dbeafe",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const seed = userName || "along-user";

  const previewConfig: AvatarConfig = useMemo(
    () => ({
      style: selectedStyle,
      seed,
      backgroundColor: selectedBg,
      radius: 50,
    }),
    [selectedStyle, seed, selectedBg],
  );

  const previewUrl = useMemo(
    () => buildAvatarUrl(previewConfig),
    [previewConfig],
  );

  async function handleSave(): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/${userId}/avatar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(previewConfig),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to save avatar");
      }

      onSaved(previewConfig);
      onClose();
    } catch (err) {
      const maybeError = err as { message?: string };
      setError(maybeError.message ?? "Failed to save avatar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Customise avatar"
      subtitle="Pick a style and colour for your profile picture"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <AppButton variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </AppButton>
          <AppButton
            onClick={() => void handleSave()}
            loading={saving}
            icon={Check}>
            Save avatar
          </AppButton>
        </div>
      }>
      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Left panel — style grid */}
        <div className="flex-1">
          <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
            Style
          </p>
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_STYLES.map((style) => {
              const thumbUrl = buildAvatarUrl({
                style,
                seed,
                backgroundColor: selectedBg,
                radius: 50,
              });
              const isSelected = style === selectedStyle;
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => setSelectedStyle(style)}
                  className={[
                    "relative flex flex-col items-center gap-1 rounded-[var(--radius-card)] border-2 p-1.5 transition-all",
                    isSelected
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--color-border)] hover:border-[var(--color-primary)]/40",
                  ].join(" ")}>
                  <div className="relative h-14 w-14 overflow-hidden rounded-full">
                    <Image
                      src={thumbUrl}
                      alt={style}
                      fill
                      sizes="56px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <span className="text-[10px] text-center leading-tight text-[var(--color-text-secondary)] truncate w-full">
                    {style.replace(/-/g, " ")}
                  </span>
                  {isSelected ? (
                    <span className="absolute right-1 top-1 rounded-full bg-[var(--color-primary)] p-0.5 text-white">
                      <Check size={10} aria-hidden="true" />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right panel — preview + bg colour */}
        <div className="flex w-full flex-col items-center gap-4 sm:w-48">
          <p className="text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide self-start">
            Preview
          </p>
          <div className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-[var(--color-border)]">
            {saving ? (
              <div className="flex h-full w-full items-center justify-center">
                <AppSpinner />
              </div>
            ) : (
              <Image
                src={previewUrl}
                alt="Avatar preview"
                fill
                sizes="112px"
                className="object-cover"
                unoptimized
              />
            )}
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
              Background
            </p>
            <div className="grid grid-cols-4 gap-2">
              {BG_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  aria-label={`Background colour ${color.value}`}
                  onClick={() => setSelectedBg(color.value)}
                  className={[
                    "h-7 w-7 rounded-full border-2 transition-all",
                    color.className,
                    selectedBg === color.value
                      ? "border-[var(--color-primary)] scale-110"
                      : "border-transparent hover:border-[var(--color-text-muted)]",
                  ].join(" ")}
                />
              ))}
            </div>
          </div>

          {error ? (
            <p className="text-xs text-[var(--color-error-text)]">{error}</p>
          ) : null}
        </div>
      </div>
    </AppModal>
  );
}
