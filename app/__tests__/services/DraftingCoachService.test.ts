import { draftingCoachService } from "@/app/lib/services/DraftingCoachService";

describe("DraftingCoachService", () => {
  describe("evaluate", () => {
    it("returns zero score for empty draft", () => {
      const result = draftingCoachService.evaluate({});
      expect(result.score).toBe(0);
      expect(result.passedCount).toBe(0);
      expect(result.totalCount).toBe(6);
      expect(result.nextSuggestion).not.toBeNull();
    });

    it("passes has_title when title is 5+ characters", () => {
      const result = draftingCoachService.evaluate({ title: "shrt" });
      const checkpoint = result.checkpoints.find((c) => c.id === "has_title");
      expect(checkpoint?.passed).toBe(false);

      const result2 = draftingCoachService.evaluate({ title: "Valid Title Here" });
      const checkpoint2 = result2.checkpoints.find((c) => c.id === "has_title");
      expect(checkpoint2?.passed).toBe(true);
    });

    it("passes has_steps when steps array has 2+ items", () => {
      const result = draftingCoachService.evaluate({ steps: [{ location: "A" }] });
      const checkpoint = result.checkpoints.find((c) => c.id === "has_steps");
      expect(checkpoint?.passed).toBe(false);

      const result2 = draftingCoachService.evaluate({
        steps: [{ location: "A" }, { location: "B" }],
      });
      const checkpoint2 = result2.checkpoints.find((c) => c.id === "has_steps");
      expect(checkpoint2?.passed).toBe(true);
    });

    it("passes has_images when images array is non-empty", () => {
      const result = draftingCoachService.evaluate({ images: [] });
      const checkpoint = result.checkpoints.find((c) => c.id === "has_images");
      expect(checkpoint?.passed).toBe(false);

      const result2 = draftingCoachService.evaluate({ images: ["url1"] });
      const checkpoint2 = result2.checkpoints.find((c) => c.id === "has_images");
      expect(checkpoint2?.passed).toBe(true);
    });

    it("passes has_tags when tags array has 2+ items", () => {
      const result = draftingCoachService.evaluate({ tags: ["lagos"] });
      const checkpoint = result.checkpoints.find((c) => c.id === "has_tags");
      expect(checkpoint?.passed).toBe(false);

      const result2 = draftingCoachService.evaluate({ tags: ["lagos", "ikeja"] });
      const checkpoint2 = result2.checkpoints.find((c) => c.id === "has_tags");
      expect(checkpoint2?.passed).toBe(true);
    });

    it("passes has_fare when at least one step has a fare > 0", () => {
      const result = draftingCoachService.evaluate({
        steps: [{ location: "A", fare: 0 }],
      });
      const checkpoint = result.checkpoints.find((c) => c.id === "has_fare");
      expect(checkpoint?.passed).toBe(false);

      const result2 = draftingCoachService.evaluate({
        steps: [{ location: "A", fare: 200 }],
      });
      const checkpoint2 = result2.checkpoints.find((c) => c.id === "has_fare");
      expect(checkpoint2?.passed).toBe(true);
    });

    it("passes has_description when description is 10+ characters", () => {
      const result = draftingCoachService.evaluate({ description: "too short" });
      const checkpoint = result.checkpoints.find((c) => c.id === "has_description");
      expect(checkpoint?.passed).toBe(false);

      const result2 = draftingCoachService.evaluate({
        description: "long enough description text",
      });
      const checkpoint2 = result2.checkpoints.find((c) => c.id === "has_description");
      expect(checkpoint2?.passed).toBe(true);
    });

    it("returns full score for a complete draft", () => {
      const result = draftingCoachService.evaluate({
        title: "Yaba to CMS via Third Mainland",
        steps: [
          { location: "Yaba", description: "Start at Unilag gate", fare: 200, vehicle: "taxi" },
          { location: "CMS", description: "Final stop at Marina", fare: 150, vehicle: "keke" },
        ],
        images: ["https://example.com/photo.jpg"],
        tags: ["lagos", "transport"],
        description: "Quick route through Third Mainland Bridge during off-peak hours.",
      });
      expect(result.passedCount).toBe(6);
      expect(result.score).toBe(result.maxScore);
      expect(result.nextSuggestion).toBeNull();
    });

    it("returns correct nextSuggestion for partial draft", () => {
      const result = draftingCoachService.evaluate({
        title: "Yaba to CMS",
        steps: [{ location: "Yaba" }],
      });
      expect(result.nextSuggestion).toContain("Route Steps");
    });
  });

  describe("getScore", () => {
    it("returns 0 for empty draft", () => {
      expect(draftingCoachService.getScore({})).toBe(0);
    });

    it("returns max score for complete draft", () => {
      const score = draftingCoachService.getScore({
        title: "Yaba to CMS via Third Mainland",
        steps: [
          { location: "A", fare: 200 },
          { location: "B", fare: 150 },
        ],
        images: ["url"],
        tags: ["lagos", "transport"],
        description: "A long enough description here to pass.",
      });
      expect(score).toBeGreaterThan(0);
    });
  });

  describe("getNextSuggestion", () => {
    it("returns suggestion for empty draft", () => {
      expect(draftingCoachService.getNextSuggestion({})).not.toBeNull();
    });

    it("returns null for complete draft", () => {
      const suggestion = draftingCoachService.getNextSuggestion({
        title: "Yaba to CMS via Third Mainland",
        steps: [
          { location: "A", fare: 200 },
          { location: "B", fare: 150 },
        ],
        images: ["url"],
        tags: ["lagos", "transport"],
        description: "A long enough description here to pass.",
      });
      expect(suggestion).toBeNull();
    });
  });
});
