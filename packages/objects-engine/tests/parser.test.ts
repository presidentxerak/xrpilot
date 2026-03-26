import { describe, expect, it } from "vitest";
import {
  detectCategory,
  getObjectImage,
  parseNFToken,
  resolveIpfsUri,
} from "../src/parser.js";
import type { NFTMetadata, XrplNFT } from "../src/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNFT(overrides: Partial<XrplNFT> = {}): XrplNFT {
  return {
    NFTokenID: "00080000A407AF5856CDFAC6747BAE6B55E3C46F05A00000",
    Issuer: "rIssuerAddress123",
    URI: undefined,
    Flags: 0x0008, // transferable
    NFTokenTaxon: 0,
    nft_serial: 42,
    TransferFee: 0,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// resolveIpfsUri
// ---------------------------------------------------------------------------

describe("resolveIpfsUri", () => {
  it("converts ipfs:// protocol to gateway URL", () => {
    const result = resolveIpfsUri("ipfs://QmSomeHash123");
    expect(result).toBe("https://ipfs.io/ipfs/QmSomeHash123");
  });

  it("converts bare CID starting with Qm", () => {
    const result = resolveIpfsUri("QmSomeHash123");
    expect(result).toBe("https://ipfs.io/ipfs/QmSomeHash123");
  });

  it("converts bare CID starting with bafy", () => {
    const result = resolveIpfsUri("bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi");
    expect(result).toContain("https://ipfs.io/ipfs/bafy");
  });

  it("leaves HTTP URLs unchanged", () => {
    const url = "https://example.com/image.png";
    expect(resolveIpfsUri(url)).toBe(url);
  });
});

// ---------------------------------------------------------------------------
// detectCategory
// ---------------------------------------------------------------------------

describe("detectCategory", () => {
  it("returns explicit category when present", () => {
    expect(detectCategory({ category: "ticket" })).toBe("ticket");
    expect(detectCategory({ category: "coupon" })).toBe("coupon");
    expect(detectCategory({ category: "pass" })).toBe("pass");
    expect(detectCategory({ category: "nft" })).toBe("nft");
  });

  it("detects ticket from name keywords", () => {
    expect(detectCategory({ name: "Concert Ticket #12" })).toBe("ticket");
  });

  it("detects coupon from description keywords", () => {
    expect(detectCategory({ description: "20% discount voucher" })).toBe("coupon");
  });

  it("detects pass from utility keywords", () => {
    expect(detectCategory({ utility: "VIP membership access" })).toBe("pass");
  });

  it("detects collectible from keywords", () => {
    expect(detectCategory({ name: "Rare Art Collectible" })).toBe("collectible");
  });

  it("defaults to collectible when no signals found", () => {
    expect(detectCategory({ name: "Something Cool" })).toBe("collectible");
    expect(detectCategory({})).toBe("collectible");
  });
});

// ---------------------------------------------------------------------------
// getObjectImage
// ---------------------------------------------------------------------------

describe("getObjectImage", () => {
  it("resolves IPFS image to gateway URL", () => {
    const meta: NFTMetadata = { image: "ipfs://QmImageHash" };
    expect(getObjectImage(meta)).toBe("https://ipfs.io/ipfs/QmImageHash");
  });

  it("returns HTTP image URL as-is", () => {
    const meta: NFTMetadata = { image: "https://example.com/img.png" };
    expect(getObjectImage(meta)).toBe("https://example.com/img.png");
  });

  it("returns empty string when no image", () => {
    expect(getObjectImage({})).toBe("");
  });
});

// ---------------------------------------------------------------------------
// parseNFToken
// ---------------------------------------------------------------------------

describe("parseNFToken", () => {
  it("converts raw NFToken to a DigitalObject with prefetched metadata", async () => {
    const nft = makeNFT();
    const metadata: NFTMetadata = {
      name: "Golden Ticket",
      description: "Admit one to the chocolate factory",
      image: "https://example.com/ticket.png",
      category: "ticket",
      utility: "Entry to Wonka Factory",
      issuer_name: "Wonka Industries",
      collection: "Wonka 2026",
    };

    const obj = await parseNFToken(nft, metadata);

    expect(obj.id).toBe(nft.NFTokenID);
    expect(obj.tokenId).toBe(nft.NFTokenID);
    expect(obj.name).toBe("Golden Ticket");
    expect(obj.description).toBe("Admit one to the chocolate factory");
    expect(obj.image).toBe("https://example.com/ticket.png");
    expect(obj.category).toBe("ticket");
    expect(obj.issuer.name).toBe("Wonka Industries");
    expect(obj.issuer.address).toBe("rIssuerAddress123");
    expect(obj.utility).toBe("Entry to Wonka Factory");
    expect(obj.transferable).toBe(true);
    expect(obj.collection).toBe("Wonka 2026");
  });

  it("uses fallback name when metadata has no name", async () => {
    const nft = makeNFT({ nft_serial: 7 });
    const obj = await parseNFToken(nft, {});

    expect(obj.name).toBe("Object #7");
  });

  it("marks non-transferable when flag is missing", async () => {
    const nft = makeNFT({ Flags: 0 });
    const obj = await parseNFToken(nft, {});

    expect(obj.transferable).toBe(false);
  });

  it("flattens metadata values to strings", async () => {
    const nft = makeNFT();
    const metadata: NFTMetadata = {
      name: "Test",
      custom_number: 42 as unknown as string,
    };

    const obj = await parseNFToken(nft, metadata as NFTMetadata);
    expect(obj.metadata["custom_number"]).toBe("42");
  });
});
