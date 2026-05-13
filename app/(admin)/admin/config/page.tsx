"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { DEFAULT_VALIDITY_CONFIG } from "@/lib/config/validityConfig";
import type { ValidityConfig } from "@/lib/config/validityConfig";
import { DEFAULT_FEED_CONFIG } from "@/lib/config/feedAlgorithm";
import type { FeedAlgorithmConfig } from "@/lib/config/feedAlgorithm";
import {
  DEFAULT_EMAIL_CONFIG,
  DEFAULT_EMAIL_TEMPLATES,
} from "@/lib/config/email";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { AppInput } from "@/components/ui/AppInput";
import { AppTextarea } from "@/components/ui/AppTextarea";
import { AppSpinner } from "@/components/ui/AppSpinner";
import { ModalService } from "@/lib/services/modalService";

export default function AdminConfigPage(): React.ReactElement {
  const [validity, setValidity] = useState<ValidityConfig>(
    DEFAULT_VALIDITY_CONFIG,
  );
  const [feed, setFeed] = useState<FeedAlgorithmConfig>(DEFAULT_FEED_CONFIG);
  const [emailConfig, setEmailConfig] =
    useState<EmailConfig>(DEFAULT_EMAIL_CONFIG);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplateConfig>(
    DEFAULT_EMAIL_TEMPLATES,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [vRes, fRes, eRes, tRes] = await Promise.allSettled([
        fetch("/api/admin/config?key=validityConfig", {
          credentials: "include",
        }),
        fetch("/api/admin/config?key=feedAlgorithm", {
          credentials: "include",
        }),
        fetch("/api/admin/config?key=email", {
          credentials: "include",
        }),
        fetch("/api/admin/config?key=emailTemplates", {
          credentials: "include",
        }),
      ]);
      if (vRes.status === "fulfilled" && vRes.value.ok) {
        const vBody = (await vRes.value.json()) as { value: ValidityConfig };
        if (vBody.value) setValidity(vBody.value);
      }
      if (fRes.status === "fulfilled" && fRes.value.ok) {
        const fBody = (await fRes.value.json()) as {
          value: FeedAlgorithmConfig;
        };
        if (fBody.value) setFeed(fBody.value);
      }
      if (eRes.status === "fulfilled" && eRes.value.ok) {
        const eBody = (await eRes.value.json()) as {
          value: EmailConfig;
        };
        if (eBody.value) {
          setEmailConfig({ ...DEFAULT_EMAIL_CONFIG, ...eBody.value });
        }
      }
      if (tRes.status === "fulfilled" && tRes.value.ok) {
        const tBody = (await tRes.value.json()) as {
          value: EmailTemplateConfig;
        };
        if (tBody.value) {
          const merged = {
            ...DEFAULT_EMAIL_TEMPLATES,
            ...tBody.value,
          } as EmailTemplateConfig;

          (Object.keys(DEFAULT_EMAIL_TEMPLATES) as EmailTemplateId[]).forEach(
            (templateId) => {
              merged[templateId] = {
                ...DEFAULT_EMAIL_TEMPLATES[templateId],
                ...tBody.value?.[templateId],
              };
            },
          );

          setEmailTemplates(merged);
        }
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
        fetch("/api/admin/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ key: "email", value: emailConfig }),
        }),
        fetch("/api/admin/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            key: "emailTemplates",
            value: emailTemplates,
          }),
        }),
      ]);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <AppSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
          Site Configuration
        </h1>
        <AppButton
          icon={Save}
          loading={saving}
          onClick={() => void handleSave()}>
          Save all
        </AppButton>
      </div>

      <AppCard variant="default">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          Validity Engine weights
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {(
            Object.keys(validity.weights) as (keyof ValidityConfig["weights"])[]
          ).map((key) => (
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

      <AppCard variant="default">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          Feed Algorithm weights
        </h2>
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
                  setFeed((prev) => ({
                    ...prev,
                    [key]: Number(e.target.value),
                  }))
                }
              />
            </div>
          ))}
        </div>
      </AppCard>

      <AppCard variant="default">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          Email settings
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {(Object.keys(emailConfig) as (keyof EmailConfig)[]).map((key) => (
            <div key={key}>
              <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)] capitalize">
                {key}
              </label>
              <AppInput
                value={emailConfig[key]}
                onChange={(e) =>
                  setEmailConfig((prev) => ({
                    ...prev,
                    [key]: e.target.value,
                  }))
                }
              />
            </div>
          ))}
        </div>
      </AppCard>

      <AppCard variant="default">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text-primary)]">
          Email templates
        </h2>
        <div className="space-y-4">
          {(Object.keys(emailTemplates) as EmailTemplateId[]).map(
            (templateId) => (
              <div
                key={templateId}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] p-4">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {templateId}
                </p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
                      Subject
                    </label>
                    <AppInput
                      value={emailTemplates[templateId].subject}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          [templateId]: {
                            ...prev[templateId],
                            subject: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[var(--color-text-secondary)]">
                      Preview
                    </label>
                    <AppTextarea
                      rows={2}
                      value={emailTemplates[templateId].preview}
                      onChange={(e) =>
                        setEmailTemplates((prev) => ({
                          ...prev,
                          [templateId]: {
                            ...prev[templateId],
                            preview: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      </AppCard>
    </div>
  );
}
