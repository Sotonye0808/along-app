declare global {
    interface EmailConfig {
        brandName: string;
        fromName: string;
        fromEmail: string;
        replyToEmail: string;
        supportEmail: string;
        bugReportsEmail: string;
        contactEmail: string;
    }

    interface EmailTemplateCopy {
        subject: string;
        preview: string;
    }

    type EmailTemplateConfig = Record<EmailTemplateId, EmailTemplateCopy>;

    type EmailTemplateId =
        | "otpVerification"
        | "invite"
        | "contactConfirmation"
        | "contactNotification"
        | "bugReportConfirmation"
        | "bugReportNotification"
        | "digestSummary"
        | "passwordChanged";
}

export { };
