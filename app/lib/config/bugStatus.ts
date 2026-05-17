// Bug report status configuration
import type { StatusDotConfig } from "@/components/ui/AppStatusDot";

export const BUG_STATUS_CONFIG: Record<string, StatusDotConfig> = {
    OPEN: { color: "#dc2626", label: "Open" },
    TRIAGED: { color: "#f59e0b", label: "Triaged" },
    IN_PROGRESS: { color: "#3b82f6", label: "In Progress" },
    RESOLVED: { color: "#10b981", label: "Resolved" },
    CLOSED: { color: "#6b7280", label: "Closed" },
};

export const BUG_STATUS_OPTIONS = Object.keys(BUG_STATUS_CONFIG);
