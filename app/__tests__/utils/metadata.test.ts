import { buildMetadata } from "@/app/lib/utils/metadata";

describe("buildMetadata", () => {
  const defaultPath = "/test";
  const defaultTitle = "Test Page";
  const defaultDescription = "A test description for the page.";

  it("returns title with Along suffix", () => {
    const meta = buildMetadata({
      title: defaultTitle,
      description: defaultDescription,
      path: defaultPath,
    });
    expect(meta.title).toBe("Test Page | Along");
  });

  it("returns correct description", () => {
    const meta = buildMetadata({
      title: defaultTitle,
      description: defaultDescription,
      path: defaultPath,
    });
    expect(meta.description).toBe(defaultDescription);
  });

  it("sets canonical URL correctly", () => {
    const meta = buildMetadata({
      title: defaultTitle,
      description: defaultDescription,
      path: "/about",
    });
    expect(meta.alternates?.canonical).toContain("/about");
  });

  it("allows robots index when noIndex is false", () => {
    const meta = buildMetadata({
      title: defaultTitle,
      description: defaultDescription,
      path: defaultPath,
      noIndex: false,
    });
    expect(meta.robots).toEqual({ index: true, follow: true });
  });

  it("disables robots index when noIndex is true", () => {
    const meta = buildMetadata({
      title: defaultTitle,
      description: defaultDescription,
      path: defaultPath,
      noIndex: true,
    });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });

  it("includes OpenGraph data", () => {
    const meta = buildMetadata({
      title: defaultTitle,
      description: defaultDescription,
      path: defaultPath,
    });
    const og = meta.openGraph as Record<string, unknown>;
    expect(og.title).toContain("Test Page");
    expect(og.description).toBe(defaultDescription);
    expect(og.siteName).toBe("Along");
    expect(og.type).toBe("website");
  });

  it("includes Twitter card data", () => {
    const meta = buildMetadata({
      title: defaultTitle,
      description: defaultDescription,
      path: defaultPath,
    });
    const tw = meta.twitter as Record<string, unknown>;
    expect(tw.card).toBe("summary_large_image");
    expect(tw.title).toContain("Test Page");
    expect(tw.description).toBe(defaultDescription);
  });

  it("uses custom ogImage when provided", () => {
    const customImage = "/images/custom-og.jpg";
    const meta = buildMetadata({
      title: defaultTitle,
      description: defaultDescription,
      path: defaultPath,
      ogImage: customImage,
    });
    expect(meta.openGraph?.images).toEqual(
      expect.arrayContaining([expect.objectContaining({ url: customImage })])
    );
  });

  it("falls back to default ogImage", () => {
    const meta = buildMetadata({
      title: defaultTitle,
      description: defaultDescription,
      path: defaultPath,
    });
    expect(meta.openGraph?.images).toBeDefined();
  });
});
