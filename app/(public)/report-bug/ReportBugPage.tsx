"use client";

import React, { useState } from "react";
import { Bug, CheckCircle2 } from "lucide-react";
import { BUG_REPORT_FIELDS } from "@/lib/config/forms";
import { AppAlert } from "@/components/ui/AppAlert";
import { AppCard } from "@/components/ui/AppCard";
import { ConfigDrivenForm } from "@/components/ui/ConfigDrivenForm";

interface BugReportFormValues {
  title: string;
  description: string;
  category: string;
}

export default function ReportBugPage(): React.ReactElement {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(values: BugReportFormValues): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          category: values.category.toUpperCase(),
        }),
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to submit report");
      }

      setSubmitted(true);
    } catch (err) {
      const maybeError = err as { message?: string };
      setError(maybeError.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[var(--color-primary)]/10 p-2.5">
          <Bug size={24} className="text-[var(--color-primary)]" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
            Report a bug
          </h1>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            Spotted something wrong? Let us know so we can fix it quickly.
          </p>
        </div>
      </div>

      {submitted ? (
        <AppCard variant="default">
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle2
              size={40}
              className="text-[var(--color-success-text)]"
              aria-hidden="true"
            />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
              Report received
            </h2>
            <p className="max-w-sm text-[var(--color-text-secondary)]">
              Thank you for helping improve Along. We will investigate and get
              back to you if needed.
            </p>
          </div>
        </AppCard>
      ) : (
        <AppCard variant="default">
          {error ? (
            <div className="mb-4">
              <AppAlert type="error" message={error} />
            </div>
          ) : null}
          <ConfigDrivenForm<BugReportFormValues>
            fields={BUG_REPORT_FIELDS}
            submitLabel={loading ? "Submitting..." : "Submit report"}
            loading={loading}
            onSubmit={(values) => void handleSubmit(values as BugReportFormValues)}
          />
        </AppCard>
      )}
    </div>
  );
}
