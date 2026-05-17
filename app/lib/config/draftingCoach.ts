import type { LucideIcon } from "lucide-react";
import { Camera, CheckCircle2, LocateFixed, Route } from "lucide-react";

export interface QualityCheckpoint {
    key: string;
    label: string;
    description: string;
    points: number;
    celebrationIcon: LucideIcon;
}

export const QUALITY_CHECKPOINTS: QualityCheckpoint[] = [
    {
        key: "originDestination",
        label: "Origin and destination set",
        description: "Add clear start and end points for your route.",
        points: 30,
        celebrationIcon: LocateFixed,
    },
    {
        key: "transportMode",
        label: "Transport mode selected",
        description: "Choose one or more transport modes for route clarity.",
        points: 20,
        celebrationIcon: Route,
    },
    {
        key: "routeNarrative",
        label: "Helpful route details",
        description: "Share practical details such as fare, queue time, and delays.",
        points: 30,
        celebrationIcon: CheckCircle2,
    },
    {
        key: "photoEvidence",
        label: "Photo evidence added",
        description: "Attach at least one image to increase trust score.",
        points: 20,
        celebrationIcon: Camera,
    },
];
