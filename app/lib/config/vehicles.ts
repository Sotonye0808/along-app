import { Car, Bike, Tractor, Bus, PersonStanding, Truck } from "lucide-react";
import type { VehicleType, VehicleConfig } from "@/app/lib/types";

export const VEHICLE_REGISTRY: Record<VehicleType, VehicleConfig> = {
  taxi: {
    label: "Taxi",
    icon: Car,
    color: "#F59E0B",
    bgClass: "bg-yellow-50",
    textClass: "text-yellow-800",
  },
  bike: {
    label: "Bike",
    icon: Bike,
    color: "#EA580C",
    bgClass: "bg-orange-50",
    textClass: "text-orange-800",
  },
  keke: {
    label: "Keke",
    icon: Tractor,
    color: "#16A34A",
    bgClass: "bg-green-50",
    textClass: "text-green-800",
  },
  bus: {
    label: "Bus",
    icon: Bus,
    color: "#2563EB",
    bgClass: "bg-blue-50",
    textClass: "text-blue-800",
  },
  trekking: {
    label: "Trekking",
    icon: PersonStanding,
    color: "#374151",
    bgClass: "bg-gray-50",
    textClass: "text-gray-700",
  },
  car: {
    label: "Car",
    icon: Car,
    color: "#4338CA",
    bgClass: "bg-indigo-50",
    textClass: "text-indigo-800",
  },
  bolt: {
    label: "Bolt Ride",
    icon: Truck,
    color: "#65A30D",
    bgClass: "bg-lime-50",
    textClass: "text-lime-800",
  },
};
