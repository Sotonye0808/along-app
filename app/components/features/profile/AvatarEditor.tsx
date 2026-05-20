"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import {
    AVATAR_STYLE_CONFIGS,
    buildAvatarUrlWithOptions,
    getStyleConfig,
    type StyleConfig,
} from "@/lib/config/avatar";
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

const DEFAULT_BACKGROUND_COLORS = [
    { value: "#dbeafe", label: "Blue" },
    { value: "#dcfce7", label: "Green" },
    { value: "#fef9c3", label: "Yellow" },
    { value: "#fce7f3", label: "Pink" },
    { value: "#ede9fe", label: "Purple" },
    { value: "#fee2e2", label: "Red" },
    { value: "#f0f9ff", label: "Sky" },
    { value: "#f5f5f5", label: "Gray" },
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
    const [styleOptions, setStyleOptions] = useState<Record<string, string | string[]>>(() => {
        if (currentConfig && currentConfig.style === selectedStyle) {
            const cfg = getStyleConfig(selectedStyle);
            if (cfg) {
                const opts: Record<string, string | string[]> = {};
                for (const opt of cfg.options) {
                    if (opt.type === "select" && opt.options?.length) {
                        opts[opt.key] = opt.options[0].value;
                    }
                }
                return opts;
            }
        }
        return {};
    });

    function getColorOption(opt: { key: string; label: string; type: string; colors?: string[]; options?: { value: string; label: string }[] }): string | string[] {
        return styleOptions[opt.key] ?? opt.options?.[0]?.value ?? "";
    }

    function isColorSelected(opt: { key: string; label: string; type: string; colors?: string[]; options?: { value: string; label: string }[] }, color: string): boolean {
        const val = styleOptions[opt.key];
        if (Array.isArray(val)) return val.includes(color);
        return val === color;
    }

    function isSelectSelected(opt: { key: string; options?: { value: string; label: string }[] }, choice: { value: string }): boolean {
        const val = styleOptions[opt.key];
        if (Array.isArray(val)) return val.includes(choice.value);
        return val === choice.value;
    }
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const seed = userName || "along-user";

    const currentStyleConfig = useMemo(
        () => getStyleConfig(selectedStyle),
        [selectedStyle],
    );

    const previewUrl = useMemo(() => {
        return buildAvatarUrlWithOptions(selectedStyle, seed, {
            ...styleOptions,
            backgroundColor: selectedBg.replace("#", ""),
        });
    }, [selectedStyle, seed, styleOptions, selectedBg]);

    function handleStyleChange(style: AvatarStyle): void {
        setSelectedStyle(style);
        const cfg = getStyleConfig(style);
        if (cfg) {
            const newOpts: Record<string, string> = {};
            for (const opt of cfg.options) {
                if (opt.type === "select" && opt.options?.length) {
                    newOpts[opt.key] = opt.options[0].value;
                }
            }
            setStyleOptions(newOpts);
        }
    }

    function handleOptionChange(key: string, value: string): void {
        setStyleOptions((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave(): Promise<void> {
        setSaving(true);
        setError(null);
        try {
            const config: AvatarConfig = {
                style: selectedStyle,
                seed,
                backgroundColor: selectedBg,
                ...styleOptions,
            };

            const res = await fetch(`/api/users/${userId}/avatar`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(config),
            });

            if (!res.ok) {
                const body = (await res.json()) as { error?: string };
                throw new Error(body.error ?? "Failed to save avatar");
            }

            onSaved(config);
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
            subtitle="Pick a style and customise your profile picture"
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
                        {AVATAR_STYLE_CONFIGS &&
                            Object.entries(AVATAR_STYLE_CONFIGS).map(([key, cfg]) => {
                                const thumbUrl = buildAvatarUrlWithOptions(
                                    key,
                                    seed,
                                    { backgroundColor: selectedBg.replace("#", "") },
                                );
                                const isSelected = key === selectedStyle;
                                return (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => handleStyleChange(key as AvatarStyle)}
                                        className={[
                                            "relative flex flex-col items-center gap-1 rounded-[var(--radius-card)] border-2 p-1.5 transition-all",
                                            isSelected
                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                                                : "border-[var(--color-border)] hover:border-[var(--color-primary)]/40",
                                        ].join(" ")}>
                                        <div className="relative h-14 w-14 overflow-hidden rounded-full">
                                            <Image
                                                src={thumbUrl}
                                                alt={cfg.label}
                                                fill
                                                sizes="56px"
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <span className="text-[10px] text-center leading-tight text-[var(--color-text-secondary)] truncate w-full">
                                            {cfg.label}
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

                {/* Right panel — preview + options */}
                <div className="flex w-full flex-col items-center gap-4 sm:w-56">
                    <p className="self-start text-xs font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
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

                    {/* Style-specific options */}
                    {currentStyleConfig && currentStyleConfig.options.length > 0 ? (
                        <div className="w-full space-y-4 self-start">
                            {currentStyleConfig.options
                                .filter((opt) => opt.type !== "color" || opt.key !== "backgroundColor")
                                .map((opt) => (
                                    <div key={opt.key}>
                                        <p className="mb-1.5 text-[10px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                                            {opt.label}
                                        </p>
                                        {opt.type === "select" && opt.options ? (
                                            <div className="flex flex-wrap gap-1">
                                                {opt.options.map((choice) => (
                                                    <button
                                                        key={choice.value}
                                                        type="button"
                                                        onClick={() => handleOptionChange(opt.key, choice.value)}
                                                        className={[
                                                            "rounded-[var(--radius-pill)] border px-2 py-0.5 text-[10px] transition-all",
                                                            isSelectSelected(opt, choice)
                                                                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                                                                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/40",
                                                        ].join(" ")}>
                                                        {choice.label}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : null}
                                        {opt.type === "color" && opt.colors ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {opt.colors.map((color) => {
                                                    return (
                                                    <button
                                                        key={color}
                                                        type="button"
                                                        aria-label={`${opt.label} ${color}`}
                                                        onClick={() => handleOptionChange(opt.key, color)}
                                                        className={`h-5 w-5 rounded-full border-2 transition-all ${isColorSelected(opt, color) ? "border-[var(--color-primary)] scale-110" : "border-transparent hover:border-[var(--color-text-muted)]"}`}
                                                        style={{ backgroundColor: color }}
                                                    />
                                                );
                                                })}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}

                            {/* Background color always shown */}
                            <div>
                                <p className="mb-1.5 text-[10px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                                    Background
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {DEFAULT_BACKGROUND_COLORS.map((color) => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            aria-label={`Background colour ${color.label}`}
                                            onClick={() => setSelectedBg(color.value)}
                                            className={`h-5 w-5 rounded-full border-2 transition-all ${selectedBg === color.value ? "border-[var(--color-primary)] scale-110" : "border-transparent hover:border-[var(--color-text-muted)]"}`}
                                            style={{ backgroundColor: color.value }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full">
                            <p className="mb-1.5 text-[10px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wide">
                                Background
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {DEFAULT_BACKGROUND_COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        type="button"
                                        aria-label={`Background colour ${color.label}`}
                                        onClick={() => setSelectedBg(color.value)}
                                        className={`h-5 w-5 rounded-full border-2 transition-all ${selectedBg === color.value ? "border-[var(--color-primary)] scale-110" : "border-transparent hover:border-[var(--color-text-muted)]"}`}
                                        style={{ backgroundColor: color.value }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {error ? (
                        <p className="text-xs text-[var(--color-error-text)]">{error}</p>
                    ) : null}
                </div>
            </div>
        </AppModal>
    );
}