import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/utils/auth-server";
import { siteConfigRepository } from "@/lib/db/SiteConfigRepository";

const bodySchema = z.object({
  key: z.enum(["validityConfig", "feedAlgorithm"]),
  value: z.record(z.string(), z.unknown()),
});

async function requireAdmin(request: NextRequest): Promise<string | NextResponse> {
  const authUser = await requireAuth(request);
  const user = await prisma.user.findUnique({
    where: { id: authUser },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return authUser;
}

/**
 * GET /api/admin/config?key=validityConfig
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const adminOrError = await requireAdmin(request);
  if (adminOrError instanceof NextResponse) return adminOrError;

  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  if (!key) {
    return NextResponse.json({ error: "Missing key" }, { status: 400 });
  }

  const value = await siteConfigRepository.get(key);
  return NextResponse.json({ key, value });
}

/**
 * POST /api/admin/config
 * Upsert a site config entry.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const adminOrError = await requireAdmin(request);
  if (adminOrError instanceof NextResponse) return adminOrError;

  const body: unknown = await request.json();
  const { key, value } = bodySchema.parse(body);

  await siteConfigRepository.set(key, value);
  return NextResponse.json({ key, value });
}
