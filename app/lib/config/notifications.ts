import type { LucideIcon } from "lucide-react";
import { Bell, Heart, MessageCircle, ShieldCheck, UserPlus, Gift } from "lucide-react";

export type NotificationType = AppNotification["type"] | "system";

export interface NotificationTypeConfig {
    type: NotificationType;
    label: string;
    icon: LucideIcon;
    colorToken: string;
}

export const NOTIFICATION_REGISTRY: Record<NotificationType, NotificationTypeConfig> = {
    like: { type: "like", label: "Like", icon: Heart, colorToken: "var(--color-success-text)" },
    comment: { type: "comment", label: "Comment", icon: MessageCircle, colorToken: "var(--color-primary)" },
    follow: { type: "follow", label: "Follow", icon: UserPlus, colorToken: "var(--color-primary)" },
    mention: { type: "mention", label: "Mention", icon: Bell, colorToken: "var(--color-warning-text)" },
    reward: { type: "reward", label: "Reward", icon: Gift, colorToken: "var(--color-warning-text)" },
    system: { type: "system", label: "System", icon: ShieldCheck, colorToken: "var(--color-text-secondary)" },
};
