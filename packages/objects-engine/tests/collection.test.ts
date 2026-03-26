import { describe, expect, it } from "vitest";
import { ObjectManager } from "../src/collection.js";
import type { DigitalObject } from "../src/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeObject(overrides: Partial<DigitalObject> = {}): DigitalObject {
  return {
    id: "token-001",
    tokenId: "token-001",
    name: "Test Object",
    description: "A test digital object",
    image: "https://example.com/img.png",
    category: "collectible",
    issuer: { name: "Test Issuer", address: "rIssuer1", verified: false },
    utility: "",
    metadata: {},
    createdAt: "2026-01-01T00:00:00.000Z",
    transferable: true,
    ...overrides,
  };
}

const objects: DigitalObject[] = [
  makeObject({
    id: "1",
    tokenId: "1",
    name: "Concert Ticket",
    category: "ticket",
    issuer: { name: "Live Nation", address: "rLiveNation", verified: true },
    collection: "Summer Tour",
  }),
  makeObject({
    id: "2",
    tokenId: "2",
    name: "20% Off Coupon",
    description: "Save on your next purchase",
    category: "coupon",
    issuer: { name: "Shop Co", address: "rShopCo", verified: false },
  }),
  makeObject({
    id: "3",
    tokenId: "3",
    name: "Rare Gem",
    category: "collectible",
    issuer: { name: "Live Nation", address: "rLiveNation", verified: true },
    collection: "Summer Tour",
  }),
  makeObject({
    id: "4",
    tokenId: "4",
    name: "VIP Pass",
    category: "pass",
    utility: "Backstage access",
    issuer: { name: "Live Nation", address: "rLiveNation", verified: true },
  }),
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ObjectManager", () => {
  const manager = new ObjectManager();

  describe("groupByCategory", () => {
    it("groups objects into their respective categories", () => {
      const groups = manager.groupByCategory(objects);

      expect(groups.ticket).toHaveLength(1);
      expect(groups.coupon).toHaveLength(1);
      expect(groups.collectible).toHaveLength(1);
      expect(groups.pass).toHaveLength(1);
      expect(groups.nft).toHaveLength(0);
    });

    it("returns empty arrays for unused categories", () => {
      const groups = manager.groupByCategory([]);
      expect(groups.ticket).toEqual([]);
      expect(groups.collectible).toEqual([]);
    });
  });

  describe("groupByCollection", () => {
    it("groups objects by collection name", () => {
      const collections = manager.groupByCollection(objects);
      const summerTour = collections.find((c) => c.name === "Summer Tour");

      expect(summerTour).toBeDefined();
      expect(summerTour!.objects).toHaveLength(2);
    });

    it("falls back to issuer address when no collection is set", () => {
      const collections = manager.groupByCollection(objects);
      const shopCo = collections.find((c) => c.id === "rShopCo");

      expect(shopCo).toBeDefined();
      expect(shopCo!.objects).toHaveLength(1);
      expect(shopCo!.objects[0].name).toBe("20% Off Coupon");
    });

    it("uses issuer address for objects without collection and no issuer name", () => {
      const noNameObjects = [
        makeObject({
          id: "x",
          tokenId: "x",
          issuer: { name: "", address: "rAnon", verified: false },
        }),
      ];
      const collections = manager.groupByCollection(noNameObjects);
      expect(collections[0].name).toBe("rAnon");
    });
  });

  describe("search", () => {
    it("finds objects by name", () => {
      const results = manager.search(objects, "concert");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Concert Ticket");
    });

    it("finds objects by description", () => {
      const results = manager.search(objects, "purchase");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("20% Off Coupon");
    });

    it("finds objects by issuer name", () => {
      const results = manager.search(objects, "Live Nation");
      expect(results).toHaveLength(3);
    });

    it("finds objects by utility", () => {
      const results = manager.search(objects, "backstage");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("VIP Pass");
    });

    it("returns all objects for empty query", () => {
      const results = manager.search(objects, "");
      expect(results).toHaveLength(objects.length);
    });

    it("returns empty array when nothing matches", () => {
      const results = manager.search(objects, "xyznonexistent");
      expect(results).toHaveLength(0);
    });

    it("is case-insensitive", () => {
      const results = manager.search(objects, "RARE GEM");
      expect(results).toHaveLength(1);
    });
  });

  describe("getObjects", () => {
    it("fetches, parses, and filters objects", async () => {
      const mockFetch = async () => [
        {
          NFTokenID: "tok1",
          Issuer: "rAddr",
          Flags: 0x0008,
          NFTokenTaxon: 0,
          nft_serial: 1,
        },
        {
          NFTokenID: "tok2",
          Issuer: "rAddr",
          Flags: 0x0008,
          NFTokenTaxon: 0,
          nft_serial: 2,
        },
      ];

      const result = await manager.getObjects(
        "rAccount",
        undefined,
        mockFetch,
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("tok1");
    });

    it("applies category filter", async () => {
      const mockFetch = async () => [
        {
          NFTokenID: "tok1",
          Issuer: "rAddr",
          URI: Buffer.from(
            JSON.stringify({ category: "ticket" }),
          ).toString("hex"),
          Flags: 0x0008,
          NFTokenTaxon: 0,
          nft_serial: 1,
        },
      ];

      const result = await manager.getObjects(
        "rAccount",
        { category: "coupon" },
        mockFetch,
      );
      expect(result).toHaveLength(0);
    });
  });
});
