"use client";

import React, { useState } from "react";
import { CheckCircle, Mail } from "lucide-react";
import { ConfigDrivenForm } from "@/components/ui/ConfigDrivenForm";
import { AppEmptyState } from "@/components/ui/AppEmptyState";
import { CONTACT_FIELDS } from "@/lib/config/forms";
import { ToastService } from "@/lib/services/toastService";

interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: ContactFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Contact request failed");
      }

      setSubmitted(true);
    } catch {
      ToastService.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Mail
            size={26}
            className="text-[var(--color-primary)]"
            aria-hidden="true"
          />
          Contact Us
        </h1>
        <p className="text-base text-[var(--color-text-secondary)] mt-2 max-w-prose">
          Questions, feedback, or partnership enquiries — we&apos;d love to hear
          from you.
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
