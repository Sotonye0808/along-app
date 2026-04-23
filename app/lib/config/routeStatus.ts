import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";

export type RouteStatus = Route["status"];

export interface RouteStatusConfig {
    key: RouteStatus;
    label: string;
    icon: LucideIcon;
    colorToken: string;
    description: string;
}

export const ROUTE_STATUS_REGISTRY: Record<RouteStatus, RouteStatusConfig> = {
    verified: {
        key: "verified",
        label: "Verified",
        icon: CheckCircle,
        colorToken: "var(--color-success-text)",
        description: "Route has high confidence from community validation",
    },
    unverified: {
        key: "unverified",
        label: "Unverified",
        icon: AlertTriangle,
        colorToken: "var(--color-warning-text)",
        description: "Route has not been validated yet",
    },
    pending: {
        key: "pending",
        label: "Pending",
        icon: Clock,
        colorToken: "var(--color-text-secondary)",
        description: "Route is waiting for moderation checks",
    },
    rejected: {
        key: "rejected",
        label: "Rejected",
        icon: XCircle,
        colorToken: "var(--color-error-text)",
        description: "Route failed moderation checks",
    },
};
