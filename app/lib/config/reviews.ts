import type { LucideIcon } from "lucide-react";
import { Clock3, CheckCircle2, CircleAlert, ShieldAlert } from "lucide-react";

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewStatusConfig {
    label: string;
    color: string;
    icon: LucideIcon;
}

export const REVIEW_STATUS_OPTIONS: ReviewStatus[] = [
    "PENDING",
    "APPROVED",
    "REJECTED",
];

export const REVIEW_STATUS_CONFIG: Record<ReviewStatus, ReviewStatusConfig> = {
    PENDING: {
        label: "Pending",
        color: "#cc7914",
        icon: Clock3,
    },
    APPROVED: {
        label: "Approved",
        color: "#15b097",
        icon: CheckCircle2,
    },
    REJECTED: {
        label: "Rejected",
        color: "#8c1823",
        icon: ShieldAlert,
    },
};

export const REVIEW_STATUS_BADGE_CONFIG: Record<ReviewStatus, ReviewStatusConfig> =
    REVIEW_STATUS_CONFIG;

export const REVIEW_STATUS_FILTERS: Array<{
    label: string;
    value: ReviewStatus | "ALL";
    icon: LucideIcon;
}> = [
        { label: "All", value: "ALL", icon: CircleAlert },
        { label: "Pending", value: "PENDING", icon: Clock3 },
        { label: "Approved", value: "APPROVED", icon: CheckCircle2 },
        { label: "Rejected", value: "REJECTED", icon: ShieldAlert },
    ];
