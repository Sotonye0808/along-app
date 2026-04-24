export interface TeamMember {
    id: string;
    name: string;
    role: string;
    bio: string;
    avatarSeed: string;
    socials?: Array<{ label: string; href: string }>;
}

export const TEAM_MEMBERS: TeamMember[] = [
    {
        id: "alex-mercer",
        name: "Alex Mercer",
        role: "Product Lead",
        bio: "Drives product direction for route intelligence and community trust.",
        avatarSeed: "Alex Mercer",
    },
    {
        id: "ama-serwaa",
        name: "Ama Serwaa",
        role: "Design Lead",
        bio: "Builds cohesive cross-platform interaction systems and visual language.",
        avatarSeed: "Ama Serwaa",
    },
    {
        id: "kwame-osei",
        name: "Kwame Osei",
        role: "Engineering Lead",
        bio: "Owns platform architecture, reliability, and performance engineering.",
        avatarSeed: "Kwame Osei",
    },
];
