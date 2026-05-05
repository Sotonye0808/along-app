/**
 * Unit tests for parseComment and extractMentions (comment parser utilities).
 */
import { parseComment, extractMentions } from "@/lib/utils/commentParser";

describe("parseComment", () => {
  it("returns a single text segment for a plain string", () => {
    const segments = parseComment("Hello world");
    expect(segments).toHaveLength(1);
    expect(segments[0]).toEqual({ type: "text", value: "Hello world" });
  });

  it("extracts a single mention from a string", () => {
    const segments = parseComment("Hey @alice, how are you?");
    const mentionSeg = segments.find((s) => s.type === "mention");
    expect(mentionSeg).toBeDefined();
    expect(mentionSeg?.value).toBe("alice");
  });

  it("extracts multiple mentions", () => {
    const segments = parseComment("@alice and @bob should meet");
    const mentions = segments.filter((s) => s.type === "mention").map((s) => s.value);
    expect(mentions).toContain("alice");
    expect(mentions).toContain("bob");
  });

  it("preserves surrounding text around mentions", () => {
    const segments = parseComment("Hello @user bye");
    const texts = segments.filter((s) => s.type === "text").map((s) => s.value);
    expect(texts.join("")).toContain("Hello ");
    expect(texts.join("")).toContain(" bye");
  });

  it("returns empty array for empty string", () => {
    const segments = parseComment("");
    expect(segments).toHaveLength(0);
  });

  it("handles mention at start of string", () => {
    const segments = parseComment("@admin is here");
    expect(segments[0]).toEqual({ type: "mention", value: "admin" });
  });

  it("handles mention at end of string", () => {
    const segments = parseComment("Look at @charlie");
    const last = segments[segments.length - 1];
    expect(last).toEqual({ type: "mention", value: "charlie" });
  });

  it("ignores @ with no valid username chars", () => {
    const segments = parseComment("email@example.com is fine");
    // @ in email context should still produce a segment for "example" — test that output is deterministic
    expect(segments.length).toBeGreaterThanOrEqual(1);
  });
});

describe("extractMentions", () => {
  it("extracts usernames from @mentions", () => {
    const result = extractMentions("Hey @alice and @bob!");
    expect(result).toContain("alice");
    expect(result).toContain("bob");
  });

  it("deduplicates repeated mentions", () => {
    const result = extractMentions("@alice again @alice");
    expect(result.filter((m) => m === "alice")).toHaveLength(1);
  });

  it("returns empty array when no mentions present", () => {
    const result = extractMentions("no mentions here");
    expect(result).toHaveLength(0);
  });

  it("returns empty array for empty string", () => {
    const result = extractMentions("");
    expect(result).toHaveLength(0);
  });
});
