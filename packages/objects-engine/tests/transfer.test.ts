import { describe, expect, it } from "vitest";
import {
  prepareAcceptTransfer,
  prepareTransfer,
  toHumanReadable,
  toHumanReadableFromObject,
} from "../src/transfer.js";
import type { DigitalObject } from "../src/types.js";

// ---------------------------------------------------------------------------
// prepareTransfer
// ---------------------------------------------------------------------------

describe("prepareTransfer", () => {
  it("builds an NFTokenCreateOffer with zero amount", () => {
    const tx = prepareTransfer({
      objectId: "00080000ABCDEF",
      from: "rSender123",
      to: "rReceiver456",
    });

    expect(tx.TransactionType).toBe("NFTokenCreateOffer");
    expect(tx.Account).toBe("rSender123");
    expect(tx["NFTokenID"]).toBe("00080000ABCDEF");
    expect(tx["Destination"]).toBe("rReceiver456");
    expect(tx["Amount"]).toBe("0");
    expect(tx["Flags"]).toBe(1); // tfSellNFToken
  });
});

// ---------------------------------------------------------------------------
// prepareAcceptTransfer
// ---------------------------------------------------------------------------

describe("prepareAcceptTransfer", () => {
  it("builds an NFTokenAcceptOffer transaction", () => {
    const tx = prepareAcceptTransfer("OFFER123", "rBuyer789");

    expect(tx.TransactionType).toBe("NFTokenAcceptOffer");
    expect(tx.Account).toBe("rBuyer789");
    expect(tx["NFTokenSellOffer"]).toBe("OFFER123");
  });
});

// ---------------------------------------------------------------------------
// toHumanReadable
// ---------------------------------------------------------------------------

describe("toHumanReadable", () => {
  it("produces a user-friendly transfer summary", () => {
    const result = toHumanReadable("Golden Ticket", "rN7jcR3TbXgKzVBPxdWfP4MBVG2qaFdoQs");
    expect(result).toBe("You are sending Golden Ticket to rN7jcR...doQs");
  });

  it("handles short addresses without truncation", () => {
    const result = toHumanReadable("My Object", "rShort");
    expect(result).toBe("You are sending My Object to rShort");
  });
});

// ---------------------------------------------------------------------------
// toHumanReadableFromObject
// ---------------------------------------------------------------------------

describe("toHumanReadableFromObject", () => {
  it("extracts name from DigitalObject", () => {
    const obj: DigitalObject = {
      id: "1",
      tokenId: "1",
      name: "VIP Backstage Pass",
      description: "",
      image: "",
      category: "pass",
      issuer: { name: "Promoter", address: "rPromoter", verified: true },
      utility: "Backstage access",
      metadata: {},
      createdAt: "2026-01-01T00:00:00.000Z",
      transferable: true,
    };

    const result = toHumanReadableFromObject(obj, "rDestinationAddress123456");
    expect(result).toContain("VIP Backstage Pass");
    expect(result).toContain("rDesti");
  });
});
