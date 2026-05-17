import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimitByIP } from "@/lib/utils/rateLimiter";
import { RouteTracingService } from "@/lib/services/RouteTracingService";

const traceSchema = z.object({
  startLat: z.number().min(-90).max(90),
  startLng: z.number().min(-180).max(180),
  endLat: z.number().min(-90).max(90),
  endLng: z.number().min(-180).max(180),
  vehicleType: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const clientIP = request.headers.get("x-forwarded-for") ?? "unknown";
  const rateLimit = await rateLimitByIP(clientIP, { maxRequests: 100, windowSeconds: 60 });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rateLimit.reset) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = traceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { startLat, startLng, endLat, endLng, vehicleType } = parsed.data;
  const result = RouteTracingService.trace(
    startLat,
    startLng,
    endLat,
    endLng,
    vehicleType,
  );

  return NextResponse.json(result);
}
