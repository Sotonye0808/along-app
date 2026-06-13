import { MapPin, Navigation, Image, Tags, AlertTriangle, CheckCircle } from "lucide-react";
import type { QualityCheckpoint } from "@/app/lib/types";

export const QUALITY_CHECKPOINTS: QualityCheckpoint[] = [
  {
    id: "has_title",
    label: "Descriptive Title",
    description: "Add a clear title that describes the route",
    icon: MapPin,
    weight: 20,
    validate: (draft) => typeof draft.title === "string" && draft.title.length >= 5,
  },
  {
    id: "has_steps",
    label: "Route Steps",
    description: "Add at least 2 route steps with stops",
    icon: Navigation,
    weight: 25,
    validate: (draft) => Array.isArray(draft.steps) && draft.steps.length >= 2,
  },
  {
    id: "has_images",
    label: "Photos",
    description: "Add at least one photo to improve credibility",
    icon: Image,
    weight: 20,
    validate: (draft) => Array.isArray(draft.images) && draft.images.length > 0,
  },
  {
    id: "has_tags",
    label: "Relevant Tags",
    description: "Add tags to help others discover this route",
    icon: Tags,
    weight: 15,
    validate: (draft) => Array.isArray(draft.tags) && draft.tags.length >= 2,
  },
  {
    id: "has_fare",
    label: "Fare Information",
    description: "Include fare details for at least one step",
    icon: AlertTriangle,
    weight: 10,
    validate: (draft) => {
      if (!Array.isArray(draft.steps)) return false;
      return draft.steps.some((s: Record<string, unknown>) => typeof s.fare === "number" && s.fare > 0);
    },
  },
  {
    id: "has_description",
    label: "Description",
    description: "Add a brief description of the route experience",
    icon: CheckCircle,
    weight: 10,
    validate: (draft) => typeof draft.description === "string" && draft.description.length >= 10,
  },
];
