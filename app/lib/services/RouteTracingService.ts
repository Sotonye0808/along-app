/**
 * RouteTracingService
 *
 * Server-side service for computing route geometry metadata:
 * distance, estimated travel time, bounding box, and geographic center.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface RouteGeoResult {
  distanceKm: number;
  estimatedMins: number;
  boundingBox: BoundingBox;
  center: LatLng;
}

/**
 * Average travel speeds in km/h by vehicle type (conservative urban estimates)
 */
const SPEED_KMH: Record<string, number> = {
  taxi: 25,
  car: 25,
  bus: 20,
  brt: 30,
  keke: 18,
  bike: 22,
  trekking: 5,
  default: 20,
};

export class RouteTracingService {
  /**
   * Compute the straight-line distance between two coordinates (Haversine formula).
   */
  static computeDistanceKm(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  /**
   * Estimate travel time in minutes based on distance and vehicle type.
   * Adds a 20% urban congestion factor.
   */
  static estimateTravelMins(
    distanceKm: number,
    vehicleType: string = "default",
  ): number {
    const speed = SPEED_KMH[vehicleType] ?? SPEED_KMH.default;
    const rawMins = (distanceKm / speed) * 60;
    const congestionFactor = 1.2;
    return Math.ceil(rawMins * congestionFactor);
  }

  /**
   * Compute the bounding box that contains both start and end points,
   * with a small padding (0.01 degrees ≈ 1.1 km).
   */
  static computeBoundingBox(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    paddingDeg = 0.01,
  ): BoundingBox {
    return {
      north: Math.max(startLat, endLat) + paddingDeg,
      south: Math.min(startLat, endLat) - paddingDeg,
      east: Math.max(startLng, endLng) + paddingDeg,
      west: Math.min(startLng, endLng) - paddingDeg,
    };
  }

  /**
   * Compute the geographic midpoint between two coordinates.
   */
  static computeCenter(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): LatLng {
    return {
      lat: (lat1 + lat2) / 2,
      lng: (lng1 + lng2) / 2,
    };
  }

  /**
   * Full trace computation from start to end coordinates.
   * Returns distance, estimated travel time, bounding box, and center.
   */
  static trace(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
    vehicleType: string = "default",
  ): RouteGeoResult {
    const distanceKm = RouteTracingService.computeDistanceKm(
      startLat,
      startLng,
      endLat,
      endLng,
    );
    const estimatedMins = RouteTracingService.estimateTravelMins(
      distanceKm,
      vehicleType,
    );
    const boundingBox = RouteTracingService.computeBoundingBox(
      startLat,
      startLng,
      endLat,
      endLng,
    );
    const center = RouteTracingService.computeCenter(
      startLat,
      startLng,
      endLat,
      endLng,
    );
    return { distanceKm, estimatedMins, boundingBox, center };
  }

  /**
   * Extract geo data from a Post and return whether it has usable coordinates.
   */
  static extractGeoFromPost(post: Pick<Post, "startLat" | "startLng" | "endLat" | "endLng">): {
    hasGeo: boolean;
    center: LatLng | null;
    bounds: BoundingBox | null;
  } {
    if (
      post.startLat == null ||
      post.startLng == null ||
      post.endLat == null ||
      post.endLng == null
    ) {
      return { hasGeo: false, center: null, bounds: null };
    }
    return {
      hasGeo: true,
      center: RouteTracingService.computeCenter(
        post.startLat,
        post.startLng,
        post.endLat,
        post.endLng,
      ),
      bounds: RouteTracingService.computeBoundingBox(
        post.startLat,
        post.startLng,
        post.endLat,
        post.endLng,
      ),
    };
  }
}
