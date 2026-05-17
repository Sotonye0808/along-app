import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/config/email";
import { renderEmailLayout } from "@/lib/email/emailLayout";

const TOKEN_PATTERN = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatTokens(template: string, tokens: Record<string, string | number>): string {
    return template.replace(TOKEN_PATTERN, (_match, key) => {
        const value = tokens[key] ?? "";
        return escapeHtml(String(value));
    });
}

function resolveTemplateCopy(
    templateId: EmailTemplateId,
    overrides?: EmailTemplateConfig,
): EmailTemplateCopy {
    return overrides?.[templateId] ?? DEFAULT_EMAIL_TEMPLATES[templateId];
}

export interface OtpEmailInput {
    brandName: string;
    firstName: string;
    email: string;
    code: string;
    expiresInMinutes: number;
    verifyUrl: string;
}

export interface InviteEmailInput {
    brandName: string;
    inviterName: string;
    inviteUrl: string;
    inviteCode: string;
}

export interface ContactConfirmationInput {
    brandName: string;
    name: string;
    subject: string;
    message: string;
    supportEmail: string;
}

export interface ContactNotificationInput {
    brandName: string;
    name: string;
    email: string;
    subject: string;
    message: string;
}

export interface BugReportConfirmationInput {
    brandName: string;
    name: string;
    reportId: string;
    title: string;
    category: string;
}

export interface BugReportNotificationInput {
    brandName: string;
    name: string;
    email: string;
    reportId: string;
    title: string;
    category: string;
    adminUrl: string;
}

export interface DigestSummaryInput {
    brandName: string;
    userName: string;
    likesCount: number;
    commentsCount: number;
    followsCount: number;
    notificationsUrl: string;
}

export interface PasswordChangedInput {
    brandName: string;
    name: string;
    supportEmail: string;
    securityUrl: string;
}

export function buildOtpEmail(
    input: OtpEmailInput,
    overrides?: EmailTemplateConfig,
): { subject: string; html: string; text: string } {
    const copy = resolveTemplateCopy("otpVerification", overrides);
    const tokens = {
        brandName: input.brandName,
        expiresInMinutes: input.expiresInMinutes,
    };

    const subject = formatTokens(copy.subject, tokens);
    const preview = formatTokens(copy.preview, tokens);
    const bodyHtml = `
    <p>Hi ${escapeHtml(input.firstName)},</p>
    <p>Your verification code is:</p>
    <p style="font-size:28px;font-weight:700;letter-spacing:0.18em;margin:12px 0;">${escapeHtml(
        input.code,
    )}</p>
    <p>This code expires in ${escapeHtml(
        String(input.expiresInMinutes),
    )} minutes.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

    const html = renderEmailLayout({
        brandName: input.brandName,
        title: "Verify your email",
        preheader: preview,
        bodyHtml,
        ctaLabel: "Verify email",
        ctaUrl: input.verifyUrl,
        footerNote: "For help, reply to this email.",
    });

    const text = `Hi ${input.firstName},\n\nYour verification code is ${input.code}. It expires in ${input.expiresInMinutes} minutes.\n\nVerify: ${input.verifyUrl}`;

    return { subject, html, text };
}

export function buildInviteEmail(
    input: InviteEmailInput,
    overrides?: EmailTemplateConfig,
): { subject: string; html: string; text: string } {
    const copy = resolveTemplateCopy("invite", overrides);
    const tokens = { brandName: input.brandName };
    const subject = formatTokens(copy.subject, tokens);
    const preview = formatTokens(copy.preview, tokens);

    const bodyHtml = `
    <p>${escapeHtml(input.inviterName)} invited you to join ${escapeHtml(
        input.brandName,
    )}.</p>
    <p>Use invite code <strong>${escapeHtml(input.inviteCode)}</strong> if asked.</p>
  `;

    const html = renderEmailLayout({
        brandName: input.brandName,
        title: "You are invited",
        preheader: preview,
        bodyHtml,
        ctaLabel: "Join now",
        ctaUrl: input.inviteUrl,
        footerNote: "Invite links expire after 14 days.",
    });

    const text = `${input.inviterName} invited you to join ${input.brandName}.\nInvite code: ${input.inviteCode}\nJoin: ${input.inviteUrl}`;

    return { subject, html, text };
}

export function buildContactConfirmationEmail(
    input: ContactConfirmationInput,
    overrides?: EmailTemplateConfig,
): { subject: string; html: string; text: string } {
    const copy = resolveTemplateCopy("contactConfirmation", overrides);
    const tokens = { brandName: input.brandName };
    const subject = formatTokens(copy.subject, tokens);
    const preview = formatTokens(copy.preview, tokens);

    const bodyHtml = `
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>Thanks for reaching out to ${escapeHtml(input.brandName)}. We received your message and will reply soon.</p>
    <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
    <p style="white-space:pre-line;">${escapeHtml(input.message)}</p>
  `;

    const html = renderEmailLayout({
        brandName: input.brandName,
        title: "We received your message",
        preheader: preview,
        bodyHtml,
        footerNote: `If you need to add more details, reply to this email or contact ${escapeHtml(
            input.supportEmail,
        )}.`,
    });

    const text = `Hi ${input.name},\n\nWe received your message. Subject: ${input.subject}\n${input.message}`;

    return { subject, html, text };
}

export function buildContactNotificationEmail(
    input: ContactNotificationInput,
    overrides?: EmailTemplateConfig,
): { subject: string; html: string; text: string } {
    const copy = resolveTemplateCopy("contactNotification", overrides);
    const subject = formatTokens(copy.subject, { brandName: input.brandName });
    const preview = formatTokens(copy.preview, { brandName: input.brandName });

    const bodyHtml = `
    <p>New contact message received.</p>
    <p><strong>Name:</strong> ${escapeHtml(input.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(input.subject)}</p>
    <p style="white-space:pre-line;">${escapeHtml(input.message)}</p>
  `;

    const html = renderEmailLayout({
        brandName: input.brandName,
        title: "Contact form submission",
        preheader: preview,
        bodyHtml,
    });

    const text = `Contact message from ${input.name} (${input.email})\nSubject: ${input.subject}\n${input.message}`;

    return { subject, html, text };
}

export function buildBugReportConfirmationEmail(
    input: BugReportConfirmationInput,
    overrides?: EmailTemplateConfig,
): { subject: string; html: string; text: string } {
    const copy = resolveTemplateCopy("bugReportConfirmation", overrides);
    const subject = formatTokens(copy.subject, { brandName: input.brandName });
    const preview = formatTokens(copy.preview, { brandName: input.brandName });

    const bodyHtml = `
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>We received your bug report and will investigate it shortly.</p>
    <p><strong>ID:</strong> ${escapeHtml(input.reportId)}</p>
    <p><strong>Title:</strong> ${escapeHtml(input.title)}</p>
    <p><strong>Category:</strong> ${escapeHtml(input.category)}</p>
  `;

    const html = renderEmailLayout({
        brandName: input.brandName,
        title: "Bug report received",
        preheader: preview,
        bodyHtml,
    });

    const text = `Bug report received. ID: ${input.reportId}. Title: ${input.title}. Category: ${input.category}.`;

    return { subject, html, text };
}

export function buildBugReportNotificationEmail(
    input: BugReportNotificationInput,
    overrides?: EmailTemplateConfig,
): { subject: string; html: string; text: string } {
    const copy = resolveTemplateCopy("bugReportNotification", overrides);
    const subject = formatTokens(copy.subject, { brandName: input.brandName });
    const preview = formatTokens(copy.preview, { brandName: input.brandName });

    const bodyHtml = `
    <p>A new bug report requires triage.</p>
    <p><strong>ID:</strong> ${escapeHtml(input.reportId)}</p>
    <p><strong>Title:</strong> ${escapeHtml(input.title)}</p>
    <p><strong>Category:</strong> ${escapeHtml(input.category)}</p>
    <p><strong>Reporter:</strong> ${escapeHtml(input.name)} (${escapeHtml(input.email)})</p>
  `;

    const html = renderEmailLayout({
        brandName: input.brandName,
        title: "New bug report",
        preheader: preview,
        bodyHtml,
        ctaLabel: "Open admin",
        ctaUrl: input.adminUrl,
    });

    const text = `New bug report ${input.reportId}. ${input.title} (${input.category}). Reporter: ${input.name} (${input.email}). Admin: ${input.adminUrl}`;

    return { subject, html, text };
}

export function buildDigestSummaryEmail(
    input: DigestSummaryInput,
    overrides?: EmailTemplateConfig,
): { subject: string; html: string; text: string } {
    const copy = resolveTemplateCopy("digestSummary", overrides);
    const subject = formatTokens(copy.subject, { brandName: input.brandName });
    const preview = formatTokens(copy.preview, { brandName: input.brandName });

    const bodyHtml = `
    <p>Hi ${escapeHtml(input.userName)},</p>
    <p>Here is your activity summary for the last 24 hours:</p>
    <ul>
      <li>${escapeHtml(String(input.likesCount))} new like${input.likesCount === 1 ? "" : "s"}</li>
      <li>${escapeHtml(String(input.commentsCount))} new comment${input.commentsCount === 1 ? "" : "s"}</li>
      <li>${escapeHtml(String(input.followsCount))} new follower${input.followsCount === 1 ? "" : "s"}</li>
    </ul>
  `;

    const html = renderEmailLayout({
        brandName: input.brandName,
        title: "Your daily digest",
        preheader: preview,
        bodyHtml,
        ctaLabel: "View notifications",
        ctaUrl: input.notificationsUrl,
    });

    const text = `Daily digest: ${input.likesCount} likes, ${input.commentsCount} comments, ${input.followsCount} follows. View: ${input.notificationsUrl}`;

    return { subject, html, text };
}

export function buildPasswordChangedEmail(
    input: PasswordChangedInput,
    overrides?: EmailTemplateConfig,
): { subject: string; html: string; text: string } {
    const copy = resolveTemplateCopy("passwordChanged", overrides);
    const subject = formatTokens(copy.subject, { brandName: input.brandName });
    const preview = formatTokens(copy.preview, { brandName: input.brandName });

    const bodyHtml = `
    <p>Hi ${escapeHtml(input.name)},</p>
    <p>Your ${escapeHtml(input.brandName)} password was recently updated.</p>
    <p>If this was not you, reset your password and contact support immediately.</p>
  `;

    const html = renderEmailLayout({
        brandName: input.brandName,
        title: "Password updated",
        preheader: preview,
        bodyHtml,
        ctaLabel: "Review security",
        ctaUrl: input.securityUrl,
        footerNote: `Need help? Contact ${escapeHtml(input.supportEmail)}.`,
    });

    const text = `Your ${input.brandName} password was updated. If this was not you, contact ${input.supportEmail}.`;

    return { subject, html, text };
}
