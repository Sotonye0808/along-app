import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

export type RouteStatus = Route["status"];

export interface RouteStatusConfig {
    key: RouteStatus;
    label: string;
    icon: LucideIcon;
    colorClass: string;
    description: string;
}

export const ROUTE_STATUS_REGISTRY: Record<RouteStatus, RouteStatusConfig> = {
    verified: {
        key: "verified",
        label: "Verified",
        icon: CheckCircle,
        colorClass: "text-[var(--color-success-text)]",
        description: "Route has high confidence from community validation",
    },
    unverified: {
        key: "unverified",
        label: "Unverified",
        icon: AlertTriangle,
        colorClass: "text-[var(--color-warning-text)]",
        description: "Route has not been validated yet",
    },
    pending: {
        key: "pending",
        label: "Pending",
        icon: Clock,
        colorClass: "text-[var(--color-text-secondary)]",
        description: "Route is waiting for moderation checks",
    },
    rejected: {
        key: "rejected",
        label: "Rejected",
        icon: XCircle,
        colorClass: "text-[var(--color-error-text)]",
        description: "Route failed moderation checks",
    },
};
