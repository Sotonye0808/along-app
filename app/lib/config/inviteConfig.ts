export interface InviteConfig {
    codeLength: number;
    maxInvitesPerDay: number;
    rewardPerAcceptedInvite: number;
    inviteUrlBasePath: string;
    expiryDays: number;
}

export const INVITE_CONFIG: InviteConfig = {
    codeLength: 8,
    maxInvitesPerDay: 10,
    rewardPerAcceptedInvite: 40,
    inviteUrlBasePath: "/invite",
    expiryDays: 14,
};
