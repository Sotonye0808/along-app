export enum PointsAction {
    CREATE_POST = "CREATE_POST",
    RECEIVE_LIKE = "RECEIVE_LIKE",
    RECEIVE_COMMENT = "RECEIVE_COMMENT",
    VERIFY_ROUTE = "VERIFY_ROUTE",
    ADD_PHOTO = "ADD_PHOTO",
    INVITE_ACCEPTED = "INVITE_ACCEPTED",
}

export interface RewardTier {
    key: string;
    label: string;
    minPoints: number;
    badgeLabel: string;
    colorToken: string;
}

export interface PointsConfig {
    [PointsAction.CREATE_POST]: number;
    [PointsAction.RECEIVE_LIKE]: number;
    [PointsAction.RECEIVE_COMMENT]: number;
    [PointsAction.VERIFY_ROUTE]: number;
    [PointsAction.ADD_PHOTO]: number;
    [PointsAction.INVITE_ACCEPTED]: number;
}

export const REWARD_TIERS: RewardTier[] = [
    { key: "bronze", label: "Bronze", minPoints: 0, badgeLabel: "Developing", colorToken: "var(--color-warning-text)" },
    { key: "silver", label: "Silver", minPoints: 300, badgeLabel: "Verified", colorToken: "var(--color-success-text)" },
    { key: "gold", label: "Gold", minPoints: 900, badgeLabel: "Trusted", colorToken: "var(--color-primary)" },
    { key: "platinum", label: "Platinum", minPoints: 1800, badgeLabel: "Elite", colorToken: "var(--color-primary-dark)" },
];

export const POINTS_CONFIG: PointsConfig = {
    [PointsAction.CREATE_POST]: 15,
    [PointsAction.RECEIVE_LIKE]: 2,
    [PointsAction.RECEIVE_COMMENT]: 3,
    [PointsAction.VERIFY_ROUTE]: 20,
    [PointsAction.ADD_PHOTO]: 8,
    [PointsAction.INVITE_ACCEPTED]: 40,
};
