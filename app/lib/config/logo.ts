export interface LogoConfig {
  iconPath: string;
  wordmark: string;
  sizes: Record<string, number>;
  brandColor: string;
  logoUrl: string;
  iconUrl: string;
  ogImage: string;
}

export const LOGO_CONFIG: LogoConfig = {
  iconPath:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  wordmark: "Along",
  sizes: { sm: 24, md: 32, lg: 48, hero: 64 },
  brandColor: "#00623B",
  logoUrl: "/logo.svg",
  iconUrl: "/logo-icon.svg",
  ogImage: "/og-image.png",
};
