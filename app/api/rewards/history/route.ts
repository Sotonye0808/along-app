import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/app/lib/utils/auth";
import { rewardsService } from "@/app/lib/services/rewardsService";

export async function GET() {
  try {
    const user = await getUserFromRequest();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const history = await rewardsService.getHistory(user.id as string, 10);
    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error("Rewards history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
