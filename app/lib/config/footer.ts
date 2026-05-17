export interface FooterLink {
    label: string;
    href: string;
}

export interface FooterSection {
    title: string;
    links: FooterLink[];
}

export interface FooterConfig {
    brand: {
        name: string;
        tagline: string;
    };
    sections: FooterSection[];
    social: FooterLink[];
    devCredit: {
        label: string;
        href: string;
    };
}

export const FOOTER_CONFIG: FooterConfig = {
    brand: {
        name: "Along",
        tagline: "Navigate Together",
    },
    sections: [
        {
            title: "Product",
            links: [
                { label: "Explore", href: "/explore" },
                { label: "Share Route", href: "/home" },
                { label: "Notifications", href: "/notifications" },
            ],
        },
        {
            title: "Company",
            links: [
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
                { label: "Privacy", href: "/privacy" },
            ],
        },
    ],
    social: [
        { label: "X", href: "https://x.com/alongapp" },
        { label: "Instagram", href: "https://instagram.com/alongapp" },
        { label: "LinkedIn", href: "https://linkedin.com/company/alongapp" },
    ],
    devCredit: {
        label: "Built by S.D",
        href: "https://sotonye-dagogo.is-a.dev",
    },
};
