import { Resend } from "resend";
import { getSiteConfig } from "@/lib/utils/siteConfig";
import { getSiteUrl } from "@/lib/utils/metadata";
import { isProjectDev } from "@/lib/utils/env";
import {
    buildBugReportConfirmationEmail,
    buildBugReportNotificationEmail,
    buildContactConfirmationEmail,
    buildContactNotificationEmail,
    buildDigestSummaryEmail,
    buildInviteEmail,
    buildOtpEmail,
    buildPasswordChangedEmail,
} from "@/lib/email/templates";

export interface EmailSendResult {
    ok: boolean;
    skipped: boolean;
    error?: string;
}

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
}

async function deliverEmail(
    options: SendEmailOptions,
    from: string,
): Promise<EmailSendResult> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        if (isProjectDev()) {
            console.info("[email] Resend not configured, skipped send.");
            return { ok: false, skipped: true, error: "missing-api-key" };
        }
        return { ok: false, skipped: false, error: "missing-api-key" };
    }

    try {
        const resend = new Resend(apiKey);
        await resend.emails.send({
            from,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            replyTo: options.replyTo,
        });
        return { ok: true, skipped: false };
    } catch (error) {
        console.error("[email] send failed", error);
        if (isProjectDev()) {
            return { ok: false, skipped: true, error: "send-failed" };
        }
        return { ok: false, skipped: false, error: "send-failed" };
    }
}

async function getEmailSettings(): Promise<{
    config: EmailConfig;
    templates: EmailTemplateConfig;
}> {
    const [config, templates] = await Promise.all([
        getSiteConfig("email"),
        getSiteConfig("emailTemplates"),
    ]);
    return { config, templates };
}

export async function sendOtpVerificationEmail(input: {
    email: string;
    firstName: string;
    code: string;
    expiresInMinutes: number;
}): Promise<EmailSendResult> {
    const { config, templates } = await getEmailSettings();
    const verifyUrl = getSiteUrl(`/otp?email=${encodeURIComponent(input.email)}`);

    const email = buildOtpEmail(
        {
            brandName: config.brandName,
            firstName: input.firstName,
            email: input.email,
            code: input.code,
            expiresInMinutes: input.expiresInMinutes,
            verifyUrl,
        },
        templates,
    );

    return deliverEmail(
        {
            to: input.email,
            subject: email.subject,
            html: email.html,
            text: email.text,
            replyTo: config.replyToEmail,
        },
        `${config.fromName} <${config.fromEmail}>`,
    );
}

export async function sendInviteEmail(input: {
    email: string;
    inviterName: string;
    inviteUrl: string;
    inviteCode: string;
}): Promise<EmailSendResult> {
    const { config, templates } = await getEmailSettings();
    const email = buildInviteEmail(
        {
            brandName: config.brandName,
            inviterName: input.inviterName,
            inviteUrl: input.inviteUrl,
            inviteCode: input.inviteCode,
        },
        templates,
    );

    return deliverEmail(
        {
            to: input.email,
            subject: email.subject,
            html: email.html,
            text: email.text,
            replyTo: config.replyToEmail,
        },
        `${config.fromName} <${config.fromEmail}>`,
    );
}

export async function sendContactConfirmationEmail(input: {
    email: string;
    name: string;
    subject: string;
    message: string;
}): Promise<EmailSendResult> {
    const { config, templates } = await getEmailSettings();
    const email = buildContactConfirmationEmail(
        {
            brandName: config.brandName,
            name: input.name,
            subject: input.subject,
            message: input.message,
            supportEmail: config.supportEmail,
        },
        templates,
    );

    return deliverEmail(
        {
            to: input.email,
            subject: email.subject,
            html: email.html,
            text: email.text,
            replyTo: config.replyToEmail,
        },
        `${config.fromName} <${config.fromEmail}>`,
    );
}

export async function sendContactNotificationEmail(input: {
    name: string;
    email: string;
    subject: string;
    message: string;
}): Promise<EmailSendResult> {
    const { config, templates } = await getEmailSettings();
    const email = buildContactNotificationEmail(
        {
            brandName: config.brandName,
            name: input.name,
            email: input.email,
            subject: input.subject,
            message: input.message,
        },
        templates,
    );

    return deliverEmail(
        {
            to: config.contactEmail,
            subject: email.subject,
            html: email.html,
            text: email.text,
            replyTo: config.replyToEmail,
        },
        `${config.fromName} <${config.fromEmail}>`,
    );
}

export async function sendBugReportConfirmationEmail(input: {
    email: string;
    name: string;
    reportId: string;
    title: string;
    category: string;
}): Promise<EmailSendResult> {
    const { config, templates } = await getEmailSettings();
    const email = buildBugReportConfirmationEmail(
        {
            brandName: config.brandName,
            name: input.name,
            reportId: input.reportId,
            title: input.title,
            category: input.category,
        },
        templates,
    );

    return deliverEmail(
        {
            to: input.email,
            subject: email.subject,
            html: email.html,
            text: email.text,
            replyTo: config.replyToEmail,
        },
        `${config.fromName} <${config.fromEmail}>`,
    );
}

export async function sendBugReportNotificationEmail(input: {
    name: string;
    email: string;
    reportId: string;
    title: string;
    category: string;
}): Promise<EmailSendResult> {
    const { config, templates } = await getEmailSettings();
    const adminUrl = getSiteUrl("/admin/bugs");
    const email = buildBugReportNotificationEmail(
        {
            brandName: config.brandName,
            name: input.name,
            email: input.email,
            reportId: input.reportId,
            title: input.title,
            category: input.category,
            adminUrl,
        },
        templates,
    );

    return deliverEmail(
        {
            to: config.bugReportsEmail,
            subject: email.subject,
            html: email.html,
            text: email.text,
            replyTo: config.replyToEmail,
        },
        `${config.fromName} <${config.fromEmail}>`,
    );
}

export async function sendDigestSummaryEmail(input: {
    email: string;
    userName: string;
    likesCount: number;
    commentsCount: number;
    followsCount: number;
}): Promise<EmailSendResult> {
    const { config, templates } = await getEmailSettings();
    const notificationsUrl = getSiteUrl("/notifications");
    const email = buildDigestSummaryEmail(
        {
            brandName: config.brandName,
            userName: input.userName,
            likesCount: input.likesCount,
            commentsCount: input.commentsCount,
            followsCount: input.followsCount,
            notificationsUrl,
        },
        templates,
    );

    return deliverEmail(
        {
            to: input.email,
            subject: email.subject,
            html: email.html,
            text: email.text,
            replyTo: config.replyToEmail,
        },
        `${config.fromName} <${config.fromEmail}>`,
    );
}

export async function sendPasswordChangedEmail(input: {
    email: string;
    name: string;
}): Promise<EmailSendResult> {
    const { config, templates } = await getEmailSettings();
    const securityUrl = getSiteUrl("/settings/security");
    const email = buildPasswordChangedEmail(
        {
            brandName: config.brandName,
            name: input.name,
            supportEmail: config.supportEmail,
            securityUrl,
        },
        templates,
    );

    return deliverEmail(
        {
            to: input.email,
            subject: email.subject,
            html: email.html,
            text: email.text,
            replyTo: config.replyToEmail,
        },
        `${config.fromName} <${config.fromEmail}>`,
    );
}
