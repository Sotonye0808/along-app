import { CheckCircle2, Clock, XCircle, ArrowLeftRight, HelpCircle } from "lucide-react";
import type { RouteStatus, RouteStatusConfig } from "@/app/lib/types";

export const ROUTE_STATUS_REGISTRY: Record<RouteStatus, RouteStatusConfig> = {
  "on-time": {
    label: "On Time",
    icon: CheckCircle2,
    color: "var(--color-success-text)",
  },
  delayed: {
    label: "Delayed",
    icon: Clock,
    color: "var(--color-warning-text)",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "var(--color-error-text)",
  },
  diverted: {
    label: "Diverted",
    icon: ArrowLeftRight,
    color: "var(--color-warning-text)",
  },
  unknown: {
    label: "Unknown",
    icon: HelpCircle,
    color: "var(--color-text-muted)",
  },
};
