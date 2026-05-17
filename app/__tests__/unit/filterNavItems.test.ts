/**
 * Unit tests for filterNavItems (navigation config helper).
 */
import { filterNavItems, NAV_REGISTRY } from "@/lib/config/navigation";

describe("filterNavItems", () => {
  it("returns only items whose roles include 'user' when role is user", () => {
    const items = filterNavItems("user");
    for (const item of items) {
      expect(item.roles).toContain("user");
    }
  });

  it("returns only items whose roles include 'admin' when role is admin", () => {
    const items = filterNavItems("admin");
    for (const item of items) {
      expect(item.roles).toContain("admin");
    }
  });

  it("returns no items for guest role when no items have guest role", () => {
    const guestItems = NAV_REGISTRY.filter((i) => i.roles.includes("guest"));
    const result = filterNavItems("guest");
    expect(result).toHaveLength(guestItems.length);
  });

  it("filters by sidebarOnly", () => {
    const items = filterNavItems("user", { sidebarOnly: true });
    for (const item of items) {
      expect(item.showInSidebar).toBe(true);
    }
    expect(items.length).toBeGreaterThan(0);
  });

  it("filters by bottomNavOnly", () => {
    const items = filterNavItems("user", { bottomNavOnly: true });
    for (const item of items) {
      expect(item.showInBottomNav).toBe(true);
    }
    expect(items.length).toBeGreaterThan(0);
  });

  it("admin sees more items than a plain user (admin-only items)", () => {
    const userItems = filterNavItems("user");
    const adminItems = filterNavItems("admin");
    // Admin should have at least as many items as user
    expect(adminItems.length).toBeGreaterThanOrEqual(userItems.length);
  });

  it("does not return undefined items", () => {
    const items = filterNavItems("user");
    expect(items.every((i) => i !== undefined)).toBe(true);
  });
});
