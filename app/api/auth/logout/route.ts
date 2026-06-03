import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/app/lib/utils/cookies";

export async function POST() {
  try {
    await clearAuthCookies();
    return NextResponse.json({ message: "Logged out" }, { status: 200 });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
