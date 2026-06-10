export interface LogoConfig {
  wordmark: string;
  sizes: Record<string, number>;
  brandColor: string;
  logoUrl: string;
  iconUrl: string;
  ogImage: string;
}

export const LOGO_CONFIG: LogoConfig = {
  wordmark: "Along",
  sizes: { sm: 24, md: 32, lg: 48, hero: 64 },
  brandColor: "#00623B",
  logoUrl: "/logo.svg",
  iconUrl: "/logo-icon.svg",
  ogImage: "/og-image.png",
};
