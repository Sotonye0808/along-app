import type { LucideIcon } from "lucide-react";
import { Bike, Bus, Car, MapPin, PersonStanding } from "lucide-react";

export interface TransportIntegrationConfig {
    key: string;
    label: string;
    icon: LucideIcon;
    provider: string;
    enabled: boolean;
    supportsFareEstimates: boolean;
    supportsRealtime: boolean;
}

export const TRANSPORT_INTEGRATION_REGISTRY: Record<string, TransportIntegrationConfig> = {
    danfo: {
        key: "danfo",
        label: "Danfo",
        icon: Bus,
        provider: "Along Community",
        enabled: true,
        supportsFareEstimates: true,
        supportsRealtime: true,
    },
    brt: {
        key: "brt",
        label: "BRT",
        icon: Bus,
        provider: "Transit Feeds",
        enabled: true,
        supportsFareEstimates: true,
        supportsRealtime: true,
    },
    rideshare: {
        key: "rideshare",
        label: "Ride Share",
        icon: Car,
        provider: "Partner API",
        enabled: true,
        supportsFareEstimates: true,
        supportsRealtime: true,
    },
    bike: {
        key: "bike",
        label: "Bike",
        icon: Bike,
        provider: "Community",
        enabled: true,
        supportsFareEstimates: false,
        supportsRealtime: false,
    },
    walking: {
        key: "walking",
        label: "Walking",
        icon: PersonStanding,
        provider: "Map Engine",
        enabled: true,
        supportsFareEstimates: false,
        supportsRealtime: true,
    },
    landmarks: {
        key: "landmarks",
        label: "Landmarks",
        icon: MapPin,
        provider: "Map Engine",
        enabled: true,
        supportsFareEstimates: false,
        supportsRealtime: false,
    },
};
