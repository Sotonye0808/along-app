export interface AvatarConfig {
    style: string;
    seed: string;
    backgroundColor?: string;
    radius?: number;
    [key: string]: string | number | undefined;
}

export interface StyleOption {
    key: string;
    label: string;
    type: "color" | "select" | "boolean";
    options?: { value: string; label: string }[];
    colors?: string[];
}

export interface StyleConfig {
    key: string;
    label: string;
    options: StyleOption[];
    description: string;
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

export const AVATAR_STYLE_CONFIGS: Record<string, StyleConfig> = {
    adventurer: {
        key: "adventurer",
        label: "Adventurer",
        description: "Expressive cartoon-style avatars with a sense of adventure",
        options: [
            {
                key: "skin",
                label: "Skin tone",
                type: "color",
                colors: [
                    "#FDDBB4", "#EDCBB2", "#E8B796", "#D5936A",
                    "#B5654A", "#8B5A3C", "#6B4226", "#4A2E1A",
                ],
            },
            {
                key: "hair",
                label: "Hair color",
                type: "color",
                colors: [
                    "#000000", "#4A3728", "#7A4A2D", "#B5534C",
                    "#D4A574", "#C2B280", "#898070", "#B6B6B6",
                ],
            },
            {
                key: "hairLength",
                label: "Hair length",
                type: "select",
                options: [
                    { value: "short", label: "Short" },
                    { value: "medium", label: "Medium" },
                    { value: "long", label: "Long" },
                ],
            },
            {
                key: "top",
                label: "Headwear",
                type: "select",
                options: [
                    { value: "none", label: "None" },
                    { value: "hood", label: "Hood" },
                    { value: "shortHair", label: "Short Hair" },
                    { value: "longHair", label: "Long Hair" },
                    { value: "hat", label: "Hat" },
                ],
            },
            {
                key: "backgroundColor",
                label: "Background",
                type: "color",
                colors: [
                    "#dbeafe", "#dcfce7", "#fef9c3", "#fce7f3",
                    "#ede9fe", "#fee2e2", "#f0f9ff", "#f5f5f5",
                ],
            },
        ],
    },
    "adventurer-neutral": {
        key: "adventurer-neutral",
        label: "Adventurer Neutral",
        description: "Simplified adventurer style with neutral features",
        options: [
            {
                key: "skin",
                label: "Skin tone",
                type: "color",
                colors: [
                    "#FDDBB4", "#EDCBB2", "#E8B796", "#D5936A",
                    "#B5654A", "#8B5A3C", "#6B4226", "#4A2E1A",
                ],
            },
            {
                key: "hair",
                label: "Hair color",
                type: "color",
                colors: [
                    "#000000", "#4A3728", "#7A4A2D", "#B5534C",
                    "#D4A574", "#C2B280", "#898070", "#B6B6B6",
                ],
            },
            {
                key: "top",
                label: "Headwear",
                type: "select",
                options: [
                    { value: "none", label: "None" },
                    { value: "shortHair", label: "Short Hair" },
                    { value: "longHair", label: "Long Hair" },
                    { value: "bun", label: "Bun" },
                    { value: "turban", label: "Turban" },
                ],
            },
            {
                key: "backgroundColor",
                label: "Background",
                type: "color",
                colors: [
                    "#dbeafe", "#dcfce7", "#fef9c3", "#fce7f3",
                    "#ede9fe", "#fee2e2", "#f0f9ff", "#f5f5f5",
                ],
            },
        ],
    },
    avataaars: {
        key: "avataaars",
        label: "Avataaars",
        description: "Colorful vector avatars in a flat design style",
        options: [
            {
                key: "skinColor",
                label: "Skin tone",
                type: "color",
                colors: [
                    "#FDDBB4", "#EDCBB2", "#E8B796", "#D5936A",
                    "#B5654A", "#8B5A3C", "#6B4226", "#4A2E1A",
                ],
            },
            {
                key: "clothingColor",
                label: "Clothing color",
                type: "color",
                colors: [
                    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
                    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F",
                ],
            },
            {
                key: "hairColor",
                label: "Hair color",
                type: "color",
                colors: [
                    "#000000", "#4A3728", "#7A4A2D", "#B5534C",
                    "#D4A574", "#C2B280", "#898070", "#B6B6B6",
                ],
            },
            {
                key: "topType",
                label: "Top style",
                type: "select",
                options: [
                    { value: "noHair", label: "None" },
                    { value: "shortHair", label: "Short Hair" },
                    { value: "longHair", label: "Long Hair" },
                    { value: "eyebrowHeart", label: "Heart" },
                    { value: "hat", label: "Hat" },
                    { value: "turban", label: "Turban" },
                ],
            },
            {
                key: "backgroundColor",
                label: "Background",
                type: "color",
                colors: [
                    "#dbeafe", "#dcfce7", "#fef9c3", "#fce7f3",
                    "#ede9fe", "#fee2e2", "#f0f9ff", "#f5f5f5",
                ],
            },
        ],
    },
    bottts: {
        key: "bottts",
        label: "Bottts",
        description: "Cute robot avatars with customizable colors",
        options: [
            {
                key: "primaryColor",
                label: "Primary color",
                type: "color",
                colors: [
                    "#3949ab", "#00897b", "#6d4c41", "#546e7a",
                    "#d32f2f", "#7b1fa2", "#0288d1", "#388e3c",
                ],
            },
            {
                key: "secondaryColor",
                label: "Secondary color",
                type: "color",
                colors: [
                    "#7986cb", "#4db6ac", "#8d6e63", "#78909c",
                    "#ef5350", "#ba68c8", "#29b6f6", "#66bb6a",
                ],
            },
            {
                key: "mouthType",
                label: "Mouth style",
                type: "select",
                options: [
                    { value: "smile", label: "Smile" },
                    { value: "grid", label: "Grid" },
                    { value: "dot", label: "Dot" },
                ],
            },
            {
                key: "backgroundColor",
                label: "Background",
                type: "color",
                colors: [
                    "#dbeafe", "#dcfce7", "#fef9c3", "#fce7f3",
                    "#ede9fe", "#fee2e2", "#f0f9ff", "#f5f5f5",
                ],
            },
        ],
    },
    "fun-emoji": {
        key: "fun-emoji",
        label: "Fun Emoji",
        description: "Playful emoji-style avatars with expressive faces",
        options: [
            {
                key: "skinTone",
                label: "Skin tone",
                type: "color",
                colors: [
                    "#FDDBB4", "#EDCBB2", "#E8B796", "#D5936A",
                    "#B5654A", "#8B5A3C", "#6B4226", "#4A2E1A",
                ],
            },
            {
                key: "mouthType",
                label: "Expression",
                type: "select",
                options: [
                    { value: "smile", label: "Happy" },
                    { value: "laugh", label: "Laughing" },
                    { value: "surprised", label: "Surprised" },
                    { value: "cool", label: "Cool" },
                ],
            },
            {
                key: "backgroundColor",
                label: "Background",
                type: "color",
                colors: [
                    "#dbeafe", "#dcfce7", "#fef9c3", "#fce7f3",
                    "#ede9fe", "#fee2e2", "#f0f9ff", "#f5f5f5",
                ],
            },
        ],
    },
    lorelei: {
        key: "lorelei",
        label: "Lorelei",
        description: "Elegant female-style avatars with detailed features",
        options: [
            {
                key: "skin",
                label: "Skin tone",
                type: "color",
                colors: [
                    "#FDDBB4", "#EDCBB2", "#E8B796", "#D5936A",
                    "#B5654A", "#8B5A3C", "#6B4226", "#4A2E1A",
                ],
            },
            {
                key: "hairColor",
                label: "Hair color",
                type: "color",
                colors: [
                    "#000000", "#4A3728", "#7A4A2D", "#B5534C",
                    "#D4A574", "#C2B280", "#898070", "#B6B6B6",
                ],
            },
            {
                key: "hairTop",
                label: "Hair top",
                type: "select",
                options: [
                    { value: "none", label: "None" },
                    { value: "shortHair", label: "Short Hair" },
                    { value: "longHair", label: "Long Hair" },
                    { value: "bun", label: "Bun" },
                    { value: "curvy", label: "Curvy" },
                ],
            },
            {
                key: "backgroundColor",
                label: "Background",
                type: "color",
                colors: [
                    "#dbeafe", "#dcfce7", "#fef9c3", "#fce7f3",
                    "#ede9fe", "#fee2e2", "#f0f9ff", "#f5f5f5",
                ],
            },
        ],
    },
    micah: {
        key: "micah",
        label: "Micah",
        description: "Hand-drawn style avatars with organic shapes",
        options: [
            {
                key: "skin",
                label: "Skin tone",
                type: "color",
                colors: [
                    "#FDDBB4", "#EDCBB2", "#E8B796", "#D5936A",
                    "#B5654A", "#8B5A3C", "#6B4226", "#4A2E1A",
                ],
            },
            {
                key: "hair",
                label: "Hair color",
                type: "color",
                colors: [
                    "#000000", "#4A3728", "#7A4A2D", "#B5534C",
                    "#D4A574", "#C2B280", "#898070", "#B6B6B6",
                ],
            },
            {
                key: "top",
                label: "Top style",
                type: "select",
                options: [
                    { value: "none", label: "None" },
                    { value: "shortHair", label: "Short Hair" },
                    { value: "longHair", label: "Long Hair" },
                    { value: "bun", label: "Bun" },
                    { value: "turban", label: "Turban" },
                ],
            },
            {
                key: "backgroundColor",
                label: "Background",
                type: "color",
                colors: [
                    "#dbeafe", "#dcfce7", "#fef9c3", "#fce7f3",
                    "#ede9fe", "#fee2e2", "#f0f9ff", "#f5f5f5",
                ],
            },
        ],
    },
    "open-peeps": {
        key: "open-peeps",
        label: "Open Peeps",
        description: "Hand-illustrated style avatars in a minimal design",
        options: [
            {
                key: "skinTone",
                label: "Skin tone",
                type: "color",
                colors: [
                    "#FDDBB4", "#EDCBB2", "#E8B796", "#D5936A",
                    "#B5654A", "#8B5A3C", "#6B4226", "#4A2E1A",
                ],
            },
            {
                key: "hair",
                label: "Hair style",
                type: "select",
                options: [
                    { value: "none", label: "None" },
                    { value: "short", label: "Short" },
                    { value: "long", label: "Long" },
                    { value: "bun", label: "Bun" },
                    { value: "afro", label: "Afro" },
                ],
            },
            {
                key: "hairColor",
                label: "Hair color",
                type: "color",
                colors: [
                    "#000000", "#4A3728", "#7A4A2D", "#B5534C",
                    "#D4A574", "#C2B280", "#898070", "#B6B6B6",
                ],
            },
            {
                key: "backgroundColor",
                label: "Background",
                type: "color",
                colors: [
                    "#dbeafe", "#dcfce7", "#fef9c3", "#fce7f3",
                    "#ede9fe", "#fee2e2", "#f0f9ff", "#f5f5f5",
                ],
            },
        ],
    },
    "pixel-art": {
        key: "pixel-art",
        label: "Pixel Art",
        description: "Retro pixel-art style avatars for a nostalgic look",
        options: [
            {
                key: "skinTone",
                label: "Skin tone",
                type: "color",
                colors: [
                    "#FDDBB4", "#EDCBB2", "#E8B796", "#D5936A",
                    "#B5654A", "#8B5A3C", "#6B4226", "#4A2E1A",
                ],
            },
            {
                key: "hairColor",
                label: "Hair color",
                type: "color",
                colors: [
                    "#000000", "#4A3728", "#7A4A2D", "#B5534C",
                    "#D4A574", "#C2B280", "#898070", "#B6B6B6",
                ],
            },
            {
                key: "backgroundColor",
                label: "Background",
                type: "color",
                colors: [
                    "#dbeafe", "#dcfce7", "#fef9c3", "#fce7f3",
                    "#ede9fe", "#fee2e2", "#f0f9ff", "#f5f5f5",
                ],
            },
        ],
    },
};

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

export function buildAvatarUrlWithOptions(
    style: string,
    seed: string,
    options: Record<string, string>,
): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(options)) {
        if (value && value !== "none") {
            params.set(key, value);
        }
    }

    params.set("seed", encodeURIComponent(seed));

    return `${DICEBEAR_BASE_URL}/${style}/svg?${params.toString()}`;
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

export function getStyleConfig(style: string): StyleConfig | undefined {
    return AVATAR_STYLE_CONFIGS[style];
}

export function getAllStyles(): StyleConfig[] {
    return Object.values(AVATAR_STYLE_CONFIGS);
}