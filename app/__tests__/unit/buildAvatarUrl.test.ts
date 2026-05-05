/**
 * Unit tests for buildAvatarUrl and getFallbackAvatarUrl (avatar config helpers).
 */
import {
  buildAvatarUrl,
  getFallbackAvatarUrl,
  DICEBEAR_BASE_URL,
  type AvatarConfig,
} from "@/lib/config/avatar";

describe("buildAvatarUrl", () => {
  it("builds a URL with the correct base, style and seed", () => {
    const config: AvatarConfig = { style: "bottts", seed: "testuser" };
    const url = buildAvatarUrl(config);
    expect(url).toContain(DICEBEAR_BASE_URL);
    expect(url).toContain("/bottts/svg");
    expect(url).toContain("seed=testuser");
  });

  it("encodes seed with special characters (percent-encoding)", () => {
    const config: AvatarConfig = { style: "adventurer", seed: "user with spaces" };
    const url = buildAvatarUrl(config);
    // encodeURIComponent uses %20, not +
    expect(url).toContain("seed=user%20with%20spaces");
  });

  it("appends backgroundColor param when provided", () => {
    const config: AvatarConfig = {
      style: "bottts",
      seed: "abc",
      backgroundColor: "#dbeafe",
    };
    const url = buildAvatarUrl(config);
    expect(url).toContain("backgroundColor=dbeafe");
  });

  it("strips leading # from backgroundColor", () => {
    const config: AvatarConfig = {
      style: "bottts",
      seed: "abc",
      backgroundColor: "#ff0000",
    };
    const url = buildAvatarUrl(config);
    expect(url).not.toContain("#ff0000");
    expect(url).toContain("backgroundColor=ff0000");
  });

  it("appends radius param when provided", () => {
    const config: AvatarConfig = { style: "bottts", seed: "abc", radius: 50 };
    const url = buildAvatarUrl(config);
    expect(url).toContain("radius=50");
  });

  it("does not append radius when not provided", () => {
    const config: AvatarConfig = { style: "bottts", seed: "abc" };
    const url = buildAvatarUrl(config);
    expect(url).not.toContain("radius=");
  });
});

describe("getFallbackAvatarUrl", () => {
  it("returns a URL containing the seed", () => {
    const url = getFallbackAvatarUrl("johndoe");
    expect(url).toContain("seed=johndoe");
  });

  it("always uses adventurer-neutral style", () => {
    const url = getFallbackAvatarUrl("anyone");
    expect(url).toContain("adventurer-neutral");
  });

  it("returns a valid URL string", () => {
    const url = getFallbackAvatarUrl("test");
    expect(() => new URL(url)).not.toThrow();
  });
});
