interface InviteConfig {
  maxInvitesPerUser: number;
  pointsForInviteSent: number;
  pointsForInviteAccepted: number;
  leaderboardCacheTtlSeconds: number;
}

export const INVITE_CONFIG: InviteConfig = {
  maxInvitesPerUser: 50,
  pointsForInviteSent: 20,
  pointsForInviteAccepted: 100,
  leaderboardCacheTtlSeconds: 600,
};
