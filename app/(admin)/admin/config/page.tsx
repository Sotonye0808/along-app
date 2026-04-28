"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { DEFAULT_VALIDITY_CONFIG } from "@/lib/config/validityConfig";
import type { ValidityConfig } from "@/lib/config/validityConfig";
import { DEFAULT_FEED_CONFIG } from "@/lib/config/feedAlgorithm";
import type { FeedAlgorithmConfig } from "@/lib/config/feedAlgorithm";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { ModalService } from "@/lib/services/modalService";

export default function AdminConfigPage(): React.ReactElement {
  const [validity, setValidity] = useState<ValidityConfig>(DEFAULT_VALIDITY_CONFIG);
  const [feed, setFeed] = useState<FeedAlgorithmConfig>(DEFAULT_FEED_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [vRes, fRes] = await Promise.allSettled([
        fetch("/api/admin/config?key=validityConfig", { credentials: "include" }),
        fetch("/api/admin/config?key=feedAlgorithm", { credentials: "include" }),
      ]);
      if (vRes.status === "fulfilled" && vRes.value.ok) {
        const vBody = (await vRes.value.json()) as { value: ValidityConfig };
        if (vBody.value) setValidity(vBody.value);
      }
      if (fRes.status === "fulfilled" && fRes.value.ok) {
        const fBody = (await fRes.value.json()) as { value: FeedAlgorithmConfig };
        if (fBody.value) setFeed(fBody.value);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(): Promise<void> {
    const confirmed = await ModalService.confirm({
      title: "Save site configuration",
      description: "Changes will take effect immediately for all users.",
      confirmLabel: "Save",
    });
    if (!confirmed) return;

    setSaving(true);
    try {
      await Promise.all([
        fetch("/api/admin/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ key: "validityConfig", value: validity }),
        }),
        fetch("/api/admin/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ key: "feedAlgorithm", value: feed }),
        }),
      ]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <AppSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Site Configuration
        </h1>
        <AppButton icon={Save} loading={saving} onClick={() => void handleSave()}>
          Save all
        </AppButton>
      </div>

      <AppCard variant="default" title="Validity Engine weights">
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(validity.weights) as (keyof ValidityConfig["weights"])[]).map((key) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)] capitalize">
                {key}
              </label>
              <AppInput
                type="number"
                min={0}
                max={1}
                step={0.01}
                value={validity.weights[key]}
                onChange={(e) =>
                  setValidity((prev) => ({
                    ...prev,
                    weights: { ...prev.weights, [key]: Number(e.target.value) },
                  }))
                }
              />
            </div>
          ))}
        </div>
      </AppCard>

      <AppCard variant="default" title="Feed Algorithm weights">
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(feed) as (keyof FeedAlgorithmConfig)[]).map((key) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)] capitalize">
                {key}
              </label>
              <AppInput
                type="number"
                min={0}
                step={0.01}
                value={feed[key]}
                onChange={(e) =>
                  setFeed((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
              />
            </div>
          ))}
        </div>
      </AppCard>
    </div>
  );
}
