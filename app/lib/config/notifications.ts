import type { LucideIcon } from "lucide-react";
import { Bell, Heart, MessageCircle, ShieldCheck, UserPlus, Gift } from "lucide-react";

export type NotificationType = AppNotification["type"] | "system";

export interface NotificationTypeConfig {
    type: NotificationType;
    label: string;
    icon: LucideIcon;
    colorClass: string;
}

export const NOTIFICATION_REGISTRY: Record<NotificationType, NotificationTypeConfig> = {
    like: { type: "like", label: "Like", icon: Heart, colorClass: "text-[var(--color-success-text)]" },
    comment: { type: "comment", label: "Comment", icon: MessageCircle, colorClass: "text-[var(--color-primary)]" },
    follow: { type: "follow", label: "Follow", icon: UserPlus, colorClass: "text-[var(--color-primary)]" },
    mention: { type: "mention", label: "Mention", icon: Bell, colorClass: "text-[var(--color-warning-text)]" },
    reward: { type: "reward", label: "Reward", icon: Gift, colorClass: "text-[var(--color-warning-text)]" },
    system: { type: "system", label: "System", icon: ShieldCheck, colorClass: "text-[var(--color-text-secondary)]" },
};
