jest.mock("@/app/lib/db/prisma", () => ({
  prisma: {},
}));

import { rewardsService } from "@/app/lib/services/rewardsService";

describe("rewardsService.computeTier", () => {
  it("returns BRONZE for points below 500", () => {
    expect(rewardsService.computeTier(0)).toBe("BRONZE");
    expect(rewardsService.computeTier(499)).toBe("BRONZE");
  });

  it("returns SILVER at exactly 500 points", () => {
    expect(rewardsService.computeTier(500)).toBe("SILVER");
  });

  it("returns SILVER for points between 500 and 1999", () => {
    expect(rewardsService.computeTier(1000)).toBe("SILVER");
    expect(rewardsService.computeTier(1999)).toBe("SILVER");
  });

  it("returns GOLD at exactly 2000 points", () => {
    expect(rewardsService.computeTier(2000)).toBe("GOLD");
  });

  it("returns GOLD for points between 2000 and 4999", () => {
    expect(rewardsService.computeTier(3500)).toBe("GOLD");
    expect(rewardsService.computeTier(4999)).toBe("GOLD");
  });

  it("returns PLATINUM at exactly 5000 points", () => {
    expect(rewardsService.computeTier(5000)).toBe("PLATINUM");
  });

  it("returns PLATINUM for points above 5000", () => {
    expect(rewardsService.computeTier(10000)).toBe("PLATINUM");
    expect(rewardsService.computeTier(99999)).toBe("PLATINUM");
  });
});
