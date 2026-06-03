import { validityEngine } from "@/app/lib/services/ValidityEngine";

describe("ValidityEngine", () => {
  describe("evaluate", () => {
    it("returns correct score for zero votes and zero routes", async () => {
      const result = await validityEngine.evaluate({
        likes: 0,
        dislikes: 0,
        routeDetailScore: 0,
        similarityRatio: 0,
        createdAt: new Date(),
      });
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(["low", "developing", "verified", "trusted"]).toContain(result.tier);
    });

    it("returns trusted tier for maximum scores", async () => {
      const result = await validityEngine.evaluate({
        likes: 1000,
        dislikes: 0,
        routeDetailScore: 100,
        similarityRatio: 100,
        createdAt: new Date(),
      });
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.tier).toBe("trusted");
    });

    it("returns low tier for minimum engagement on 91-day old post", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 91);
      const result = await validityEngine.evaluate({
        likes: 0,
        dislikes: 0,
        routeDetailScore: 0,
        similarityRatio: 0,
        createdAt: oldDate,
      });
      expect(result.score).toBeLessThan(30);
      expect(result.tier).toBe("low");
    });

    it("clamps score to 0-100 range", async () => {
      const result = await validityEngine.evaluate({
        likes: 999999,
        dislikes: 0,
        routeDetailScore: 999,
        similarityRatio: 999,
        createdAt: new Date(),
      });
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it("returns verified tier for scores 60-79", async () => {
      const result = await validityEngine.evaluate({
        likes: 20,
        dislikes: 0,
        routeDetailScore: 30,
        similarityRatio: 30,
        createdAt: new Date(),
      });
      expect(result.tier).toBe("verified");
      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(result.score).toBeLessThanOrEqual(79);
    });

    it("calculates community score based on like ratio", async () => {
      const highRatio = await validityEngine.evaluate({
        likes: 100, dislikes: 0, routeDetailScore: 0, similarityRatio: 0, createdAt: new Date(),
      });
      const lowRatio = await validityEngine.evaluate({
        likes: 1, dislikes: 99, routeDetailScore: 0, similarityRatio: 0, createdAt: new Date(),
      });
      expect(highRatio.community).toBeGreaterThan(lowRatio.community);
    });

    it("decreases recency score for older posts", async () => {
      const now = new Date();
      const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const freshResult = await validityEngine.evaluate({
        likes: 0, dislikes: 0, routeDetailScore: 0, similarityRatio: 0, createdAt: now,
      });
      const oldResult = await validityEngine.evaluate({
        likes: 0, dislikes: 0, routeDetailScore: 0, similarityRatio: 0, createdAt: old,
      });
      expect(freshResult.recency).toBeGreaterThan(oldResult.recency);
    });

    it("increases detail score with better route detail", async () => {
      const highDetail = await validityEngine.evaluate({
        likes: 0, dislikes: 0, routeDetailScore: 100, similarityRatio: 0, createdAt: new Date(),
      });
      const lowDetail = await validityEngine.evaluate({
        likes: 0, dislikes: 0, routeDetailScore: 0, similarityRatio: 0, createdAt: new Date(),
      });
      expect(highDetail.detail).toBeGreaterThan(lowDetail.detail);
    });
  });

  describe("getTrustLevel", () => {
    it("returns low for score < 30", () => {
      expect(validityEngine.getTrustLevel(0)).toBe("low");
      expect(validityEngine.getTrustLevel(29)).toBe("low");
    });

    it("returns developing for score 30-59", () => {
      expect(validityEngine.getTrustLevel(30)).toBe("developing");
      expect(validityEngine.getTrustLevel(45)).toBe("developing");
      expect(validityEngine.getTrustLevel(59)).toBe("developing");
    });

    it("returns verified for score 60-79", () => {
      expect(validityEngine.getTrustLevel(60)).toBe("verified");
      expect(validityEngine.getTrustLevel(70)).toBe("verified");
      expect(validityEngine.getTrustLevel(79)).toBe("verified");
    });

    it("returns trusted for score >= 80", () => {
      expect(validityEngine.getTrustLevel(80)).toBe("trusted");
      expect(validityEngine.getTrustLevel(100)).toBe("trusted");
    });
  });
});
