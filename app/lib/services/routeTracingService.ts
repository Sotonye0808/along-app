interface RoutePin {
  lat: number
  lng: number
}

interface TraceResult {
  polyline: string
  distance: number
  duration: number
}

class RouteTracingService {
  private baseUrl = 'https://api.openrouteservice.org/v2/directions/driving-car'
  private apiKey: string | null = null

  constructor() {
    this.apiKey = process.env.OPEN_ROUTE_SERVICE_KEY ?? null
  }

  async trace(pins: RoutePin[]): Promise<TraceResult> {
    if (pins.length < 2) {
      throw new Error('At least 2 pins required')
    }

    if (this.apiKey) {
      try {
        return await this.traceWithOpenRouteService(pins)
      } catch {
        return this.traceStraightLine(pins)
      }
    }

    return this.traceStraightLine(pins)
  }

  private async traceWithOpenRouteService(pins: RoutePin[]): Promise<TraceResult> {
    const coordinates = pins.map((p) => [p.lng, p.lat])

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: this.apiKey!,
      },
      body: JSON.stringify({
        coordinates,
        format: 'json',
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenRouteService error: ${response.status}`)
    }

    const data = await response.json()
    const route = data.routes?.[0]
    if (!route) throw new Error('No route found')

    const polyline = this.encodePolyline(route.geometry?.coordinates ?? [])
    const distance = route.summary?.distance
      ? Math.round(route.summary.distance / 1000 * 10) / 10
      : this.approximateDistance(pins)
    const duration = route.summary?.duration
      ? Math.round(route.summary.duration / 60)
      : Math.round(distance * 15)

    return { polyline, distance, duration }
  }

  private traceStraightLine(pins: RoutePin[]): TraceResult {
    const distance = this.approximateDistance(pins)
    const duration = Math.round(distance * 15)
    const polyline = this.encodePolyline(pins.map((p) => [p.lng, p.lat]))
    return { polyline, distance, duration }
  }

  private approximateDistance(pins: RoutePin[]): number {
    let total = 0
    for (let i = 1; i < pins.length; i++) {
      total += this.haversineDistance(pins[i - 1], pins[i])
    }
    return Math.round(total * 10) / 10
  }

  private haversineDistance(a: RoutePin, b: RoutePin): number {
    const R = 6371
    const dLat = this.toRad(b.lat - a.lat)
    const dLng = this.toRad(b.lng - a.lng)
    const sinLat = Math.sin(dLat / 2)
    const sinLng = Math.sin(dLng / 2)
    const aVal =
      sinLat * sinLat +
      Math.cos(this.toRad(a.lat)) * Math.cos(this.toRad(b.lat)) * sinLng * sinLng
    const c = 2 * Math.atan2(Math.sqrt(aVal), Math.sqrt(1 - aVal))
    return R * c
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180
  }

  private encodePolyline(coords: number[][]): string {
    let result = ''
    let prevLat = 0
    let prevLng = 0

    for (const [lng, lat] of coords) {
      const dLat = Math.round((lat - prevLat) * 1e5)
      const dLng = Math.round((lng - prevLng) * 1e5)
      result += this.encodeSigned(dLat)
      result += this.encodeSigned(dLng)
      prevLat = lat
      prevLng = lng
    }

    return result
  }

  private encodeSigned(value: number): string {
    let v = value << 1
    if (value < 0) v = ~v
    let result = ''
    while (v >= 0x20) {
      result += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
      v >>= 5
    }
    result += String.fromCharCode(v + 63)
    return result
  }
}

export const routeTracingService = new RouteTracingService()
