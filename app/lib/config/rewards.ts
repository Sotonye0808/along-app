import type { PointsAction } from "@/app/lib/types";

interface RewardTierConfig {
  label: string;
  minPoints: number;
  color: string;
  icon: string;
}

export const REWARD_TIERS: Record<string, RewardTierConfig> = {
  BRONZE: { label: "Bronze", minPoints: 0, color: "#CD7F32", icon: "Star" },
  SILVER: { label: "Silver", minPoints: 500, color: "#C0C0C0", icon: "Star" },
  GOLD: { label: "Gold", minPoints: 2000, color: "#FFD700", icon: "Award" },
  PLATINUM: { label: "Platinum", minPoints: 5000, color: "#E5E4E2", icon: "Trophy" },
};

export const POINTS_CONFIG: Record<string, PointsAction> = {
  CREATE_POST: { action: "Create route post", points: 50 },
  RECEIVE_LIKE: { action: "Receive a like", points: 5, cooldownHours: 0, maxPerDay: 100 },
  RECEIVE_BOOKMARK: { action: "Receive a bookmark", points: 10, cooldownHours: 0, maxPerDay: 50 },
  INVITE_SENT: { action: "Invite a friend", points: 20 },
  INVITE_ACCEPTED: { action: "Invite accepted", points: 100 },
  VERIFIED_POST: { action: "Post verified", points: 200 },
  DAILY_VISIT: { action: "Daily login", points: 5, cooldownHours: 24 },
};
