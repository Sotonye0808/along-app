import type { LucideIcon } from "lucide-react";
import { Bike, Bus, Car, PersonStanding, Truck } from "lucide-react";

export interface VehicleConfig {
    key: VehicleType;
    label: string;
    icon: LucideIcon;
    description: string;
}

export const VEHICLE_REGISTRY: Record<VehicleType, VehicleConfig> = {
    taxi: {
        key: "taxi",
        label: "Taxi",
        icon: Car,
        description: "Taxi and ride-share trips",
    },
    bike: {
        key: "bike",
        label: "Bike",
        icon: Bike,
        description: "Motorbike and bicycle route segments",
    },
    keke: {
        key: "keke",
        label: "Keke",
        icon: Truck,
        description: "Tricycle route segments",
    },
    bus: {
        key: "bus",
        label: "Bus",
        icon: Bus,
        description: "Bus and BRT route segments",
    },
    trekking: {
        key: "trekking",
        label: "Walk",
        icon: PersonStanding,
        description: "Walking route segments",
    },
    car: {
        key: "car",
        label: "Car",
        icon: Car,
        description: "Private car route segments",
    },
};
