export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
    brandName: "Along",
    fromName: "Along Team",
    fromEmail: "no-reply@along.app",
    replyToEmail: "support@along.app",
    supportEmail: "support@along.app",
    bugReportsEmail: "bugs@along.app",
    contactEmail: "hello@along.app",
};

export const DEFAULT_EMAIL_TEMPLATES: EmailTemplateConfig = {
    otpVerification: {
        subject: "{{brandName}} verification code",
        preview: "Your one-time code is ready. It expires in {{expiresInMinutes}} minutes.",
    },
    invite: {
        subject: "You are invited to {{brandName}}",
        preview: "Join {{brandName}} and explore routes together.",
    },
    contactConfirmation: {
        subject: "We received your message",
        preview: "Thanks for reaching out to {{brandName}}. We will reply soon.",
    },
    contactNotification: {
        subject: "New contact message received",
        preview: "A new message was submitted from the contact form.",
    },
    bugReportConfirmation: {
        subject: "Bug report received",
        preview: "Thanks for reporting an issue on {{brandName}}.",
    },
    bugReportNotification: {
        subject: "New bug report submitted",
        preview: "A new bug report needs triage.",
    },
    digestSummary: {
        subject: "Your daily {{brandName}} digest",
        preview: "Here is what happened over the last 24 hours.",
    },
    passwordChanged: {
        subject: "Your {{brandName}} password was updated",
        preview: "If this was not you, contact support immediately.",
    },
};
