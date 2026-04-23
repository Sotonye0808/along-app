export interface AvatarConfig {
    style: string;
    seed: string;
    backgroundColor?: string;
    radius?: number;
}

export const DICEBEAR_BASE_URL = "https://api.dicebear.com/9.x";

export const AVATAR_STYLES = [
    "adventurer",
    "adventurer-neutral",
    "avataaars",
    "bottts",
    "fun-emoji",
    "lorelei",
    "micah",
    "open-peeps",
    "pixel-art",
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number];

export function buildAvatarUrl(config: AvatarConfig): string {
    const params = new URLSearchParams();

    if (config.backgroundColor) {
        params.set("backgroundColor", config.backgroundColor.replace("#", ""));
    }

    if (typeof config.radius === "number") {
        params.set("radius", String(config.radius));
    }

    return `${DICEBEAR_BASE_URL}/${config.style}/svg?seed=${encodeURIComponent(config.seed)}&${params.toString()}`;
}

export function getFallbackAvatarUrl(seed: string): string {
    const fallbackConfig: AvatarConfig = {
        style: "adventurer-neutral",
        seed,
        backgroundColor: "dbeafe",
        radius: 50,
    };

    return buildAvatarUrl(fallbackConfig);
}
