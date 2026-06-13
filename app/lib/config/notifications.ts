import { Heart, MessageCircle, UserPlus, AtSign, Star, Award, ShieldCheck } from "lucide-react";
import type { NotificationTypeConfig } from "@/app/lib/types";

type NotificationType = "LIKE" | "COMMENT" | "FOLLOW" | "MENTION" | "REWARD" | "BADGE" | "VERIFIED";

export const NOTIFICATION_REGISTRY: Record<NotificationType, NotificationTypeConfig> = {
  LIKE: {
    label: "Like",
    icon: Heart,
    color: "#EF4444",
    messageTemplate: "{actor} liked your post",
  },
  COMMENT: {
    label: "Comment",
    icon: MessageCircle,
    color: "#3B82F6",
    messageTemplate: "{actor} commented on your post",
  },
  FOLLOW: {
    label: "Follow",
    icon: UserPlus,
    color: "#10B981",
    messageTemplate: "{actor} started following you",
  },
  MENTION: {
    label: "Mention",
    icon: AtSign,
    color: "#8B5CF6",
    messageTemplate: "{actor} mentioned you in a comment",
  },
  REWARD: {
    label: "Reward",
    icon: Star,
    color: "#F59E0B",
    messageTemplate: "You earned {points} points!",
  },
  BADGE: {
    label: "Badge",
    icon: Award,
    color: "#F59E0B",
    messageTemplate: "You unlocked the {tier} badge!",
  },
  VERIFIED: {
    label: "Verified",
    icon: ShieldCheck,
    color: "#10B981",
    messageTemplate: "Your route has been verified",
  },
};
