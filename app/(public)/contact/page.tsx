"use client";

import React, { useState } from "react";
import { CheckCircle, Mail } from "lucide-react";
import { App } from "antd";
import { ConfigDrivenForm } from "@/components/ui/ConfigDrivenForm";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { CONTACT_FIELDS } from "@/lib/config/forms";

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const handleSubmit = async (values: ContactFormValues) => {
    setLoading(true);
    try {
      // Placeholder: in production this would POST to /api/contact or an email provider
      await new Promise<void>((r) => setTimeout(r, 800));
      console.info("[contact]", values);
      setSubmitted(true);
    } catch {
      message.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Mail size={26} className="text-[var(--color-primary)]" aria-hidden="true" />
          Contact Us
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] mt-2 max-w-prose">
          Questions, feedback, or partnership enquiries — we&apos;d love to hear from you.
        </p>
      </div>

      {submitted ? (
        <AppEmptyState
          icon={CheckCircle}
          title="Message sent!"
          description="Thanks for reaching out. We'll get back to you within 1–2 business days."
          action={{ label: "Send another", onClick: () => setSubmitted(false) }}
        />
      ) : (
        <div className="max-w-md">
          <ConfigDrivenForm<ContactFormValues>
            fields={CONTACT_FIELDS}
            submitLabel="Send message"
            loading={loading}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </div>
  );
}
