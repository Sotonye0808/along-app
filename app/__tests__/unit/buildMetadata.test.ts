/**
 * Unit tests for buildMetadata (SEO metadata builder).
 */
import { buildMetadata, SITE_NAME, DEFAULT_OG_IMAGE } from "@/lib/utils/metadata";

describe("buildMetadata", () => {
  it("sets the title field", () => {
    const result = buildMetadata({ title: "Test Page" });
    expect(result.title).toBe("Test Page");
  });

  it("uses the provided description", () => {
    const result = buildMetadata({ title: "T", description: "Custom desc" });
    expect(result.description).toBe("Custom desc");
  });

  it("falls back to SITE_DESCRIPTION when no description provided", () => {
    const result = buildMetadata({ title: "T" });
    expect(typeof result.description).toBe("string");
    expect((result.description as string).length).toBeGreaterThan(0);
  });

  it("sets openGraph type", () => {
    const result = buildMetadata({ title: "T", type: "article" });
    expect(result.openGraph?.type).toBe("article");
  });

  it("defaults openGraph type to website", () => {
    const result = buildMetadata({ title: "T" });
    expect(result.openGraph?.type).toBe("website");
  });

  it("sets openGraph siteName to SITE_NAME", () => {
    const result = buildMetadata({ title: "T" });
    expect(result.openGraph?.siteName).toBe(SITE_NAME);
  });

  it("uses the provided image", () => {
    const result = buildMetadata({ title: "T", image: "/custom.png" });
    const images = result.openGraph?.images;
    const arr = Array.isArray(images) ? images : [];
    const first = arr[0];
    expect(typeof first === "object" && first !== null ? (first as { url: string }).url : "").toBe("/custom.png");
  });

  it("falls back to DEFAULT_OG_IMAGE when no image provided", () => {
    const result = buildMetadata({ title: "T" });
    const images = result.openGraph?.images;
    const arr = Array.isArray(images) ? images : [];
    const first = arr[0];
    const url = typeof first === "object" && first !== null ? (first as { url: string }).url : "";
    expect(url).toBe(DEFAULT_OG_IMAGE);
  });

  it("includes keywords when provided", () => {
    const result = buildMetadata({ title: "T", keywords: ["travel", "routes"] });
    expect(result.keywords).toEqual(["travel", "routes"]);
  });

  it("sets twitter card type", () => {
    const result = buildMetadata({ title: "T", card: "summary" });
    expect(result.twitter?.card).toBe("summary");
  });

  it("defaults twitter card to summary_large_image", () => {
    const result = buildMetadata({ title: "T" });
    expect(result.twitter?.card).toBe("summary_large_image");
  });
});
