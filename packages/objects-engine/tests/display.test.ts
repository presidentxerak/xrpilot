import { describe, expect, it } from "vitest";
import {
  formatObjectForShare,
  getCategoryIcon,
  getCategoryLabel,
  getIssuerDisplay,
  getObjectDescription,
  getObjectDisplayName,
} from "../src/display.js";
import type { DigitalObject, ObjectIssuer } from "../src/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeObject(overrides: Partial<DigitalObject> = {}): DigitalObject {
  return {
    id: "obj-1",
    tokenId: "obj-1",
    name: "Cool Object",
    description: "A very cool digital object",
    image: "https://example.com/cool.png",
    category: "collectible",
    issuer: { name: "Cool Corp", address: "rCoolCorp123456789", verified: false },
    utility: "",
    metadata: {},
    createdAt: "2026-01-01T00:00:00.000Z",
    transferable: true,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getCategoryLabel
// ---------------------------------------------------------------------------

describe("getCategoryLabel", () => {
  it("maps ticket to Event Ticket", () => {
    expect(getCategoryLabel("ticket")).toBe("Event Ticket");
  });

  it("maps coupon to Coupon", () => {
    expect(getCategoryLabel("coupon")).toBe("Coupon");
  });

  it("maps collectible to Collectible", () => {
    expect(getCategoryLabel("collectible")).toBe("Collectible");
  });

  it("maps pass to Access Pass", () => {
    expect(getCategoryLabel("pass")).toBe("Access Pass");
  });

  it("maps nft to Digital Collectible -- never shows the word NFT", () => {
    expect(getCategoryLabel("nft")).toBe("Digital Collectible");
    expect(getCategoryLabel("nft")).not.toContain("NFT");
  });
});

// ---------------------------------------------------------------------------
// getCategoryIcon
// ---------------------------------------------------------------------------

describe("getCategoryIcon", () => {
  it("returns icon identifiers for each category", () => {
    expect(getCategoryIcon("ticket")).toBe("ticket");
    expect(getCategoryIcon("coupon")).toBe("tag");
    expect(getCategoryIcon("collectible")).toBe("sparkles");
    expect(getCategoryIcon("pass")).toBe("key");
    expect(getCategoryIcon("nft")).toBe("image");
  });
});

// ---------------------------------------------------------------------------
// getObjectDisplayName
// ---------------------------------------------------------------------------

describe("getObjectDisplayName", () => {
  it("returns the object name when set", () => {
    expect(getObjectDisplayName(makeObject())).toBe("Cool Object");
  });

  it("falls back to category label when name is empty", () => {
    const obj = makeObject({ name: "" });
    expect(getObjectDisplayName(obj)).toBe("Collectible");
  });
});

// ---------------------------------------------------------------------------
// getObjectDescription
// ---------------------------------------------------------------------------

describe("getObjectDescription", () => {
  it("prefers utility over description", () => {
    const obj = makeObject({
      utility: "10% off next purchase",
      description: "A coupon",
    });
    expect(getObjectDescription(obj)).toBe("10% off next purchase");
  });

  it("falls back to description when utility is empty", () => {
    const obj = makeObject({ utility: "", description: "Some description" });
    expect(getObjectDescription(obj)).toBe("Some description");
  });

  it("returns empty string when both are missing", () => {
    const obj = makeObject({ utility: "", description: "" });
    expect(getObjectDescription(obj)).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getIssuerDisplay
// ---------------------------------------------------------------------------

describe("getIssuerDisplay", () => {
  it("shows name with checkmark for verified issuers", () => {
    const issuer: ObjectIssuer = {
      name: "Acme Corp",
      address: "rAcme",
      verified: true,
    };
    const display = getIssuerDisplay(issuer);
    expect(display).toBe("Acme Corp \u2713");
  });

  it("shows name without badge for unverified issuers", () => {
    const issuer: ObjectIssuer = {
      name: "Unknown Co",
      address: "rUnknown",
      verified: false,
    };
    expect(getIssuerDisplay(issuer)).toBe("Unknown Co");
  });

  it("falls back to shortened address when name is empty", () => {
    const issuer: ObjectIssuer = {
      name: "",
      address: "rN7jcR3TbXgKzVBPxdWfP4MBVG2qaFdoQs",
      verified: false,
    };
    const display = getIssuerDisplay(issuer);
    expect(display).toBe("rN7jcR...doQs");
  });
});

// ---------------------------------------------------------------------------
// formatObjectForShare
// ---------------------------------------------------------------------------

describe("formatObjectForShare", () => {
  it("produces a multi-line shareable text", () => {
    const obj = makeObject({
      name: "Golden Ticket",
      category: "ticket",
      utility: "Admit one",
      description: "Access to the event",
      issuer: { name: "Events Co", address: "rEvents", verified: true },
      collection: "Summer 2026",
    });

    const text = formatObjectForShare(obj);

    expect(text).toContain("Golden Ticket");
    expect(text).toContain("Event Ticket");
    expect(text).toContain("Admit one");
    expect(text).toContain("Access to the event");
    expect(text).toContain("Events Co");
    expect(text).toContain("Summer 2026");
  });

  it("omits collection line when not set", () => {
    const obj = makeObject({ collection: undefined });
    const text = formatObjectForShare(obj);
    expect(text).not.toContain("Collection:");
  });

  it("omits description when same as utility", () => {
    const obj = makeObject({
      utility: "Same text",
      description: "Same text",
    });
    const text = formatObjectForShare(obj);
    // Should only appear once (in the Utility line)
    const matches = text.match(/Same text/g);
    expect(matches).toHaveLength(1);
  });

  it("never contains the word NFT in user-facing output", () => {
    const obj = makeObject({ category: "nft" });
    const text = formatObjectForShare(obj);
    expect(text).not.toContain("NFT");
    expect(text).toContain("Digital Collectible");
  });
});
