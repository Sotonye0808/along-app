import { Bus, Train, Ship, Bike } from "lucide-react";
import type { TransportIntegrationConfig } from "@/app/lib/types";

export const TRANSPORT_INTEGRATION_REGISTRY: TransportIntegrationConfig[] = [
  {
    provider: "transact",
    label: "Transact",
    icon: Bus,
    baseUrl: "https://api.transact.ng",
    enabled: false,
  },
  {
    provider: "tega",
    label: "Tega Events",
    icon: Train,
    baseUrl: "https://api.tega.ng",
    enabled: false,
  },
  {
    provider: "waterways",
    label: "Waterways",
    icon: Ship,
    baseUrl: "",
    enabled: false,
  },
  {
    provider: "rideshare",
    label: "Ride Share",
    icon: Bike,
    baseUrl: "",
    enabled: false,
  },
];
